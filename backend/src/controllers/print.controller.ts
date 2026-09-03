import { Request, Response } from "express";
import { addToQueue } from "../services/queue.service";
import { validateTransactionId, verifyAmount } from "../services/payment.service";

export async function submitPrintJob(
  req: Request,
  res: Response
): Promise<void> {
  const { txnId, settings, amount } = req.body;
  const files = req.files as Express.Multer.File[];

  // file আছে কিনা check
  if (!files || files.length === 0) {
    res.status(400).json({ error: "File required" });
    return;
  }

  // txnId একবারই check হবে,,, na paile pay ee kore nai!!!
  if (!validateTransactionId(txnId)) {
    res.status(400).json({ error: "Transaction ID not matched" });
    return;
  }
  // amount একবারই check হবে
  if (!verifyAmount(amount)) {
    res.status(400).json({ error: "You payed less than expected" });
    return;
  }

  // settings parse করো
  const parsedSettings: { copies: number; color: "mono" | "color" }[] =
    JSON.parse(settings);

  // প্রতিটা file queue তে push করো
  files.forEach((file, index) => {
    const jobId = `job_${Date.now()}_${index}`;
    addToQueue({
      jobId,
      fileBuffer: file.buffer,
      fileName: file.originalname,
      settings: parsedSettings[index],
    });
  });

  // user কে সাথে সাথে response দাও
  res.status(202).json({
    status: "queued",
    totalFiles: files.length,
  });
}

