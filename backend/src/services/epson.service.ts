import axios from "axios";
import { ENV } from "../config/env.config";
import { getTokens, refreshAccessToken } from "./supabase.service"; // ✅

const BASE = "https://api.epsonconnect.com";

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "x-api-key": ENV.EPSON_API_KEY!,
  };
}

export async function processJob(job: {
  fileBuffer: Buffer;
  fileName: string;
  settings: { copies: number; color: "mono" | "color" };
}): Promise<void> {
  const { access_token } = await getTokens();

  try {
    // Create job
    const jobRes = await axios.post(
      `${BASE}/api/2/printing/jobs`,
      {
        jobName: `job_${Date.now()}`,
        printMode: "document",
        printSettings: {
          paperSize: "ps_a4",
          paperType: "pt_plainpaper",
          borderless: false,
          printQuality: "normal",
          paperSource: "rear",
          colorMode: job.settings.color,
          copies: job.settings.copies,
        },
      },
      {
        headers: {
          ...authHeaders(access_token),
          "Content-Type": "application/json",
        },
      }
    );

    const { jobId, uploadUri } = jobRes.data;

    // Upload PDF
    await axios.post(`${uploadUri}&File=${job.fileName}`, job.fileBuffer, {
      headers: { "Content-Type": "application/pdf" },
    });

    // Execute print
    await axios.post(
      `${BASE}/api/2/printing/jobs/${jobId}/print`,
      null,
      { headers: authHeaders(access_token) }
    );

    console.log(`✓ Printed: ${job.fileName}`);

  } catch (err: any) {
    if (err?.response?.status === 401) {
      await refreshAccessToken();
      return processJob(job);
    }
    throw err;
  }
}