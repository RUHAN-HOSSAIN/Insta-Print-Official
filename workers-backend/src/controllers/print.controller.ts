import { HALLS, HallId } from "../config/constants";
import { Env } from "../types";
import { printFile } from "../services/epson.service";
import { verifyToken, getSupabaseAdmin } from "../services/auth.service";
import { claimPayment, findUnusedPayment, releasePayment } from "../services/payment.service";
import { createDirectPrintJobReservation, createWalletPrintJob, deletePrintJobReservation, updatePrintJobStatus } from "../services/supabase.service";

type FileSetting = { copies: number; color: "mono" | "color" };
type FileMetadata = { name: string; pages: number; copies: number; color: "mono" | "color"; subtotal?: number };

const MAX_FILES = 10;
const MAX_COPIES = 100;

class PrintRequestError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 401 | 402,
    public readonly code: string,
  ) {
    super(message);
  }
}

const invalidRequest = (message: string): never => {
  throw new PrintRequestError(message, 400, "INVALID_REQUEST");
};

const errorResponse = (message: string, status: number, extra: Record<string, unknown> = {}) =>
  Response.json({ error: message, ...extra }, { status });

async function getAuthenticatedUserId(request: Request, env: Env): Promise<string | null> {
  const authorization = request.headers.get("Authorization");
  if (!authorization) return null;
  try {
    const { userId } = await verifyToken(env, authorization);
    return userId;
  } catch {
    throw new PrintRequestError("Unauthorized", 401, "UNAUTHORIZED");
  }
}

function parseJson<T>(value: string | File | null, field: string): T {
  if (typeof value !== "string") return invalidRequest(`Invalid ${field}`);
  try {
    return JSON.parse(value) as T;
  } catch {
    return invalidRequest(`Invalid ${field}`);
  }
}

function validateInput(formData: FormData, files: File[], settings: FileSetting[], filesMetadata: FileMetadata[]) {
  const hallId = String(formData.get("hall_id") ?? "") as HallId;
  const paymentMethod = String(formData.get("payment_method") ?? "");
  const amount = Number(formData.get("amount_calculated"));
  const hall = HALLS.find((item) => item.id === hallId);

  if (!hall) return invalidRequest("Hall not found");
  if (!hall.active) return invalidRequest("Hall not active yet");
  if (paymentMethod !== "direct" && paymentMethod !== "wallet") return invalidRequest("Invalid payment method");
  if (!Number.isFinite(amount) || amount <= 0 || amount > 9999.99 || !Number.isInteger(amount * 100)) return invalidRequest("Invalid amount");
  if (!files.length || files.length > MAX_FILES) return invalidRequest(`You can submit 1 to ${MAX_FILES} files`);
  if (files.length !== settings.length || files.length !== filesMetadata.length) return invalidRequest("File metadata mismatch");

  for (let index = 0; index < files.length; index += 1) {
    const metadata = filesMetadata[index];
    const setting = settings[index];
    if (!metadata || typeof metadata.name !== "string" || !Number.isInteger(metadata.pages) || metadata.pages < 1) return invalidRequest("Invalid file metadata");
    if (!Number.isInteger(metadata.copies) || metadata.copies < 1 || metadata.copies > MAX_COPIES) return invalidRequest("Invalid copies value");
    if (!setting || setting.copies !== metadata.copies || (setting.color !== "mono" && setting.color !== "color")) return invalidRequest("Invalid print settings");
    if (metadata.color !== setting.color) return invalidRequest("Invalid color value");
  }

  return { hallId, paymentMethod, amount, hall };
}

