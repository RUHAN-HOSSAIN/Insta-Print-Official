import { Env } from "../types";
import { getSupabase } from "./supabase.service";

export interface PaymentRecord {
  si_no: number;
  txn_id: string;
  via: string;
  sender_number: string;
  amount: number;
  status: "not_used" | "used";
  use_for: "direct_print" | "top_up" | null;
  print_job_si_no: number | null;
}

export async function findUnusedPayment(
  env: Env,
  txnId: string,
): Promise<PaymentRecord> {
  const normalizedTxnId = txnId.trim();
  if (!normalizedTxnId) throw new Error("Payment transaction ID is required");

  const { data, error } = await getSupabase(env)
    .from("payments")
    .select("si_no, txn_id, via, sender_number, amount, status, use_for, print_job_si_no")
    .eq("txn_id", normalizedTxnId)
    .eq("status", "not_used")
    .maybeSingle();

  if (error) throw new Error("Unable to verify payment");
  if (!data) throw new Error("Payment not found or already used");
  return data as PaymentRecord;
}

export function verifyPaymentAmount(
  paymentAmount: number,
  calculatedAmount: number,
): boolean {
  return Number.isFinite(calculatedAmount) && calculatedAmount > 0 && paymentAmount >= calculatedAmount;
}

export function getPaymentComment(
  paymentAmount: number,
  calculatedAmount: number,
): string | null {
  const paymentCents = Math.round(paymentAmount * 100);
  const calculatedCents = Math.round(calculatedAmount * 100);

  if (paymentCents === calculatedCents) return null;
  if (paymentCents < calculatedCents) return `Less: ${paymentAmount.toFixed(2)}`;
  return `Extra: ${((paymentCents - calculatedCents) / 100).toFixed(2)}`;
}