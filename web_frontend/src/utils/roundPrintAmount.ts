export function roundPrintAmount(amount: number): number {
  return Math.floor((amount + 1e-9) * 2) / 2;
}