import { HALLS, HallId } from "../config/constants";
import { Env } from "../types";
import { printFile } from "../services/epson.service";
import { verifyToken } from "../services/auth.service";
import {
  createPrintJobFromPayment,
  createWalletPrintJob,
  updatePrintJobStatus,
} from "../services/supabase.service";

type FileSetting = { copies: number; color: "mono" | "color" };
const corsHeaders = { "Access-Control-Allow-Origin": "*" };

const errorResponse = (message: string, status: number) =>
  Response.json({ error: message }, { status, headers: corsHeaders });

export async function submitPrintJob(
  request: Request,
  env: Env,
): Promise<Response> {
  let jobSiNo: number | null = null;
  const epsonJobIds: string[] = [];

  try {
    const formData = await request.formData();
    const txnId = String(formData.get("txn_id") ?? "").trim();
    const amount = Number(formData.get("amount_calculated"));
    const hallId = String(formData.get("hall_id") ?? "") as HallId;
    const paymentMethod = String(formData.get("payment_method") ?? "direct");
    const loggedUser =
      String(formData.get("logged_user") ?? "false") === "true";
    const filesMetadata = JSON.parse(
      String(formData.get("files_metadata") ?? "[]"),
    ) as unknown[];
    const settings = JSON.parse(
      String(formData.get("settings") ?? "[]"),
    ) as FileSetting[];
    const files = formData
      .getAll("files")
      .filter((v): v is File => v instanceof File);

    // Basic validation
    const hall = HALLS.find((h) => h.id === hallId);
    if (!hall) return errorResponse("Hall not found", 404);
    if (!hall.active) return errorResponse("Hall not active yet", 400);
    if (!Number.isFinite(amount) || amount <= 0)
      return errorResponse("Invalid amount", 400);
    if (!files.length) return errorResponse("File required", 400);
    if (
      files.length !== settings.length ||
      files.length !== filesMetadata.length
    )
      return errorResponse("File metadata mismatch", 400);

    const totalPagePrint = filesMetadata.reduce<number>((total, item) => {
      const m = item as { pages?: number; copies?: number };
      return total + Number(m.pages ?? 0) * Number(m.copies ?? 0);
    }, 0);

    const commonInput = {
      hallId,
      loggedUser,
      amountCalculated: amount,
      files: filesMetadata,
      totalFiles: files.length,
      totalPagePrint,
    };

    if (paymentMethod === "wallet") {
      // Wallet — Authorization header থেকে userId বের করো, frontend থেকে না
      const { userId } = await verifyToken(
        env,
        request.headers.get("Authorization") ?? undefined,
      );

      const job = await createWalletPrintJob(env, commonInput, userId);
      jobSiNo = job.si_no;
    } else {
      // Direct — mfs_transactions verify
      if (!txnId) return errorResponse("Transaction ID required", 400);

      const job = await createPrintJobFromPayment(env, {
        ...commonInput,
        txnId,
      });
      jobSiNo = job.si_no;

      if (job.amount_paid < amount) {
        await updatePrintJobStatus(
          env,
          jobSiNo,
          false,
          [],
          `Short by ৳${(amount - job.amount_paid).toFixed(2)}`,
        );
        return errorResponse("Insufficient payment amount", 402);
      }
    }

    // Print
    for (let i = 0; i < files.length; i++) {
      const epsonJobId = await printFile(
        env,
        hall.tokenRow,
        await files[i].arrayBuffer(),
        files[i].name,
        settings[i],
      );
      epsonJobIds.push(epsonJobId);
    }

    await updatePrintJobStatus(env, jobSiNo!, true, epsonJobIds);

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
    const message = error instanceof Error ? error.message : "Print job failed";
    const status = /payment|insufficient/i.test(message) ? 402 : 500;
    return errorResponse(message, status);
  }
}
