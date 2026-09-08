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
): Promise<string> {
  // Token আনো — refresh করে নাও যদি দরকার হয়
  let { access_token } = await getTokens(env, tokenRow);

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

  if (jobRes.status === 401) {
    // Token expire — refresh করো, তারপর পুরো function আবার চালাও
    // কিন্তু এবার isRetry flag দিয়ে infinite loop আটকাও
    access_token = await refreshAccessToken(env, tokenRow);

    // Job আবার create করো নতুন token দিয়ে
    const retryRes = await fetch(`${EPSON_BASE_URL}/api/2/printing/jobs`, {
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
    if (!retryRes.ok)
      throw new Error(`Job create failed after refresh: ${retryRes.status}`);
    const retryData = (await retryRes.json()) as any;
    return uploadAndPrint(
      env,
      access_token,
      retryData.jobId,
      retryData.uploadUri,
      fileBuffer,
      fileName,
    );
  }

  if (!jobRes.ok) throw new Error(`Job create failed: ${jobRes.status}`);

  const { jobId, uploadUri } = (await jobRes.json()) as any;
  if (!jobId || !uploadUri)
    throw new Error("Epson did not return a valid job ID or upload URL");

  return uploadAndPrint(
    env,
    access_token,
    jobId,
    uploadUri,
    fileBuffer,
    fileName,
  );
}

// Upload + print execute আলাদা function এ
async function uploadAndPrint(
  env: Env,
  accessToken: string,
  jobId: string,
  uploadUri: string,
  fileBuffer: ArrayBuffer,
  fileName: string,
): Promise<string> {
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
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-api-key": env.EPSON_API_KEY,
      },
    },
  );
  if (!printRes.ok) throw new Error(`Print execute failed: ${printRes.status}`);

  console.log(`✓ Printed: ${fileName}`);
  return jobId;
}