export async function submitPrintJob(request: Request, env: Env): Promise<Response> {
  let jobSiNo: number | null = null;
  let paymentId: string | null = null;
  let walletAmountReserved = 0;
  let submittedJobIds: string[] = [];
  let authenticatedUserId: string | null = null;
  let directWalletCredit = 0;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);
    const settings = parseJson<FileSetting[]>(formData.get("settings"), "settings");
    const filesMetadata = parseJson<FileMetadata[]>(formData.get("files_metadata"), "files metadata");
    const input = validateInput(formData, files, settings, filesMetadata);
    const userId = await getAuthenticatedUserId(request, env);
    authenticatedUserId = userId;
    const loggedUser = userId !== null;

    if (input.paymentMethod === "wallet" && !userId) return errorResponse("Wallet payment requires login", 401, { code: "AUTH_REQUIRED", printed: false });

    const totalPagePrint = filesMetadata.reduce((total, item) => total + item.pages * item.copies, 0);
    const commonInput = { hallId: input.hallId, loggedUser, amountCalculated: input.amount, files: filesMetadata, totalFiles: files.length, totalPagePrint };

    if (input.paymentMethod === "wallet") {
      const job = await createWalletPrintJob(env, commonInput, userId!);
      jobSiNo = job.si_no;
      walletAmountReserved = input.amount;
      const jobIds: string[] = [];
      submittedJobIds = jobIds;
      await updatePrintJobStatus(env, jobSiNo, false, [], "uploading");
      for (let index = 0; index < files.length; index += 1) {
        await updatePrintJobStatus(env, jobSiNo, false, jobIds, "printing");
        jobIds.push(await printFile(env, input.hall.tokenRow, await files[index].arrayBuffer(), files[index].name, settings[index]));
      }
      await updatePrintJobStatus(env, jobSiNo, true, jobIds, "completed", null);
      walletAmountReserved = 0;
      return Response.json({ status: "queued", printed: true, totalFiles: files.length, printJobSiNo: jobSiNo });
    }

    const txnId = String(formData.get("txn_id") ?? "").trim();
    if (!txnId) return errorResponse("Transaction ID required", 400, { code: "TXN_REQUIRED", printed: false });

    const availablePayment = await findUnusedPayment(env, txnId);
    const amountPaid = Number(availablePayment.amount);
    const difference = Number((amountPaid - input.amount).toFixed(2));

    if (difference < 0 && !loggedUser) return errorResponse(`You paid ৳${amountPaid}, but ৳${input.amount} was required.`, 402, {
      code: "INSUFFICIENT_PAYMENT", printed: false, payment_claimed: false, amount_paid: amountPaid, amount_required: input.amount,
    });

    const payment = await claimPayment(env, txnId);
    paymentId = payment.id;
    const comment = difference > 0 ? `Overpaid by ৳${difference.toFixed(2)}` : difference < 0 ? `Less payment ৳${amountPaid}` : null;
    directWalletCredit = difference > 0 && userId ? difference : 0;

    if (difference < 0) {
      const job = await createDirectPrintJobReservation(env, commonInput, payment, comment);
      jobSiNo = job.si_no;
      const { data: newBalance, error } = await getSupabaseAdmin(env).rpc("finalize_logged_underpayment", { p_mfs_id: payment.id, p_user_id: userId, p_amount: amountPaid, p_job_si_no: jobSiNo });
      if (error) throw new Error(error.message);
      return Response.json({ status: "insufficient_payment", printed: false, payment_claimed: true, wallet_credited: amountPaid, wallet_balance: Number(newBalance), printJobSiNo: jobSiNo, message: `Printing did not start. Your ৳${amountPaid} payment was added to your wallet.` });
    }

    const job = await createDirectPrintJobReservation(env, commonInput, payment, comment);
    jobSiNo = job.si_no;
    const jobIds: string[] = [];
    submittedJobIds = jobIds;
    await updatePrintJobStatus(env, jobSiNo, false, [], "uploading");
    for (let index = 0; index < files.length; index += 1) {
      await updatePrintJobStatus(env, jobSiNo, false, jobIds, "printing");
      jobIds.push(await printFile(env, input.hall.tokenRow, await files[index].arrayBuffer(), files[index].name, settings[index]));
    }
    const { data: walletBalance, error } = await getSupabaseAdmin(env).rpc("finalize_direct_print", {
      p_mfs_id: payment.id,
      p_job_si_no: jobSiNo,
      p_job_ids: jobIds,
      p_user_id: userId,
      p_wallet_credit: difference > 0 ? difference : 0,
    });
    if (error) throw new Error(error.message);
    return Response.json({ status: "queued", printed: true, totalFiles: files.length, printJobSiNo: jobSiNo, wallet_credited: difference > 0 && userId ? difference : 0, ...(difference > 0 && userId ? { wallet_balance: Number(walletBalance) } : {}) });
  } catch (error) {
    if (jobSiNo !== null) {
      try { await updatePrintJobStatus(env, jobSiNo, false, undefined, "failed", error instanceof Error ? error.message : "Print job failed"); } catch { /* preserve original error */ }
    }
    if (paymentId) {
      try {
        if (submittedJobIds.length) {
          await getSupabaseAdmin(env).rpc("finalize_partial_direct_print", {
            p_mfs_id: paymentId,
            p_job_si_no: jobSiNo,
            p_job_ids: submittedJobIds,
            p_user_id: authenticatedUserId,
            p_wallet_credit: directWalletCredit,
          });
        } else {
          await releasePayment(env, paymentId);
          if (jobSiNo !== null) await deletePrintJobReservation(env, jobSiNo);
        }
      } catch { /* preserve original error */ }
    }
    if (walletAmountReserved > 0 && !submittedJobIds.length) {
      try {
        await getSupabaseAdmin(env).rpc("add_wallet_balance", { p_user_id: authenticatedUserId, p_amount: walletAmountReserved });
      } catch { /* surface the original print error */ }
    }
    const message = error instanceof Error ? error.message : "Print job failed";
    const status = error instanceof PrintRequestError ? error.status : 500;
    const code = error instanceof PrintRequestError ? error.code : "PRINT_JOB_FAILED";
    return errorResponse(message, status, { code, printed: false });
  }
}