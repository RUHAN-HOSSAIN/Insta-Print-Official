import { Context } from "hono";
import { Env } from "../types";
import {
  requestSignupOtp,
  verifySignupOtp,
  completeSignup,
  loginUser,
  requestForgotOtp,
  verifyForgotOtp,
  resetPassword,
} from "../services/auth.service";

const ok = (c: Context, data: unknown) => c.json(data, 200);

const err = (
  c: Context,
  message: string,
  status: 400 | 401 | 404 | 409 | 500 = 400,
) => c.json({ error: message }, status);

// ─── Signup ───────────────────────────────────────────────────────────────────

// POST /api/auth/signup/request-otp
// Body: { roll: number, email: string }
export async function handleSignupRequestOtp(c: Context<{ Bindings: Env }>) {
  try {
    const { roll, email } = await c.req.json<{ roll: number; email: string }>();

    if (!roll || !/^\d{7}$/.test(String(roll))) {
      return err(c, "Student ID must be exactly 7 digits.");
    }
    if (!email || !email.includes("@")) {
      return err(c, "Please enter a valid email address.");
    }

    await requestSignupOtp(c.env, roll, email);
    return ok(c, { message: `OTP sent to ${email}` });
  } catch (error) {
    return err(
      c,
      error instanceof Error ? error.message : "Unable to send OTP",
    );
  }
}

// POST /api/auth/signup/verify-otp
// Body: { email: string, otp: string }
// POST /api/auth/signup/verify-otp
export async function handleSignupVerifyOtp(c: Context<{ Bindings: Env }>) {
  try {
    const { email, otp } = await c.req.json<{ email: string; otp: string }>();

    if (!email || !otp) return err(c, "Email and OTP are required.");

    const { userId } = await verifySignupOtp(c.env, email, otp);
    return ok(c, { message: "OTP verified.", user_id: userId });
  } catch (error) {
    return err(c, error instanceof Error ? error.message : "Invalid OTP");
  }
}

// POST /api/auth/signup/complete
// Body: { roll, email, password, name, gender, preferred_hall_id }
// POST /api/auth/signup/complete
export async function handleSignupComplete(c: Context<{ Bindings: Env }>) {
  try {
    const { user_id, roll, email, password, name, gender, preferred_hall_id } =
      await c.req.json<{
        user_id: string;
        roll: number;
        email: string;
        password: string;
        name: string;
        gender: "male" | "female";
        preferred_hall_id: string;
      }>();

    if (!user_id || !roll || !email || !password || !name || !gender) {
      return err(c, "All fields are required.");
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
      return err(
        c,
        "Password must be at least 6 characters with one letter and one digit.",
      );
    }

    const result = await completeSignup(
      c.env,
      user_id,
      roll,
      email,
      password,
      name,
      gender,
      preferred_hall_id,
    );

    return ok(c, {
      token: result.accessToken,
      refresh_token: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    return err(c, error instanceof Error ? error.message : "Signup failed");
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

// POST /api/auth/login
// Body: { identifier: string (roll or email), password: string }
export async function handleLogin(c: Context<{ Bindings: Env }>) {
  try {
    const { identifier, password } = await c.req.json<{
      identifier: string;
      password: string;
    }>();

    if (!identifier || !password) {
      return err(c, "Student ID/email and password are required.");
    }

    const result = await loginUser(c.env, identifier, password);

    return ok(c, {
      token: result.accessToken,
      refresh_token: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    return err(c, error instanceof Error ? error.message : "Login failed", 401);
  }
}

// ─── Forgot password ──────────────────────────────────────────────────────────

// POST /api/auth/forgot-password/request-otp
// Body: { email: string }
export async function handleForgotRequestOtp(c: Context<{ Bindings: Env }>) {
  try {
    const { email } = await c.req.json<{ email: string }>();
    if (!email) return err(c, "Email is required.");

    await requestForgotOtp(c.env, email);
    return ok(c, { message: "OTP sent to your email." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    const status = message.includes("No account") ? 404 : 400;
    return err(c, message, status as 400 | 404);
  }
}

// POST /api/auth/forgot-password/verify-otp
// Body: { email: string, otp: string }
export async function handleForgotVerifyOtp(c: Context<{ Bindings: Env }>) {
  try {
    const { email, otp } = await c.req.json<{ email: string; otp: string }>();
    if (!email || !otp) return err(c, "Email and OTP are required.");

    const { accessToken } = await verifyForgotOtp(c.env, email, otp);

    // এই token frontend এ store করবে, reset step এ পাঠাবে
    return ok(c, { reset_token: accessToken });
  } catch (error) {
    return err(c, error instanceof Error ? error.message : "Invalid OTP");
  }
}

// POST /api/auth/forgot-password/reset
// Body: { reset_token: string, password: string }
export async function handleResetPassword(c: Context<{ Bindings: Env }>) {
  try {
    const { reset_token, password } = await c.req.json<{
      reset_token: string;
      password: string;
    }>();

    if (!reset_token || !password)
      return err(c, "Token and password are required.");
    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
      return err(
        c,
        "Password must be at least 6 characters with one letter and one digit.",
      );
    }

    await resetPassword(c.env, reset_token, password);
    return ok(c, { message: "Password reset successful." });
  } catch (error) {
    return err(
      c,
      error instanceof Error ? error.message : "Password reset failed",
    );
  }
}
