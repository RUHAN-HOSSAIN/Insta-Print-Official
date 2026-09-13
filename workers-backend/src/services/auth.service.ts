// services/auth.service.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Env, UserMetadata } from "../types";

// ─── Supabase clients ─────────────────────────────────────────────────────────

// anon key — public operations (signup, login, OTP verify)
export function getSupabaseAnon(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
}

// service_role key — admin operations (wallet/roll lookup, metadata update)
export function getSupabaseAdmin(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Signup flow ──────────────────────────────────────────────────────────────

// Step 1: roll + email validate করে OTP পাঠাও
export async function requestSignupOtp(
  env: Env,
  roll: number,
  email: string,
): Promise<void> {
  const admin = getSupabaseAdmin(env);
  const normalizedEmail = email.trim().toLowerCase();

  const { data: existingWallet, error: walletCheckError } = await admin
    .from("user_wallets")
    .select("roll")
    .eq("roll", roll)
    .maybeSingle();

  if (walletCheckError) throw new Error("Unable to check existing accounts.");
  if (existingWallet) {
    throw new Error(
      "This Student ID is already registered. Please log in instead.",
    );
  }

  const supabase = getSupabaseAnon(env);
  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
      data: { roll } as Partial<UserMetadata>,
    },
  });

  if (error) throw new Error(error.message);
}

// Step 2: OTP verify করো
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

// Step 3: Signup complete — name, password, gender, hall save করো + wallet+roll row বানাও
// Step 3: Signup complete — userId directly পাওয়া যায়, কোনো lookup/loop লাগে না
export async function completeSignup(
  env: Env,
  userId: string,
  roll: number,
  email: string,
  password: string,
  name: string,
  gender: "male" | "female",
  preferredHallId: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: UserMetadata & { id: string; email: string; wallet_balance: number };
}> {
  const admin = getSupabaseAdmin(env);
  const normalizedEmail = email.trim().toLowerCase();

  const metadata: UserMetadata = {
    roll,
    name,
    gender,
    preferred_hall_id: preferredHallId,
  };
  const { data: updated, error: updateError } =
    await admin.auth.admin.updateUserById(userId, {
      password,
      user_metadata: metadata,
      email_confirm: true,
    });

  if (updateError || !updated.user)
    throw new Error(updateError?.message ?? "Signup failed");

  const { error: walletError } = await admin
    .from("user_wallets")
    .insert({
      user_id: userId,
      name: name.trim(),
      roll,
      balance: 0,
      email: normalizedEmail,
    });

  if (walletError) {
    if (walletError.code === "23505") {
      throw new Error("This Student ID is already registered.");
    }
    throw new Error("Unable to create wallet");
  }

  const { data: session, error: sessionError } = await getSupabaseAnon(
    env,
  ).auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (sessionError || !session.session)
    throw new Error("Signup complete but login failed");

  return {
    accessToken: session.session.access_token,
    refreshToken: session.session.refresh_token,
    user: {
      id: userId,
      email: normalizedEmail,
      wallet_balance: 0,
      ...metadata,
    },
  };
}

// ─── Login flow ───────────────────────────────────────────────────────────────

export async function loginUser(
  env: Env,
  identifier: string, // roll (7 digit) অথবা email
  password: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: UserMetadata & { id: string; email: string; wallet_balance: number };
}> {
  const admin = getSupabaseAdmin(env);
  const normalizedIdentifier = identifier.trim();
  let email = normalizedIdentifier.toLowerCase();

  if (/^\d{7}$/.test(normalizedIdentifier)) {
    // roll দিয়ে user_wallets থেকে সরাসরি user_id বের করো — fast, indexed, কোনো listUsers লাগে না
    const { data: walletRow, error: walletError } = await admin
      .from("user_wallets")
      .select("email")
      .eq("roll", Number(identifier))
      .maybeSingle();

    if (walletError || !walletRow) {
      throw new Error("No account found with this Student ID.");
    }

    email = walletRow.email;
  }

  const supabase = getSupabaseAnon(env);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    throw new Error("Incorrect password or account not found.");
  }

  const { data: wallet, error: walletError } = await admin
    .from("user_wallets")
    .select("balance")
    .eq("user_id", data.user.id)
    .single();

  if (walletError || !wallet) {
    throw new Error("Account wallet is not available. Please contact support.");
  }

  const metadata = data.user.user_metadata as UserMetadata;

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email!,
      wallet_balance: Number(wallet.balance),
      ...metadata,
    },
  };
}

// ─── Forgot password flow ─────────────────────────────────────────────────────

export async function requestForgotOtp(env: Env, email: string): Promise<void> {
  const admin = getSupabaseAdmin(env);

  // user_wallets এ email আছে কিনা check — O(1), indexed
  const { data, error } = await admin
    .from("user_wallets")
    .select("user_id")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error || !data) {
    throw new Error("No account found with this email. Please sign up first.");
  }

  const supabase = getSupabaseAnon(env);
  const { error: otpError } = await supabase.auth.resetPasswordForEmail(email, {});
  if (otpError) throw new Error(otpError.message);
}

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

  return { accessToken: data.session.access_token };
}

export async function resetPassword(
  env: Env,
  accessToken: string,
  newPassword: string,
): Promise<void> {
  const anon = getSupabaseAnon(env);

  // Token থেকে user বের করো
  const { data, error: userError } = await anon.auth.getUser(accessToken);
  if (userError || !data.user)
    throw new Error("Invalid or expired reset token.");

  // Admin দিয়ে password update করো — session লাগে না
  const admin = getSupabaseAdmin(env);
  const { error } = await admin.auth.admin.updateUserById(data.user.id, {
    password: newPassword,
  });

  if (error) throw new Error(error.message);
}

// ─── Token verify ─────────────────────────────────────────────────────────────

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
