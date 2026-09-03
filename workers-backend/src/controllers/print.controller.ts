import { Env } from "../types";
import { HALLS, HallId } from "../config/constants";
import { printFile } from "../services/epson.service";
import { validateTransactionId, verifyAmount } from "../services/payment.service";

export async function submitPrintJob(
  request: Request,
  env: Env
): Promise<Response> {
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };

  try {
    const formData = await request.formData();

    const txnId = (formData.get("txn_id") ?? formData.get("txnId")) as string;
    const amount = Number(formData.get("amount_calculated") ?? formData.get("amount"));
    const hallId = (formData.get("hall_id") ?? formData.get("hallId")) as HallId;
    const filesMetadataRaw = formData.get("files_metadata") as string;
    const settingsRaw = (formData.get("settings") ?? filesMetadataRaw) as string;
    const files = formData.getAll("files") as File[];

    // Hall valid কিনা check
    const hall = HALLS.find((h) => h.id === hallId);
    if (!hall) {
      return Response.json(
        { error: "Hall not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    if (!hall.active) {
      return Response.json(
        { error: "Hall not active yet" },
        { status: 400, headers: corsHeaders }
      );
    }

    // File check
    if (!files || files.length === 0) {
      return Response.json(
        { error: "File required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // TxnId check
    if (!validateTransactionId(txnId)) {
      return Response.json(
        { error: "Transaction ID not matched" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Amount check
    if (!verifyAmount(amount)) {
      return Response.json(
        { error: "Insufficient payment amount" },
        { status: 400, headers: corsHeaders }
      );
    }

    const parsedMetadata = JSON.parse(filesMetadataRaw || "[]") as {
      copies: number;
      color: "mono" | "color";
    }[];
    const settings: { copies: number; color: "mono" | "color" }[] = formData.get("settings")
      ? JSON.parse(settingsRaw)
      : parsedMetadata;

    // একটার পর একটা print করো
    for (let i = 0; i < files.length; i++) {
      const fileBuffer = await files[i].arrayBuffer();
      const fileName = files[i].name;
      await printFile(env, hall.tokenRow, fileBuffer, fileName, settings[i]);
    }

    return Response.json(
      { status: "queued", totalFiles: files.length },
      { headers: corsHeaders }
    );

  } catch (err: any) {
    console.error("Print job failed:", err);
    return Response.json(
      { error: "Print job failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}