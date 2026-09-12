import { Context } from "hono";
import { Env, UserMetadata } from "../types";
import { verifyToken, getSupabaseAdmin } from "../services/auth.service";
import { getWalletBalance, createTopUpRequest } from "../services/wallet.service";

const ok = (c: Context, data: unknown) => c.json(data, 200);
const err = (c: Context, message: string, status: 400 | 401 | 403 | 500 = 400) =>
  c.json({ error: message }, status);

// ─── GET /api/user/me ─────────────────────────────────────────────────────────
// Logged in user এর fresh data আনো (page refresh এ কাজে লাগে)
export async function handleGetMe(c: Context<{ Bindings: Env }>) {
  try {
    const { userId, email, metadata } = await verifyToken(c.env, c.req.header("Authorization"));
    const balance = await getWalletBalance(c.env, userId);

    return ok(c, {
      user: { id: userId, email, wallet_balance: balance, ...metadata },
    });
  } catch {
    return err(c, "Unauthorized", 401);
  }
}

// ─── POST /api/user/update-name ───────────────────────────────────────────────
// Body: { name: string }
export async function handleUpdateName(c: Context<{ Bindings: Env }>) {
  try {
    const { userId, metadata } = await verifyToken(c.env, c.req.header("Authorization"));
    const { name } = await c.req.json<{ name: string }>();

    if (!name?.trim()) return err(c, "Name cannot be empty.");

    const admin = getSupabaseAdmin(c.env);
    const { error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { ...metadata, name: name.trim() } satisfies UserMetadata,
    });

    if (error) throw new Error(error.message);
    return ok(c, { message: "Name updated.", name: name.trim() });
  } catch (error) {
    return err(c, error instanceof Error ? error.message : "Unable to update name");
  }
}

// ─── POST /api/user/update-password ──────────────────────────────────────────
// Body: { password: string }
// Note: এটা logged in user এর password change — forgot password থেকে আলাদা
export async function handleUpdatePassword(c: Context<{ Bindings: Env }>) {
  try {
    const { userId } = await verifyToken(c.env, c.req.header("Authorization"));
    const { password } = await c.req.json<{ password: string }>();

    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
      return err(c, "Password must be at least 6 characters with one letter and one digit.");
    }

    const admin = getSupabaseAdmin(c.env);
    const { error } = await admin.auth.admin.updateUserById(userId, { password });

    if (error) throw new Error(error.message);
    return ok(c, { message: "Password updated." });
  } catch (error) {
    return err(c, error instanceof Error ? error.message : "Unable to update password");
  }
}

// ─── POST /api/user/update-hall ───────────────────────────────────────────────
// Body: { preferred_hall_id: string }
export async function handleUpdateHall(c: Context<{ Bindings: Env }>) {
  try {
    const { userId, metadata } = await verifyToken(c.env, c.req.header("Authorization"));
    const { preferred_hall_id } = await c.req.json<{ preferred_hall_id: string }>();

    if (!preferred_hall_id) return err(c, "Hall ID is required.");

    const admin = getSupabaseAdmin(c.env);
    const { error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { ...metadata, preferred_hall_id } satisfies UserMetadata,
    });

    if (error) throw new Error(error.message);
    return ok(c, { message: "Preferred hall updated.", preferred_hall_id });
  } catch (error) {
    return err(c, error instanceof Error ? error.message : "Unable to update hall");
  }
}

// ─── POST /api/user/topup ─────────────────────────────────────────────────────
// Body: { txn_id: string }. The amount comes from the verified MFS transaction.
export async function handleTopUp(c: Context<{ Bindings: Env }>) {
  try {
    const { userId } = await verifyToken(c.env, c.req.header("Authorization"));
    const { txn_id } = await c.req.json<{ txn_id: string }>();

    if (!txn_id?.trim()) return err(c, "Transaction ID is required.");

    const newBalance = await createTopUpRequest(c.env, userId, txn_id);

    return ok(c, {
      message: "Wallet topped up successfully.",
      wallet_balance: newBalance,
    });
  } catch (error) {
    return err(c, error instanceof Error ? error.message : "Top-up failed");
  }
}