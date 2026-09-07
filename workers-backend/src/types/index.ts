export interface Env {
  FRONTEND_URL: string;

  SUPABASE_URL: string;
  SUPABASE_KEY: string;          // anon key (existing)
  SUPABASE_SERVICE_KEY: string;  // service_role key — Admin operations এর জন্য লাগবে
                                 // Cloudflare dashboard এ add করতে হবে

  EPSON_CLIENT_ID: string;
  EPSON_SECRET: string;
  EPSON_API_KEY: string;
}

export interface PrintJob {
  fileBuffer: ArrayBuffer;
  fileName: string;
  settings: {
    copies: number;
    color: "mono" | "color";
  };
}

export interface TokenRow {
  access_token: string;
  refresh_token: string;
}

// Auth.users এর user_metadata এ যা store হবে
export interface UserMetadata {
  roll: number;
  name: string;
  gender: "male" | "female";
  preferred_hall_id: string | null;
}