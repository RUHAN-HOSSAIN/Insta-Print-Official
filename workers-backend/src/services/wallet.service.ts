// services/wallet.service.ts
import { Env } from "../types";
import { getSupabaseAdmin } from "./auth.service";
import { claimPayment, releasePayment } from "./payment.service";

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

// Top-up — mfs_transactions verify করে balance বাড়াও
export async function createTopUpRequest(
  env: Env,
  userId: string,
  txnId: string,
): Promise<number> {
  const admin = getSupabaseAdmin(env);

  const payment = await claimPayment(env, txnId);

  try {
    const { data: newBalance, error } = await admin.rpc("finalize_wallet_top_up", {
      p_mfs_id: payment.id,
      p_user_id: userId,
      p_amount: Number(payment.amount),
    });

    if (error) throw new Error(error.message);

    return Number(newBalance);
  } catch (error) {
    await releasePayment(env, payment.id);
    throw error;
  }
}