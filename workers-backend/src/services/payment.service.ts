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

export class PaymentStateError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "PAYMENT_NOT_FOUND"
      | "PAYMENT_ALREADY_USED"
      | "PAYMENT_PROCESSING"
      | "PAYMENT_CLAIM_FAILED"
      | "PAYMENT_TRANSITION_FAILED",
  ) {
    super(message);
    this.name = "PaymentStateError";
  }
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
    .maybeSingle();

  if (error) throw new Error("Unable to verify payment");
  if (!data) {
    throw new PaymentStateError(
      "Your payment information has not reached us yet. Please try again after some time.",
      "PAYMENT_NOT_FOUND",
    );
  }
  if (data.status === "used") {
    throw new PaymentStateError(
      "Printing has already been completed using this payment.",
      "PAYMENT_ALREADY_USED",
    );
  }
  if (data.status !== "not_used" || data.use_for !== null) {
    throw new PaymentStateError(
      "This payment is already being processed. Please try again later.",
      "PAYMENT_PROCESSING",
    );
  }

  // transaction_type check — case insensitive, multiple format support
  if (!VALID_RECEIVE_TYPES.includes(data.transaction_type)) {
    throw new Error("Invalid transaction type. Only received payments are accepted.");
  }

  return data as MfsTransaction;
}

export async function claimPayment(
  env: Env,
  txnId: string,
): Promise<MfsTransaction> {
  const admin = getSupabaseAdmin(env);
  const normalizedTxnId = txnId.trim();

  const { data: candidate, error: lookupError } = await admin
    .from("mfs_transactions")
    .select("id, status, use_for")
    .eq("trx_id", normalizedTxnId)
    .maybeSingle();

  if (lookupError) throw new PaymentStateError("Unable to verify payment", "PAYMENT_NOT_FOUND");
  if (!candidate) {
    throw new PaymentStateError(
      "Your payment data has not reached us yet. Please try again later.",
      "PAYMENT_NOT_FOUND",
    );
  }
  if (candidate.status === "used") {
    throw new PaymentStateError(
      "Printing has already been completed using this payment.",
      "PAYMENT_ALREADY_USED",
    );
  }
  if (candidate.status !== "not_used" || candidate.use_for !== null) {
    throw new PaymentStateError(
      "This payment is already being processed. Please try again later.",
      "PAYMENT_PROCESSING",
    );
  }

  const { data, error } = await admin
    .from("mfs_transactions")
    .update({ status: "processing" })
    .eq("id", candidate.id)
    .eq("status", "not_used")
    .is("use_for", null)
    .select("id, provider, transaction_type, amount, trx_id, counterparty_identifier, status, use_for")
    .maybeSingle();

  if (error) {
    throw new PaymentStateError("Unable to claim payment", "PAYMENT_CLAIM_FAILED");
  }
  if (!data) {
    throw new PaymentStateError("Payment already used or being processed", "PAYMENT_CLAIM_FAILED");
  }

  const payment = data as MfsTransaction;
  if (!VALID_RECEIVE_TYPES.includes(payment.transaction_type)) {
    await releasePayment(env, payment.id);
    throw new PaymentStateError(
      "Invalid transaction type. Only received payments are accepted.",
      "PAYMENT_CLAIM_FAILED",
    );
  }
  if (!Number.isFinite(Number(payment.amount)) || Number(payment.amount) <= 0) {
    await releasePayment(env, payment.id);
    throw new PaymentStateError("Invalid payment amount", "PAYMENT_CLAIM_FAILED");
  }

  return payment;
}

export async function markPaymentUsed(
  env: Env,
  mfsId: string,
  useFor: "direct_print" | "top_up",
): Promise<void> {
  const admin = getSupabaseAdmin(env);

  const { data, error } = await admin
    .from("mfs_transactions")
    .update({ status: "used", use_for: useFor })
    .eq("id", mfsId)
    .eq("status", "processing")
    .select("id");

  if (error || !data?.length) {
    throw new PaymentStateError(
      "Unable to finalize payment",
      "PAYMENT_TRANSITION_FAILED",
    );
  }
}

export async function releasePayment(env: Env, mfsId: string): Promise<void> {
  const { data, error } = await getSupabaseAdmin(env)
    .from("mfs_transactions")
    .update({ status: "not_used", use_for: null })
    .eq("id", mfsId)
    .eq("status", "processing")
    .select("id");

  if (error || !data?.length) {
    throw new PaymentStateError(
      "Unable to release payment claim",
      "PAYMENT_TRANSITION_FAILED",
    );
  }
}

// amount যথেষ্ট কিনা — simple check
export function getPaymentComment(paid: number, calculated: number): string | null {
  const paidNum = parseFloat(String(paid));
  const calcNum = parseFloat(String(calculated));
  const diff = parseFloat((paidNum - calcNum).toFixed(2));

  if(diff > 0) return `Overpaid by ৳${diff.toFixed(2)}`;
  if(diff < 0) return `Short by ৳${Math.abs(diff).toFixed(2)}`;
  return null;
}