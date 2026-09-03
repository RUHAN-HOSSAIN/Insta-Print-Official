import { Env } from "../types";
import { EPSON_BASE_URL } from "../config/constants";
import { getTokens, refreshAccessToken } from "./supabase.service";

function authHeaders(accessToken: string, apiKey: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "x-api-key": apiKey,
  };
}

export async function printFile(
  env: Env,
  tokenRow: number,
  fileBuffer: ArrayBuffer,
  fileName: string,
  settings: { copies: number; color: "mono" | "color" },
  isRetry = false
): Promise<void> {
  const { access_token } = await getTokens(env, tokenRow);

  const jobRes = await fetch(`${EPSON_BASE_URL}/api/2/printing/jobs`, {
    method: "POST",
    headers: {
      ...authHeaders(access_token, env.EPSON_API_KEY),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobName: `job_${Date.now()}`,
      printMode: "document",
      printSettings: {
        paperSize: "ps_a4",
        paperType: "pt_plainpaper",
        borderless: false,
        printQuality: "normal",
        paperSource: "rear",
        colorMode: settings.color,
        copies: settings.copies,
      },
    }),
  });

  if (jobRes.status === 401 && !isRetry) {
    await refreshAccessToken(env, tokenRow);
    return printFile(env, tokenRow, fileBuffer, fileName, settings, true);
  }

  if (!jobRes.ok) throw new Error(`Job create failed: ${jobRes.status}`);

  const { jobId, uploadUri } = await jobRes.json() as any;

  const uploadRes = await fetch(`${uploadUri}&File=${fileName}`, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: fileBuffer,
  });

  if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);

  const printRes = await fetch(
    `${EPSON_BASE_URL}/api/2/printing/jobs/${jobId}/print`,
    {
      method: "POST",
      headers: authHeaders(access_token, env.EPSON_API_KEY),
    }
  );

  if (!printRes.ok) throw new Error(`Print execute failed: ${printRes.status}`);

  console.log(`✓ Printed: ${fileName}`);
}