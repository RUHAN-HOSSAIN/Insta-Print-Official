import {
  IncomingMfsSms,
  MfsProvider,
  MfsTransactionRow,
  ParsedMfsSms,
} from "./mfs.types";

const BKASH_RECEIVE_PATTERN = /You have received\s+Tk\s*([\d,]+(?:\.\d{1,2})?)\s+from\s+(\d{10,15}).*?Fee\s+Tk\s*([\d,]+(?:\.\d{1,2})?).*?Balance\s+Tk\s*([\d,]+(?:\.\d{1,2})?).*?TrxID\s+([A-Z0-9]+)\s+at\s+(.+)$/is;
const NAGAD_RECEIVE_PATTERN = /Money Received\.\s*Amount:\s*Tk\s*([\d,]+(?:\.\d{1,2})?)\s*Sender:\s*(\d{10,15})\s*Ref:\s*(.*?)\s*TxnID:\s*([A-Z0-9]+)\s*Balance:\s*Tk\s*([\d,]+(?:\.\d{1,2})?)\s*(.+)$/is;

function normalizeProvider(message: string): MfsProvider | null {
  if (/money received\./i.test(message)) return "nagad";
  if (/you have received\s+tk/i.test(message)) return "bkash";
  return null;
}

function amount(value: string): number {
  return Number(value.replace(/,/g, ""));
}

function receiveAt(value: string): string {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) throw new Error("Unsupported SMS date format");

  const [, day, month, year, hour, minute] = match;
  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  const hourNumber = Number(hour);
  const minuteNumber = Number(minute);
  const localDate = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber, hourNumber, minuteNumber));

  if (
    Number.isNaN(localDate.getTime()) ||
    localDate.getUTCFullYear() !== yearNumber ||
    localDate.getUTCMonth() + 1 !== monthNumber ||
    localDate.getUTCDate() !== dayNumber ||
    localDate.getUTCHours() !== hourNumber ||
    localDate.getUTCMinutes() !== minuteNumber
  ) {
    throw new Error("Invalid SMS date");
  }

  return new Date(localDate.getTime() - 6 * 60 * 60 * 1000).toISOString();
}

function buildRow(
  input: IncomingMfsSms,
  provider: MfsProvider,
  values: {
    amount: string;
    sender: string;
    balance: string;
    fee?: string;
    trxId: string;
    reference?: string;
    timestamp: string;
  },
): MfsTransactionRow {
  const txnId = values.trxId.trim();
  const paidAmount = amount(values.amount);
  const currentBalance = amount(values.balance);

  if (!/^[A-Z0-9]{8}$|^[A-Z0-9]{10}$/.test(txnId)) {
    throw new Error("Unsupported transaction ID format");
  }
  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    throw new Error("Invalid received amount");
  }
  if (!Number.isFinite(currentBalance) || currentBalance < 0) {
    throw new Error("Invalid balance amount");
  }

  return {
    provider,
    txn_id: txnId,
    amount_paid: paidAmount,
    sender_number: values.sender.trim(),
    balance: currentBalance,
    raw_text: input.message.trim(),
    receive_at: receiveAt(values.timestamp),
  };
}

export function parseIncomingMfsSms(input: IncomingMfsSms): ParsedMfsSms | null {
  const message = input.message.trim();
  const provider = normalizeProvider(message);
  if (!provider) return null;

  if (provider === "bkash") {
    const match = message.match(BKASH_RECEIVE_PATTERN);
    if (!match) return null;

    return {
      status: "received",
      transaction: buildRow(input, provider, {
        amount: match[1],
        sender: match[2],
        fee: match[3],
        balance: match[4],
        trxId: match[5],
        timestamp: match[6],
      }),
    };
  }

  const match = message.match(NAGAD_RECEIVE_PATTERN);
  if (!match) return null;

  return {
    status: "received",
    transaction: buildRow(input, provider, {
      amount: match[1],
      sender: match[2],
      reference: match[3],
      trxId: match[4],
      balance: match[5],
      timestamp: match[6],
    }),
  };
}
