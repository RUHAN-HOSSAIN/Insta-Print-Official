import { processJob } from "./epson.service";

export interface PrintJob {
  jobId: string;
  fileBuffer: Buffer;
  fileName: string;
  settings: {
    copies: number;
    color: "color" | "mono";
  };
}

const queue: PrintJob[] = [];
let isProcessing = false;

export function addToQueue(job: PrintJob): void {
  queue.push(job);
  processNext();
}

async function processNext(): Promise<void> {
  if (isProcessing || queue.length === 0) return;

  isProcessing = true;
  const job = queue.shift()!;

  try {
    await processJob(job);
  } catch (err) {
    console.error(`Job ${job.jobId} failed:`, err);
  } finally {
    isProcessing = false;
    processNext(); // পরেরটা শুরু করো
  }
}