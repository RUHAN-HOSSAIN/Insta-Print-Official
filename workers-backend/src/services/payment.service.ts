// services/payment.service.ts
import { Env } from "../types";
import { getSupabaseAdmin } from "./auth.service";

export interface MfsTransaction {
  id: string;
  provider: string;
  transaction_type: string;
  amount: number;
  trx_id: string;
  counterparty_identifier: string;
  status: string;
  use_for: string | null;
}

// bKash ও Nagad দুইটাই allow — provider check এখানে নেই intentionally
// transaction_type টা যা আসে সেটাই match করো — "receiveMoney" (bKash SMS parser এর format)
const VALID_RECEIVE_TYPES = ["receiveMoney", "Receive Money", "receive_money"];

export async function findUnusedPayment(
  env: Env,
  txnId: string,
): Promise<MfsTransaction> {
  const admin = getSupabaseAdmin(env);

  const { data, error } = await admin
    .from("mfs_transactions")
    .select("id, provider, transaction_type, amount, trx_id, counterparty_identifier, status, use_for")
    .eq("trx_id", txnId.trim())
    .eq("status", "not_used")
    .maybeSingle();

  if (error) throw new Error("Unable to verify payment");
  if (!data) throw new Error("Payment not found or already used");

  // transaction_type check — case insensitive, multiple format support
  if (!VALID_RECEIVE_TYPES.includes(data.transaction_type)) {
    throw new Error("Invalid transaction type. Only received payments are accepted.");
  }

  return data as MfsTransaction;
}

export async function markPaymentUsed(
  env: Env,
  mfsId: string,
  useFor: "direct_print" | "top_up",
): Promise<void> {
  const admin = getSupabaseAdmin(env);

  const { error } = await admin
    .from("mfs_transactions")
    .update({ status: "used", use_for: useFor })
    .eq("id", mfsId)
    .eq("status", "not_used"); // race condition protection

  if (error) throw new Error("Unable to mark payment as used");
}

// amount যথেষ্ট কিনা — simple check
export function verifyPaymentAmount(paid: number, required: number): boolean {
  return Number(paid) >= required;
}

export function getPaymentComment(
  paid: number,
  calculated: number,
): string | null {
  const diff = Number(paid) - calculated;
  if (diff > 0) return `Overpaid by ৳${diff.toFixed(2)}`;
  if (diff < 0) return `Short by ৳${Math.abs(diff).toFixed(2)}`;
  return null;
}