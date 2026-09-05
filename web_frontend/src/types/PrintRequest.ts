export type PrintColor = "color" | "mono";
export type PaymentMethod = "direct" | "wallet";

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
  payment_method: PaymentMethod;
  amount_calculated: number;
  files: PrintFile[];
  total_files: number;
  total_page: number;
  logged_user: boolean;
}
