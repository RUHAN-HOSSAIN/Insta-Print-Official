import { Request, Response } from "express";
import axios from "axios";
import { ENV } from "../config/env.config";
import { getTokens, refreshAccessToken } from "../services/supabase.service";

const BASE = "https://api.epsonconnect.com";
const TOKEN_EXPIRY_MINUTES = 50;

async function fetchDeviceInfo(accessToken: string) {
  return axios.get(`${BASE}/api/2/printing/devices/info`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": ENV.EPSON_API_KEY!,
    },
  });
}

function isTokenExpired(updatedAt: string): boolean {
  const lastUpdated = new Date(updatedAt).getTime();
  const now = Date.now();
  const diffInMinutes = (now - lastUpdated) / 1000 / 60;
  return diffInMinutes >= TOKEN_EXPIRY_MINUTES;
}

export async function getDeviceStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { updated_at } = await getTokens();

    // ✅ 50 min হয়ে গেলে আগেই refresh করো, API call এর আগেই
    if (isTokenExpired(updated_at)) {
      console.log("Token expired (50min) — refreshing before API call...");
      await refreshAccessToken();
    }

    // সবসময় fresh token নাও (refresh হলে নতুনটা, না হলে আগেরটা)
    const { access_token: freshToken } = await getTokens();

    let deviceRes;
    try {
      deviceRes = await fetchDeviceInfo(freshToken);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        // তবুও 401 আসলে (edge case) — আরেকবার refresh করে retry
        await refreshAccessToken();
        const { access_token: retryToken } = await getTokens();
        deviceRes = await fetchDeviceInfo(retryToken);
      } else {
        throw err;
      }
    }

    const connected: boolean = deviceRes.data.connected ?? false;
    res.status(200).json({ connected });

  } catch (err: any) {
    res.status(500).json({ connected: false, error: "Failed to reach printer" });
  }
}


/*
import { Request, Response } from "express";
import axios from "axios";
import { ENV } from "../config/env.config";
import { getTokens, refreshAccessToken } from "../services/supabase.service";
import { HALLS } from "../constants/halls";

const BASE = "https://api.epsonconnect.com";
const TOKEN_EXPIRY_MINUTES = 50;

async function fetchDeviceInfo(accessToken: string) {
  return axios.get(`${BASE}/api/2/printing/devices/info`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": ENV.EPSON_API_KEY!,
    },
  });
}

function isTokenExpired(updatedAt: string): boolean {
  const lastUpdated = new Date(updatedAt).getTime();
  const now = Date.now();
  const diffInMinutes = (now - lastUpdated) / 1000 / 60;
  return diffInMinutes >= TOKEN_EXPIRY_MINUTES;
}

export async function getDeviceStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const hallId = req.query.hall as string;

    // hall validate করো
    const hall = HALLS.find((h) => h.id === hallId);
    if (!hall) {
      res.status(400).json({ connected: false, error: "Invalid hall" });
      return;
    }

    // hall active আছে কিনা
    if (!hall.active) {
      res.status(200).json({
        connected: false,
        reason: "not_available", // frontend এ আলাদা message দেখাতে পারবে
        message: `${hall.name} এ এখনো printer সংযুক্ত হয়নি`,
      });
      return;
    }

    // active hall এর token আনো (printerRow দিয়ে)
    const { access_token, updated_at } = await getTokens(hall.printerRow);

    if (isTokenExpired(updated_at)) {
      console.log(`[${hall.name}] Token expired — refreshing...`);
      await refreshAccessToken(hall.printerRow);
    }

    const { access_token: freshToken } = await getTokens(hall.printerRow);

    let deviceRes;
    try {
      deviceRes = await fetchDeviceInfo(freshToken);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        await refreshAccessToken(hall.printerRow);
        const { access_token: retryToken } = await getTokens(hall.printerRow);
        deviceRes = await fetchDeviceInfo(retryToken);
      } else {
        throw err;
      }
    }

    res.status(200).json({ connected: deviceRes.data.connected });

  } catch (err: any) {
    res.status(500).json({ connected: false, error: "Failed to reach printer" });
  }
}
*/