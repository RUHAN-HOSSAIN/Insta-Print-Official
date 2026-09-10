export type PaymentMethodStatus = "available" | "unavailable";

export interface PaymentMethod {
  medium: "BKash" | "Nagad";
  number: string;
  status: PaymentMethodStatus;
}

export const paymentMethods: PaymentMethod[] = [
  {
    medium: "BKash",
    number: "01932066557",
    status: "available",
  },
  {
    medium: "Nagad",
    number: "01932066557",
    status: "available",
  },
];
