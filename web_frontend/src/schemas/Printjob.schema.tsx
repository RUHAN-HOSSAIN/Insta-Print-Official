import { z } from "zod";

export const printJobSchema = z.object({
  file: z
    .instanceof(File, { message: "PDF file is required" })
    .refine((f) => f.type === "application/pdf", "Only PDF files are allowed"),

  pageMode: z.enum(["all", "range"]),
  fromPage: z.number().min(1).optional(),
  toPage: z.number().min(1).optional(),

  copies: z.number().min(1).max(20),

  colorMode: z.enum(["bw", "color"]),

  pagesPerSheet: z.enum(["1", "2", "4"]),

  paymentMethod: z.enum(["bkash", "nagad"]),
  transactionId: z.string().min(3, "Transaction ID is required"),
}).refine(
  (data) => data.pageMode === "all" || (data.fromPage && data.toPage && data.fromPage <= data.toPage),
  { message: "Invalid page range", path: ["toPage"] }
);

export type PrintJobFormValues = z.infer<typeof printJobSchema>;