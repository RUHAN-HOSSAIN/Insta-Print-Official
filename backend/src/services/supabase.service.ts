import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "../config/env.config";

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY);

const AUTH = "https://auth.epsonconnect.com";

export async function getTokens() {
  const { data } = await supabase
    .from("epson_tokens")
    .select("access_token, refresh_token, updated_at")
    .eq("id", 1)
    .single();
  return data!;
}

export async function saveTokens(accessToken: string, refreshToken: string) {
  await supabase
    .from("epson_tokens")
    .update({
      access_token: accessToken,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
      // updated_at: new Date().toLocaleString("en-US", {
      //   timeZone: "Asia/Dhaka",
      // }),
    })
    .eq("id", 1);
}

export async function refreshAccessToken() {
  const { refresh_token } = await getTokens();

  const res = await axios.post(
    `${AUTH}/auth/token`,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
    {
      auth: {
        username: ENV.EPSON_CLIENT_ID!,
        password: ENV.EPSON_SECRET!,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  await saveTokens(res.data.access_token, res.data.refresh_token);
}




/* 
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "../config/env.config";

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY);
const AUTH = "https://auth.epsonconnect.com";

// row = hall এর printerRow (default 1)
export async function getTokens(row: number = 1) {
  const { data } = await supabase
    .from("epson_tokens")
    .select("access_token, refresh_token, updated_at")
    .eq("id", row)
    .single();
  return data!;
}

export async function saveTokens(
  accessToken: string,
  refreshToken: string,
  row: number = 1
) {
  await supabase
    .from("epson_tokens")
    .update({
      access_token: accessToken,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row);
}

export async function refreshAccessToken(row: number = 1) {
  const { refresh_token } = await getTokens(row);

  const res = await axios.post(
    `${AUTH}/auth/token`,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
    {
      auth: {
        username: ENV.EPSON_CLIENT_ID!,
        password: ENV.EPSON_SECRET!,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  await saveTokens(res.data.access_token, res.data.refresh_token, row);
}
*/