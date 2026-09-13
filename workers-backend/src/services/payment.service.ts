import { Env } from "../types";
import { getSupabaseAdmin } from "./auth.service";

export interface MfsTransaction {
  pay_id: string;
  provider: string;
  amount_paid: number;
  txn_id: string;
  sender_number: string;
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

const PAYMENT_FIELDS = "pay_id, provider, amount_paid, txn_id, sender_number, status, use_for";

export async function findUnusedPayment(env: Env, txnId: string): Promise<MfsTransaction> {
  const { data, error } = await getSupabaseAdmin(env)
    .from("mfs_transactions")
    .select(PAYMENT_FIELDS)
    .eq("txn_id", txnId.trim())
    .maybeSingle();

  if (error) throw new Error("Unable to verify payment");
  if (!data) throw new PaymentStateError("Your payment information has not reached us yet. Please try again after some time.", "PAYMENT_NOT_FOUND");
  if (data.status === "used") throw new PaymentStateError("Printing has already been completed using this payment.", "PAYMENT_ALREADY_USED");
  if (data.status !== "not_used" || data.use_for !== null) throw new PaymentStateError("This payment is already being processed. Please try again later.", "PAYMENT_PROCESSING");
  return data as MfsTransaction;
}

export async function claimPayment(env: Env, txnId: string): Promise<MfsTransaction> {
  const admin = getSupabaseAdmin(env);
  const normalizedTxnId = txnId.trim();
  const { data: candidate, error: lookupError } = await admin
    .from("mfs_transactions")
    .select("pay_id, status, use_for")
    .eq("txn_id", normalizedTxnId)
    .maybeSingle();

  if (lookupError) throw new PaymentStateError("Unable to verify payment", "PAYMENT_NOT_FOUND");
  if (!candidate) throw new PaymentStateError("Your payment data has not reached us yet. Please try again later.", "PAYMENT_NOT_FOUND");
  if (candidate.status === "used") throw new PaymentStateError("Printing has already been completed using this payment.", "PAYMENT_ALREADY_USED");
  if (candidate.status !== "not_used" || candidate.use_for !== null) throw new PaymentStateError("This payment is already being processed. Please try again later.", "PAYMENT_PROCESSING");

  const { data, error } = await admin
    .from("mfs_transactions")
    .update({ status: "processing" })
    .eq("pay_id", candidate.pay_id)
    .eq("status", "not_used")
    .is("use_for", null)
    .select(PAYMENT_FIELDS)
    .maybeSingle();

  if (error) throw new PaymentStateError("Unable to claim payment", "PAYMENT_CLAIM_FAILED");
  if (!data) throw new PaymentStateError("Payment already used or being processed", "PAYMENT_CLAIM_FAILED");
  const payment = data as MfsTransaction;
  if (!Number.isFinite(Number(payment.amount_paid)) || Number(payment.amount_paid) <= 0) {
    await releasePayment(env, payment.pay_id);
    throw new PaymentStateError("Invalid payment amount", "PAYMENT_CLAIM_FAILED");
  }
  return payment;
}

export async function markPaymentUsed(env: Env, payId: string, useFor: "direct_print" | "top_up"): Promise<void> {
  const { data, error } = await getSupabaseAdmin(env)
    .from("mfs_transactions")
    .update({ status: "used", use_for: useFor })
    .eq("pay_id", payId)
    .eq("status", "processing")
    .select("pay_id");
  if (error || !data?.length) throw new PaymentStateError("Unable to finalize payment", "PAYMENT_TRANSITION_FAILED");
}

export async function releasePayment(env: Env, payId: string): Promise<void> {
  const { data, error } = await getSupabaseAdmin(env)
    .from("mfs_transactions")
    .update({ status: "not_used", use_for: null })
    .eq("pay_id", payId)
    .eq("status", "processing")
    .select("pay_id");
  if (error || !data?.length) throw new PaymentStateError("Unable to release payment claim", "PAYMENT_TRANSITION_FAILED");
}

export function getPaymentComment(paid: number, calculated: number): string | null {
  const difference = Number((Number(paid) - Number(calculated)).toFixed(2));
  if (difference > 0) return `Overpaid by ৳${difference.toFixed(2)}`;
  if (difference < 0) return `Short by ৳${Math.abs(difference).toFixed(2)}`;
  return null;
}
