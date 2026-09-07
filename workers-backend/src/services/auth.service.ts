import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Env, UserMetadata } from "../types";

// ─── Supabase clients ─────────────────────────────────────────────────────────

// anon key — public operations (signup, login, OTP verify)
export function getSupabaseAnon(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
}

// service_role key — admin operations (user lookup by roll, wallet update)
export function getSupabaseAdmin(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Signup flow ──────────────────────────────────────────────────────────────

// Step 1: roll + email validate করে OTP পাঠাও
// Supabase নিজেই OTP generate করে Resend দিয়ে পাঠাবে
export async function requestSignupOtp(
  env: Env,
  roll: number,
  email: string,
): Promise<void> {
  const supabase = getSupabaseAnon(env);

  // Email already registered কিনা check করো
  const admin = getSupabaseAdmin(env);
  const { data: existing } = await admin.auth.admin.listUsers();
  const alreadyExists = existing?.users?.some((u) => u.email === email);
  if (alreadyExists) throw new Error("This email is already registered.");

  // OTP পাঠাও — Supabase signInWithOtp signup এর জন্যও কাজ করে
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, // user না থাকলে create করবে (unconfirmed)
      data: { roll } as Partial<UserMetadata>, // roll টা temporarily store
    },
  });

  if (error) throw new Error(error.message);
}

// Step 2: OTP verify করো
// Supabase verify করবে, success হলে session দেবে
export async function verifySignupOtp(
  env: Env,
  email: string,
  otp: string,
): Promise<{ userId: string }> {
  const supabase = getSupabaseAnon(env);

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });

  if (error || !data.user) throw new Error(error?.message ?? "Invalid OTP");

  return { userId: data.user.id };
}

// Step 3: Signup complete — name, password, gender, hall save করো
export async function completeSignup(
  env: Env,
  roll: number,
  email: string,
  password: string,
  name: string,
  gender: "male" | "female",
  preferredHallId: string,
): Promise<{ accessToken: string; refreshToken: string; user: UserMetadata & { id: string; email: string; wallet_balance: number } }> {
  const admin = getSupabaseAdmin(env);

  // Email দিয়ে user খুঁজো (OTP verify এ create হয়েছে)
  const { data: listData, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw new Error("Unable to complete signup");

  const existingUser = listData?.users?.find((u) => u.email === email);
  if (!existingUser) throw new Error("Please verify your email OTP first.");

  // Password + metadata update করো
  const metadata: UserMetadata = { roll, name, gender, preferred_hall_id: preferredHallId };
  const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(
    existingUser.id,
    {
      password,
      user_metadata: metadata,
      email_confirm: true, // email confirmed mark করো
    },
  );

  if (updateError || !updated.user) throw new Error(updateError?.message ?? "Signup failed");

  // Wallet তৈরি করো
  const { error: walletError } = await admin
    .from("user_wallets")
    .insert({ user_id: existingUser.id, balance: 0 });

  if (walletError) throw new Error("Unable to create wallet");

  // Login করিয়ে token দাও
  const { data: session, error: sessionError } = await getSupabaseAnon(env).auth.signInWithPassword({
    email,
    password,
  });

  if (sessionError || !session.session) throw new Error("Signup complete but login failed");

  return {
    accessToken: session.session.access_token,
    refreshToken: session.session.refresh_token,
    user: {
      id: existingUser.id,
      email,
      wallet_balance: 0,
      ...metadata,
    },
  };
}

// ─── Login flow ───────────────────────────────────────────────────────────────

// Roll অথবা email দিয়ে login
export async function loginUser(
  env: Env,
  identifier: string, // roll (7 digit) অথবা email
  password: string,
): Promise<{ accessToken: string; refreshToken: string; user: UserMetadata & { id: string; email: string; wallet_balance: number } }> {
  const admin = getSupabaseAdmin(env);
  let email = identifier;

  // Identifier যদি roll number হয় (7 digit number)
  if (/^\d{7}$/.test(identifier)) {
    const roll = Number(identifier);

    // auth.users এর user_metadata তে roll match করে email বের করো
    const { data: listData, error } = await admin.auth.admin.listUsers();
    if (error) throw new Error("Unable to process login");

    const found = listData?.users?.find(
      (u) => (u.user_metadata as UserMetadata)?.roll === roll,
    );
    if (!found?.email) throw new Error("No account found with this Student ID.");
    email = found.email;
  }

  // Email + password দিয়ে Supabase login
  const supabase = getSupabaseAnon(env);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    throw new Error("Incorrect password or account not found.");
  }

  // Wallet balance আনো
  const { data: wallet } = await admin
    .from("user_wallets")
    .select("balance")
    .eq("user_id", data.user.id)
    .single();

  const metadata = data.user.user_metadata as UserMetadata;

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email!,
      wallet_balance: Number(wallet?.balance ?? 0),
      ...metadata,
    },
  };
}

// ─── Forgot password flow ─────────────────────────────────────────────────────

// Step 1: Email এ OTP পাঠাও
export async function requestForgotOtp(env: Env, email: string): Promise<void> {
  const supabase = getSupabaseAnon(env);

  // User exist করে কিনা check (security এর জন্য error না দেখিয়ে silently handle)
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // redirectTo না দিলে OTP mode তে কাজ করে
    // Resend SMTP configure থাকলে এটাই email পাঠাবে
  });

  // Security: error থাকলেও frontend কে জানাবো না (account exist করে কিনা বুঝতে না পারে)
  if (error) console.error("Forgot OTP error:", error.message);
}

// Step 2: Forgot OTP verify
export async function verifyForgotOtp(
  env: Env,
  email: string,
  otp: string,
): Promise<{ accessToken: string }> {
  const supabase = getSupabaseAnon(env);

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "recovery",
  });

  if (error || !data.session) throw new Error(error?.message ?? "Invalid OTP");

  // এই access token দিয়ে password reset করা যাবে
  return { accessToken: data.session.access_token };
}

// Step 3: নতুন password set করো
export async function resetPassword(
  env: Env,
  accessToken: string, // verifyForgotOtp থেকে পাওয়া token
  newPassword: string,
): Promise<void> {
  // এই token দিয়ে authenticated client বানাও
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

// ─── Token verify ─────────────────────────────────────────────────────────────

// Protected routes এ Bearer token validate করো
export async function verifyToken(
  env: Env,
  authHeader: string | undefined,
): Promise<{ userId: string; email: string; metadata: UserMetadata }> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.slice(7);
  const supabase = getSupabaseAnon(env);

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized");

  return {
    userId: data.user.id,
    email: data.user.email!,
    metadata: data.user.user_metadata as UserMetadata,
  };
}