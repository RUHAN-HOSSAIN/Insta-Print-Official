export const HALLS = [
  {
    id: "male_hall_02",
    name: "Shaheed Hadi Hall (Male Hall 02)",
    printerRow: 1, // Supabase epson_tokens table এ কোন row
    active: true,  // এখন শুধু এটাই active
  },
  {
    id: "haque_hall",
    name: "Sher E Bangla AK Fazlul Haque Hall",
    printerRow: 2,
    active: false, // পরে add করবে
  },
  {
    id: "shahidul_hall",
    name: "Shaheed Shahidul Islam Hall",
    printerRow: 3,
    active: false,
  },
  {
    id: "male_hall_01",
    name: "Male Hall 01",
    printerRow: 4,
    active: false,
  },
  {
    id: "ziaur_hall",
    name: "Shaheed President Ziaur Rahman Hall",
    printerRow: 5,
    active: false,
  },
  {
    id: "selim_hall",
    name: "Shaheed LT. Selim Hall",
    printerRow: 6,
    active: false,
  },
] as const;

export type HallId = (typeof HALLS)[number]["id"];