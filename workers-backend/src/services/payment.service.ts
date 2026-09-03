// আপাতত dummy — পরে Supabase থেকে verify করবো
import { DUMMY_TXN_ID, EXPECTED_AMOUNT } from "../config/constants";

// TxnId Supabase এ আছে কিনা check করো (আপাতত dummy compare)
export function validateTransactionId(txnId: string): boolean {
  const bkashRegex = /^[A-Z0-9]{10}$/;

  return bkashRegex.test(txnId) && txnId === DUMMY_TXN_ID;
}

// User যা pay করেছে তা expected amount এর সমান কিনা
export function verifyAmount(amount: number): boolean {
  
  return amount >= EXPECTED_AMOUNT;
}