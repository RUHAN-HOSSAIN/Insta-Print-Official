import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Env, TokenRow } from "../types";
import { EPSON_AUTH_URL } from "../config/constants";

export interface PrintJobInput {
  hallId: string;
  loggedUser: boolean;
  paymentMethod: "direct" | "wallet";
  txnId: string;
  amountCalculated: number;
  files: unknown[];
  totalFiles: number;
  totalPagePrint: number;
}

export function getSupabase(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
}

export async function createPrintJobFromPayment(
  env: Env,
  input: PrintJobInput,
): Promise<{ si_no: number; amount_paid: number; sender_number: string | null }> {
  const supabase = getSupabase(env);
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("si_no, txn_id, amount, sender_number, status")
    .eq("txn_id", input.txnId.trim())
    .eq("status", "not_used")
    .maybeSingle();

  if (paymentError) throw new Error("Unable to verify payment");
  if (!payment) throw new Error("Payment not found or already used");
  if (Number(payment.amount) < input.amountCalculated)
    throw new Error("Insufficient payment amount");

  const { data: job, error: jobError } = await supabase
    .from("print_jobs")
    .insert({
      hall_id: input.hallId,
      logged_user: input.loggedUser,
      payment_method: input.paymentMethod,
      txn_id: payment.txn_id,
      amount_paid: payment.amount,
      sender_number: payment.sender_number,
      amount_calculated: input.amountCalculated,
      files: input.files,
      total_files: input.totalFiles,
      total_page_print: input.totalPagePrint,
      status: false,
    })
    .select("si_no")
    .single();

  if (jobError || !job) throw new Error("Unable to create print job");

  const { error: paymentUpdateError } = await supabase
    .from("payments")
    .update({
      status: "used",
      use_for: "direct_print",
      print_job_si_no: job.si_no,
    })
    .eq("si_no", payment.si_no)
    .eq("status", "not_used");

  if (paymentUpdateError) throw new Error("Unable to mark payment as used");
  return {
    si_no: job.si_no,
    amount_paid: Number(payment.amount),
    sender_number: payment.sender_number,
  };
}

export async function updatePrintJobStatus(
  env: Env,
  jobSiNo: number,
  status: boolean,
  jobIds: string[],
  comments?: string,
): Promise<void> {
  const { error } = await getSupabase(env)
    .from("print_jobs")
    .update({ status, job_ids: jobIds, comments: comments ?? null })
    .eq("si_no", jobSiNo);

  if (error) throw new Error("Unable to update print job status");
}

// tokenRow দিয়ে নির্দিষ্ট hall এর token আনো
export async function getTokens(env: Env, tokenRow: number): Promise<TokenRow> {
  const { data, error } = await getSupabase(env)
    .from("epson_tokens")
    .select("access_token, refresh_token")
    .eq("id", tokenRow)
    .single();

  if (error || !data) throw new Error("Failed to fetch tokens");
  return data as TokenRow;
}

// নির্দিষ্ট hall এর token save করো
export async function saveTokens(
  env: Env,
  tokenRow: number,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await getSupabase(env)
    .from("epson_tokens")
    .update({
      access_token: accessToken,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tokenRow);
}

// নির্দিষ্ট hall এর token refresh করো
export async function refreshAccessToken(
  env: Env,
  tokenRow: number
): Promise<string> {
  const { refresh_token } = await getTokens(env, tokenRow);
  const credentials = btoa(`${env.EPSON_CLIENT_ID}:${env.EPSON_SECRET}`);

  const res = await fetch(`${EPSON_AUTH_URL}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });

  if (!res.ok) throw new Error("Failed to refresh token");

  const data: any = await res.json();
  await saveTokens(env, tokenRow, data.access_token, data.refresh_token);
  return data.access_token;
}