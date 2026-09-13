import { Env } from "../types";
import { getSupabaseAdmin } from "../services/auth.service";
import { MfsTransactionRow } from "./mfs.types";

export async function saveMfsTransaction(
  env: Env,
  transaction: MfsTransactionRow,
): Promise<{ pay_id: string; si_no: number }> {
  const { data, error } = await getSupabaseAdmin(env)
    .from("mfs_transactions")
    .insert({
      provider: transaction.provider,
      txn_id: transaction.txn_id,
      amount_paid: transaction.amount_paid,
      sender_number: transaction.sender_number,
      balance: transaction.balance,
      raw_text: transaction.raw_text,
      receive_at: transaction.receive_at,
    })
    .select("pay_id, si_no")
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("This transaction has already been received.");
    throw new Error("Unable to save MFS transaction");
  }
  if (!data) throw new Error("Unable to save MFS transaction");
  return data;
}
