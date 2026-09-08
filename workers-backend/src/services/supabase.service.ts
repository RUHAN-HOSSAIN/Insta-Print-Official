import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Env, TokenRow } from "../types";
import { EPSON_AUTH_URL } from "../config/constants";
import { findUnusedPayment, markPaymentUsed, getPaymentComment } from "./payment.service";
import { getSupabaseAdmin } from "./auth.service";

export interface PrintJobInput {
  hallId: string;
  loggedUser: boolean;
  txnId?: string;
  amountCalculated: number;
  files: unknown[];
  totalFiles: number;
  totalPagePrint: number;
}

export function getSupabase(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
}

// Direct payment — mfs_transactions verify করে print job বানাও
export async function createPrintJobFromPayment(
  env: Env,
  input: PrintJobInput,
): Promise<{ si_no: number; amount_paid: number; sender_number: string | null }> {
  const admin = getSupabaseAdmin(env);

  const payment = await findUnusedPayment(env, input.txnId!);
  const paymentComment = getPaymentComment(Number(payment.amount), input.amountCalculated);

  const { data: job, error: jobError } = await admin
    .from("print_jobs")
    .insert({
      hall_id: input.hallId,
      logged_user: input.loggedUser,
      payment_method: "direct",
      txn_id: payment.trx_id,
      amount_paid: Number(payment.amount),
      sender_number: payment.counterparty_identifier,
      amount_calculated: input.amountCalculated,
      files: input.files,
      total_files: input.totalFiles,
      total_page_print: input.totalPagePrint,
      comments: paymentComment ?? null,
      status: false,
    })
    .select("si_no")
    .single();

  if (jobError || !job) throw new Error("Unable to create print job");

  await markPaymentUsed(env, payment.id, "direct_print");

  return {
    si_no: job.si_no,
    amount_paid: Number(payment.amount),
    sender_number: payment.counterparty_identifier,
  };
}

// Wallet payment — balance কেটে print job বানাও
export async function createWalletPrintJob(
  env: Env,
  input: PrintJobInput,
  userId: string,
): Promise<{ si_no: number }> {
  const admin = getSupabaseAdmin(env);

  // Atomic deduction — Postgres function, race condition safe
  const { error: rpcError } = await admin.rpc("deduct_wallet_balance", {
    p_user_id: userId,
    p_amount: input.amountCalculated,
  });
  if (rpcError) throw new Error(rpcError.message);

  const { data: job, error: jobError } = await admin
    .from("print_jobs")
    .insert({
      hall_id: input.hallId,
      logged_user: true,
      payment_method: "wallet",
      txn_id: null,
      amount_paid: input.amountCalculated,
      sender_number: null,
      amount_calculated: input.amountCalculated,
      files: input.files,
      total_files: input.totalFiles,
      total_page_print: input.totalPagePrint,
      comments: null,
      status: false,
    })
    .select("si_no")
    .single();

  if (jobError || !job) throw new Error("Unable to create print job");

  return { si_no: job.si_no };
}

export async function updatePrintJobStatus(
  env: Env,
  jobSiNo: number,
  status: boolean,
  jobIds: string[],
  comments?: string,
): Promise<void> {
  const { error } = await getSupabaseAdmin(env)
    .from("print_jobs")
    .update({ status, job_ids: jobIds, comments: comments ?? null })
    .eq("si_no", jobSiNo);

  if (error) throw new Error("Unable to update print job status");
}

export async function getTokens(env: Env, tokenRow: number): Promise<TokenRow> {
  const { data, error } = await getSupabaseAdmin(env)
    .from("epson_tokens")
    .select("access_token, refresh_token")
    .eq("id", tokenRow)
    .single();

  if (error || !data) throw new Error("Failed to fetch tokens");
  return data as TokenRow;
}

export async function saveTokens(
  env: Env,
  tokenRow: number,
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await getSupabaseAdmin(env)
    .from("epson_tokens")
    .update({
      access_token: accessToken,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tokenRow);
}

export async function refreshAccessToken(env: Env, tokenRow: number): Promise<string> {
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