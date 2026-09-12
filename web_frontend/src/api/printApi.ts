import { buildPrintFormData } from "../utils/buildPrintFormData";
import type { PrintFormValues } from "../types/PrintRequest";

export class PrintApiError extends Error {
  readonly details: Record<string, unknown>;
  readonly status: number;

  constructor(
    message: string,
    details: Record<string, unknown> = {},
    status = 500,
  ) {
    super(message);
    this.details = details;
    this.status = status;
    this.name = "PrintApiError";
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

export async function submitPrintJob(
  formValues: PrintFormValues,
  files: File[],
  token?: string | null,
): Promise<{
  totalFiles?: number;
  status?: string;
  printed?: boolean;
  message?: string;
  wallet_credited?: number;
  wallet_balance?: number;
  amount_paid?: number;
  amount_required?: number;
  overpaid?: boolean;
}> {
  const formData = buildPrintFormData(formValues, files);

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/print`, {
    method: "POST",
    headers,
    body: formData,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new PrintApiError(
      result.error ?? `Print request failed (${response.status}).`,
      result,
      response.status,
    );
  }
  return result;
}

export async function fetchPrinterStatus(
  hallId: string,
): Promise<{ connected: boolean }> {
  const response = await fetch(
    `${API_BASE_URL}/status?hallId=${encodeURIComponent(hallId)}`,
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Unable to read printer status");
  return data;
}