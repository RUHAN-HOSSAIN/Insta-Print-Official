import { buildPrintFormData } from "../utils/buildPrintFormData";
import type { PrintFormValues } from "../types/PrintRequest";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

export async function submitPrintJob(
  formValues: PrintFormValues,
  files: File[],
): Promise<{ totalFiles: number }> {
  const formData = buildPrintFormData(formValues, files);
  const response = await fetch(`${API_BASE_URL}/print`, {
    method: "POST",
    body: formData,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.error ?? `Print request failed (${response.status}).`);
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