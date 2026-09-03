import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,

  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_KEY: process.env.SUPABASE_ANON_KEY!,
  
  EPSON_CLIENT_ID: process.env.EPSON_CLIENT_ID!,
  EPSON_SECRET: process.env.EPSON_SECRET!,
  EPSON_API_KEY: process.env.EPSON_API_KEY!,
};