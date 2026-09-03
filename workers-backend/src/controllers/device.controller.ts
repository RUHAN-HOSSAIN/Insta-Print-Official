import { Env } from "../types";
import { EPSON_BASE_URL } from "../config/constants";
import { HALLS, HallId } from "../config/constants";
import { getTokens, refreshAccessToken } from "../services/supabase.service";

export async function getDeviceStatus(
  env: Env,
  hallId: HallId,
): Promise<Response> {
  const corsHeaders = { "Access-Control-Allow-Origin": "*" };

  // Hall খুঁজে বের করো
  const hall = HALLS.find((h) => h.id === hallId);
  if (!hall) {
    return Response.json(
      { error: "Hall not found" },
      { status: 404, headers: corsHeaders },
    );
  }
  if (!hall.active) {
    return Response.json(
      { connected: false, error: "Hall not active yet" },
      { status: 200, headers: corsHeaders },
    );
  }

  try {
    const { access_token } = await getTokens(env, hall.tokenRow);

    let res = await fetch(`${EPSON_BASE_URL}/api/2/printing/devices/info`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "x-api-key": env.EPSON_API_KEY,
      },
    });

    if (res.status === 401) {
      const newToken = await refreshAccessToken(env, hall.tokenRow);
      res = await fetch(`${EPSON_BASE_URL}/api/2/printing/devices/info`, {
        headers: {
          Authorization: `Bearer ${newToken}`,
          "x-api-key": env.EPSON_API_KEY,
        },
      });
    }

    const data: any = await res.json();
    return Response.json(
      { connected: data.connected ?? false },
      { headers: corsHeaders },
    );
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Device status error:", message);
    return Response.json(
      { connected: false, error: "Failed to reach printer" },
      { status: 500, headers: corsHeaders },
    );
  }
}