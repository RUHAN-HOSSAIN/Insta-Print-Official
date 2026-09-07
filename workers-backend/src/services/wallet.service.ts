import { Env } from "../types";
import { getSupabaseAdmin } from "./auth.service";

// ─── Balance read ─────────────────────────────────────────────────────────────

export async function getWalletBalance(env: Env, userId: string): Promise<number> {
  const admin = getSupabaseAdmin(env);

  const { data, error } = await admin
    .from("user_wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new Error("Unable to read wallet balance");
  return Number(data.balance);
}

// ─── Balance deduct (print এ use) ─────────────────────────────────────────────

// Atomic deduction — balance কম থাকলে error throw করে
export async function deductWalletBalance(
  env: Env,
  userId: string,
  amount: number,
): Promise<number> {
  const admin = getSupabaseAdmin(env);

  // Current balance check
  const current = await getWalletBalance(env, userId);
  if (current < amount) {
    throw new Error(`Insufficient wallet balance. Available: ৳${current.toFixed(2)}`);
  }

  const newBalance = Number((current - amount).toFixed(2));

  const { error } = await admin
    .from("user_wallets")
    .update({ balance: newBalance })
    .eq("user_id", userId);

  if (error) throw new Error("Unable to deduct wallet balance");
  return newBalance;
}

// ─── Top-up request ───────────────────────────────────────────────────────────

// Top-up request store করো (admin approve করলে balance বাড়বে)
export async function createTopUpRequest(
  env: Env,
  userId: string,
  amount: number,
  txnId: string,
): Promise<void> {
  const admin = getSupabaseAdmin(env);

  // Payment table এ txn_id check করো — already used কিনা
  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("si_no, amount, status")
    .eq("txn_id", txnId.trim())
    .eq("status", "not_used")
    .maybeSingle();

  if (paymentError) throw new Error("Unable to verify payment");
  if (!payment) throw new Error("Payment not found or already used");
  if (Number(payment.amount) < amount) throw new Error("Payment amount is less than requested top-up");

  // Wallet balance বাড়াও
  const current = await getWalletBalance(env, userId);
  const newBalance = Number((current + Number(payment.amount)).toFixed(2));

  const { error: walletError } = await admin
    .from("user_wallets")
    .update({ balance: newBalance })
    .eq("user_id", userId);

  if (walletError) throw new Error("Unable to update wallet balance");

  // Payment mark as used
  const { error: paymentUpdateError } = await admin
    .from("payments")
    .update({ status: "used", use_for: "top_up" })
    .eq("si_no", payment.si_no);

  if (paymentUpdateError) throw new Error("Unable to mark payment as used");
}