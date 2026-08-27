// export function validateTransactionId(txnId: string): boolean {
//   // bKash: 10 digit number
//   // Nagad: 8 digit number
//   const bkashRegex = /^[A-Z0-9]{10}$/;
//   const nagadRegex = /^[A-Z0-9]{8}$/;
//   return bkashRegex.test(txnId) || nagadRegex.test(txnId);
// }

const VALID_TXN_ID = "ABCDE12345"; // এইটা শুধু test এর জন্য, বাস্তবে তোমার database বা payment gateway থেকে validate করতে হবে

export function validateTransactionId(txnId: string): boolean {
  const bkashRegex = /^[A-Z0-9]{10}$/;

  return bkashRegex.test(txnId) && txnId === VALID_TXN_ID;
}

const payedAmount = 200; // এইটা শুধু test এর জন্য, বাস্তবে তোমার database বা payment gateway থেকে validate করতে হবে

export function verifyAmount(amount: number): boolean {
  return amount === payedAmount || payedAmount >= amount; // যদি expectedAmount 0 হয়, তাহলে সব amount valid হবে
}