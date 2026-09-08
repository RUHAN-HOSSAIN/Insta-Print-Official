import { Hono } from "hono";
import { cors } from "hono/cors";
import { Env } from "./types";

// Existing controllers
import { getDeviceStatus } from "./controllers/device.controller";
import { submitPrintJob } from "./controllers/print.controller";
import { getSupabase } from "./services/supabase.service";
import { HallId } from "./config/constants";

// New auth + user controllers
import {
  handleSignupRequestOtp,
  handleSignupVerifyOtp,
  handleSignupComplete,
  handleLogin,
  handleForgotRequestOtp,
  handleForgotVerifyOtp,
  handleResetPassword,
} from "./controllers/auth.controller";

import {
  handleGetMe,
  handleUpdateName,
  handleUpdatePassword,
  handleUpdateHall,
  handleTopUp,
} from "./controllers/user.controller";

const app = new Hono<{ Bindings: Env }>();

// ─── CORS ─────────────────────────────────────────────────────────────────────

app.use("*", cors({
    origin: (origin, c) => origin === c.env.FRONTEND_URL ? origin : "",
  }),
);

// app.use(
//   "*",
//   cors({
//     origin: (origin, c) => {
//       const allowedOrigins = [c.env.FRONTEND_URL, "http://localhost:5173"];
//       return allowedOrigins.includes(origin) ? origin : "";
//     },
//   }),
// );

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/test-email", async (c) => {
  const supabase = getSupabase(c.env);

  const { data, error } = await supabase.auth.signInWithOtp({
    email: "ruhanhossain207@gmail.com",
  });

  if (error) {
    return c.json({ success: false, error: error.message }, 400);
  }

  return c.json({ success: true, message: "OTP sent successfully", data });
});

// ─── Existing routes (unchanged) ─────────────────────────────────────────────

app.get("/status", (c) => {
  const hallId = c.req.query("hallId") as HallId;
  return getDeviceStatus(c.env, hallId);
});

app.post("/print", (c) => submitPrintJob(c.req.raw, c.env));

// ─── Auth routes ──────────────────────────────────────────────────────────────

// Signup flow
app.post("/api/auth/signup/request-otp", handleSignupRequestOtp);
app.post("/api/auth/signup/verify-otp", handleSignupVerifyOtp);
app.post("/api/auth/signup/complete", handleSignupComplete);

// Login
app.post("/api/auth/login", handleLogin);

// Forgot password flow
app.post("/api/auth/forgot-password/request-otp", handleForgotRequestOtp);
app.post("/api/auth/forgot-password/verify-otp", handleForgotVerifyOtp);
app.post("/api/auth/forgot-password/reset", handleResetPassword);

// ─── User (protected) routes ──────────────────────────────────────────────────

app.get("/api/user/me", handleGetMe);
app.post("/api/user/update-name", handleUpdateName);
app.post("/api/user/update-password", handleUpdatePassword);
app.post("/api/user/update-hall", handleUpdateHall);
app.post("/api/user/topup", handleTopUp);

export default app;
