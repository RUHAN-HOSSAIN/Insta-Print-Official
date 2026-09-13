export type MfsProvider = "bkash" | "nagad";

export interface IncomingMfsSms {
  message: string;
}

export interface MfsTransactionRow {
  provider: MfsProvider;
  txn_id: string;
  amount_paid: number;
  sender_number: string;
  balance: number | null;
  raw_text: string;
  receive_at: string;
}

export interface ParsedMfsSms {
  status: "received";
  transaction: MfsTransactionRow;
}
