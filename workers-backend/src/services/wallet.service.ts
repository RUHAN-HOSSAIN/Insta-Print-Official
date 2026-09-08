// services/wallet.service.ts
import { Env } from "../types";
import { getSupabaseAdmin } from "./auth.service";
import { findUnusedPayment, markPaymentUsed } from "./payment.service";

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




// Atomic deduction — Postgres function দিয়ে race condition safe
export async function deductWalletBalance(
  env: Env,
  userId: string,
  amount: number,
): Promise<number> {
  const admin = getSupabaseAdmin(env);

  const { data, error } = await admin.rpc("deduct_wallet_balance", {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) throw new Error(error.message);
  return Number(data);
}

// Top-up — mfs_transactions verify করে balance বাড়াও
export async function createTopUpRequest(
  env: Env,
  userId: string,
  txnId: string,
): Promise<number> {
  const admin = getSupabaseAdmin(env);

  const payment = await findUnusedPayment(env, txnId);

  // Atomic add — race condition safe
  const { data: newBalance, error } = await admin.rpc("add_wallet_balance", {
    p_user_id: userId,
    p_amount: Number(payment.amount),
  });

  if (error) throw new Error(error.message);

  await markPaymentUsed(env, payment.id, "top_up");

  return Number(newBalance);
}