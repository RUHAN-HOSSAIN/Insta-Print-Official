export type PrintColor = "color" | "mono";

export interface PrintFile {
  name: string;
  pages: number;
  copies: number;
  color: PrintColor;
  subtotal: number;
}

export interface PrintFormValues {
  hall_id: string;
  txn_id: string;
  amount_calculated: number;
  files: PrintFile[];
  total_files: number;
  total_page: number;
  cover_letter: boolean;
}
