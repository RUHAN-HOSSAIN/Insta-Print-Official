import { HALLS, HallId } from "../config/constants";
import { Env } from "../types";
import { printFile } from "../services/epson.service";
import {
  findUnusedPayment,
  getPaymentComment,
  verifyPaymentAmount,
} from "../services/payment.service";
import {
  createPrintJobFromPayment,
  updatePrintJobStatus,
} from "../services/supabase.service";

type FileSetting = { copies: number; color: "mono" | "color" };
const corsHeaders = { "Access-Control-Allow-Origin": "*" };

const errorResponse = (message: string, status: number) =>
  Response.json({ error: message }, { status, headers: corsHeaders });

export async function submitPrintJob(request: Request, env: Env): Promise<Response> {
  let jobSiNo: number | null = null;
  const epsonJobIds: string[] = [];
  try {
    const formData = await request.formData();
    const txnId = String(formData.get("txn_id") ?? formData.get("txnId") ?? "").trim();
    const amount = Number(formData.get("amount_calculated") ?? formData.get("amount"));
    const hallId = String(formData.get("hall_id") ?? formData.get("hallId") ?? "") as HallId;
    const paymentMethod = String(formData.get("payment_method") ?? "direct");
    const loggedUser = String(formData.get("logged_user") ?? "false") === "true";
    const filesMetadata = JSON.parse(String(formData.get("files_metadata") ?? "[]")) as unknown[];
    const settings = JSON.parse(String(formData.get("settings") ?? "[]")) as FileSetting[];
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);

    const hall = HALLS.find((item) => item.id === hallId);
    if (!hall) return errorResponse("Hall not found", 404);
    if (!hall.active) return errorResponse("Hall not active yet", 400);
    if (paymentMethod !== "direct") return errorResponse("Only direct payment is enabled", 400);
    if (!Number.isFinite(amount) || amount <= 0) return errorResponse("Invalid amount", 400);
    if (!files.length) return errorResponse("File required", 400);
    if (files.length !== settings.length || files.length !== filesMetadata.length)
      return errorResponse("File metadata mismatch", 400);

    // Check the manually entered payment before creating the print job.
    const payment = await findUnusedPayment(env, txnId);
    const paymentComment = getPaymentComment(payment.amount, amount);
    const paymentIsInsufficient = !verifyPaymentAmount(payment.amount, amount);

    const totalPagePrint = filesMetadata.reduce<number>((total, item) => {
      const metadata = item as { pages?: number; copies?: number };
      return total + Number(metadata.pages ?? 0) * Number(metadata.copies ?? 0);
    }, 0);

    const job = await createPrintJobFromPayment(env, {
      hallId,
      loggedUser,
      paymentMethod: "direct",
      txnId,
      amountCalculated: amount,
      files: filesMetadata,
      totalFiles: files.length,
      totalPagePrint,
      comments: paymentComment,
    });
    jobSiNo = job.si_no;

    if (paymentIsInsufficient)
      return errorResponse("Insufficient payment amount", 402);

    for (let index = 0; index < files.length; index += 1) {
      const epsonJobId = await printFile(
        env,
        hall.tokenRow,
        await files[index].arrayBuffer(),
        files[index].name,
        settings[index],
      );
      epsonJobIds.push(epsonJobId);
    }

    await updatePrintJobStatus(env, jobSiNo, true, epsonJobIds, paymentComment ?? undefined);

    return Response.json(
      {
        status: "queued",
        totalFiles: files.length,
        printJobSiNo: jobSiNo,
        epsonJobIds,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    if (jobSiNo !== null) {
      await updatePrintJobStatus(
        env,
        jobSiNo,
        false,
        epsonJobIds,
        error instanceof Error ? error.message : "Print job failed",
      );
    }
    console.error("Print job failed:", error);
    const message = error instanceof Error ? error.message : "Print job failed";
    const status = /payment|insufficient/i.test(message) ? 402 : 500;
    return errorResponse(message, status);
  }
}