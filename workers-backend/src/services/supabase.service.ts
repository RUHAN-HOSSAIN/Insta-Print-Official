import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Env, TokenRow } from "../types";
import { EPSON_AUTH_URL } from "../config/constants";

export function getSupabase(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
}

// tokenRow দিয়ে নির্দিষ্ট hall এর token আনো
export async function getTokens(env: Env, tokenRow: number): Promise<TokenRow> {
  const { data, error } = await getSupabase(env)
    .from("epson_tokens")
    .select("access_token, refresh_token")
    .eq("id", tokenRow)
    .single();

  if (error || !data) throw new Error("Failed to fetch tokens");
  return data as TokenRow;
}

// নির্দিষ্ট hall এর token save করো
export async function saveTokens(
  env: Env,
  tokenRow: number,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await getSupabase(env)
    .from("epson_tokens")
    .update({
      access_token: accessToken,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tokenRow);
}

// নির্দিষ্ট hall এর token refresh করো
export async function refreshAccessToken(
  env: Env,
  tokenRow: number
): Promise<string> {
  const { refresh_token } = await getTokens(env, tokenRow);
  const credentials = btoa(`${env.EPSON_CLIENT_ID}:${env.EPSON_SECRET}`);

  const res = await fetch(`${EPSON_AUTH_URL}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });

  if (!res.ok) throw new Error("Failed to refresh token");

  const data: any = await res.json();
  await saveTokens(env, tokenRow, data.access_token, data.refresh_token);
  return data.access_token;
}