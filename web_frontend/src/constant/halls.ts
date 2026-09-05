export const HALLS = [
  {
    id: "male_hall_02",
    name: "Male Hall 02 (Shaheed Hadi Hall)",
    tokenRow: 1,
    active: true,
  },
  {
    id: "haque_hall",
    name: "Sher E Bangla AK Fazlul Haque Hall",
    tokenRow: 2,
    active: false,
  },
  {
    id: "shahidul_hall",
    name: "Shaheed Shahidul Islam Hall",
    tokenRow: 3,
    active: false,
  },
  {
    id: "male_hall_01",
    name: "Male Hall 01",
    tokenRow: 4,
    active: false,
  },
  {
    id: "ziaur_hall",
    name: "Shaheed President Ziaur Rahman Hall",
    tokenRow: 5,
    active: false,
  },
  {
    id: "selim_hall",
    name: "Shaheed LT. Selim Hall",
    tokenRow: 6,
    active: false,
  },
] as const;

export type HallId = (typeof HALLS)[number]["id"];