export interface Env {
  FRONTEND_URL: string;

  SUPABASE_URL: string;
  SUPABASE_KEY: string;

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