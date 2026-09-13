import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Env, TokenRow } from "../types";
import { EPSON_AUTH_URL } from "../config/constants";
import { MfsTransaction } from "./payment.service";
import { getSupabaseAdmin } from "./auth.service";

export interface PrintJobInput {
  hallId: string;
  loggedUser: boolean;
  userId?: string | null;
  txnId?: string;
  amountCalculated: number;
  files: unknown[];
  totalFiles: number;
  totalPagePrint: number;
}

export function getSupabase(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
}

// ─── Wallet payment job ───────────────────────────────────────────────────────
export async function createWalletPrintJob(
  env: Env,
  input: PrintJobInput,
  userId: string,
): Promise<{ print_id: string; si_no: number; wallet_balance: number }> {
  const admin = getSupabaseAdmin(env);

  // Atomic deduction — balance কম থাকলে Postgres error throw করবে
  const { data: walletBalance, error: rpcError } = await admin.rpc("deduct_wallet_balance", {
    p_user_id: userId,
    p_amount: input.amountCalculated,
  });
  if (rpcError) throw new Error(rpcError.message);

  try {
    const { data: job, error: jobError } = await admin
      .from("print_jobs")
      .insert({
        hall_id: input.hallId,
        logged_user: true,
        payment_method: "wallet",
        amount_paid: input.amountCalculated,
        user_id: userId,
        amount_calculated: input.amountCalculated,
        files: input.files,
        total_files: input.totalFiles,
        total_page_print: input.totalPagePrint,
        comments: null,
        status: false,
        lifecycle_status: "pending",
      })
      .select("print_id, si_no")
      .single();

    if (jobError || !job) throw new Error("Unable to create print job");

    return { print_id: job.print_id, si_no: job.si_no, wallet_balance: Number(walletBalance) };
  } catch (error) {
    await admin.rpc("add_wallet_balance", {
      p_user_id: userId,
      p_amount: input.amountCalculated,
    });
    throw error;
  }
}

// ─── Print job status update — comments কে touch করবো না ───────────────────
export async function updatePrintJobStatus(
  env: Env,
  printId: string,
  status: boolean,
  jobIds?: string[],
  lifecycleStatus?: "pending" | "uploading" | "printing" | "completed" | "failed",
  errorMessage?: string | null,
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (jobIds) update.job_ids = jobIds;
  if (lifecycleStatus) update.lifecycle_status = lifecycleStatus;
  if (errorMessage !== undefined) update.error_message = errorMessage;

  const { error } = await getSupabaseAdmin(env)
    .from("print_jobs")
    .update(update)
    .eq("print_id", printId);

  if (error) throw new Error("Unable to update print job status");
}

export async function deletePrintJobReservation(
  env: Env,
  printId: string,
): Promise<void> {
  const { error } = await getSupabaseAdmin(env)
    .from("print_jobs")
    .delete()
    .eq("print_id", printId)
    .eq("status", false);

  if (error) throw new Error("Unable to remove print job reservation");
}

// ─── Token management ─────────────────────────────────────────────────────────
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
  const { error } = await getSupabaseAdmin(env)
    .from("epson_tokens")
    .update({
      access_token: accessToken,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tokenRow);
  if (error) throw new Error("Failed to save Epson tokens");
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

export async function createDirectPrintJobReservation(
  env: Env,
  input: PrintJobInput,
  payment: MfsTransaction,
  comments: string | null,
): Promise<{ print_id: string; si_no: number }> {
  const admin = getSupabaseAdmin(env);
  const { data: job, error } = await admin
    .from("print_jobs")
    .insert({
      hall_id: input.hallId,
      logged_user: input.loggedUser,
      payment_method: "direct",
      pay_id: payment.pay_id,
      user_id: input.userId ?? null,
      amount_paid: Number(payment.amount_paid),
      amount_calculated: input.amountCalculated,
      files: input.files,
      total_files: input.totalFiles,
      total_page_print: input.totalPagePrint,
      comments,
      status: false,
      lifecycle_status: "pending",
    })
    .select("print_id, si_no")
    .single();

  if (error || !job) throw new Error("Unable to create print job reservation");
  return { print_id: job.print_id, si_no: job.si_no };
}