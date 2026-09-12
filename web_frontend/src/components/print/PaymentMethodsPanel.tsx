import { Link } from "react-router-dom";

import { useState } from "react";
import { CopyIcon } from "../../assets/icons/Icons";
import { paymentMethods } from "../../constant/paymentMethods";
import type { PaymentMethod } from "../../types/PrintRequest";
import {
  CircleCheck,
  MessageCircleWarningIcon,
  Wallet,
} from "lucide-react";

interface PaymentMethodsPanelProps {
  totalPrice: number;
  loggedUser: boolean;
  paymentMethod: PaymentMethod;
  walletBalance: number;
  onPaymentMethodChange: (method: PaymentMethod) => void;
}

interface PaymentToProps {
  copiedMedium: string | null;
  copyNumber: (medium: string, number: string) => void;
  className?: string;
}

const PaymentTo = ({ copiedMedium, copyNumber, className = "" }: PaymentToProps) => (
  <div className={className}>
    {paymentMethods.map((method) => (
      <div key={method.medium} className="flex items-center gap-2 sm:gap-3 md:gap-5 my-2 font-roboto">
        <span className={`font-medium text-sm sm:text-base shrink-0 ${method.status === "unavailable" ? "text-gray-500" : "text-gray-800"}`}>
          <b>{method.medium}:</b> {method.number}
        </span>
        <button
          type="button"
          disabled={method.status === "unavailable"}
          onClick={() => void copyNumber(method.medium, method.number)}
          className={`transition ${method.status === "unavailable" ? "cursor-not-allowed text-gray-700" : "text-gray-700 hover:scale-107 hover:text-blue-600"}`}
          aria-label={method.status === "unavailable" ? `${method.medium} number currently unavailable` : `Copy ${method.medium} number`}
          title={method.status === "unavailable" ? "Currently unavailable" : `Copy ${method.medium} number`}
        >
          <CopyIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
        </button>
        {method.status === "unavailable" ? (
          <span className="text-xs text-gray-500">Unavailable</span>
        ) : copiedMedium === method.medium ? (
          <span className="text-xs text-green-600">Copied</span>
        ) : null}
      </div>
    ))}
  </div>
);

const PaymentMethodsPanel = ({
  totalPrice,
  loggedUser,
  paymentMethod,
  walletBalance,
  onPaymentMethodChange,
}: PaymentMethodsPanelProps) => {
  const [copiedMedium, setCopiedMedium] = useState<string | null>(null);

  const copyNumber = async (medium: string, number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedMedium(medium);
      window.setTimeout(() => setCopiedMedium(null), 1500);
    } catch {
      setCopiedMedium(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:mt-7 shadow-[0px_0px_4px_rgba(0,0,0,0.2)] px-5 py-3 border border-gray-300 rounded-lg bg-white">
      {loggedUser ? (
        <fieldset className="pb-3 px-1">
          <legend className="font-spaceG text-md sm:text-xl font-bold text-blue-600 text-shadow-xs">
            Payment method
          </legend>

          <div className="flex items-center my-2 md:my-3 lg:my-4 w-full rounded-lg shadow-[0px_0px_4px_rgba(0,0,0,0.2)] border border-gray-300 bg-white overflow-hidden">
            <button
              onClick={() => onPaymentMethodChange("wallet")}
              className={`w-full flex items-center justify-center gap-2 py-1 md:py-2 transition-all duration-100
                ${paymentMethod === "wallet" ? "bg-green-600 text-white font-semibold" : "text-gray-700"}`}
            >
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 " />
              <p className="">Wallet</p>
            </button>
            <button
              onClick={() => onPaymentMethodChange("direct")}
              className={`w-full flex items-center justify-center transition-all duration-100
                ${paymentMethod === "direct" ? "bg-linear-to-r from-pink-500 to-purple-600 text-white font-semibold" : "text-gray-700"} py-1 md:py-2`}
            >
              Bkash / Nagad
            </button>
          </div>

          {paymentMethod === "direct" ? (
            <div className=" shadow-[0px_0px_5px_rgba(0,0,0,0.3)] px-4 pt-3 pb-1 rounded-lg">
              <p className="text-sm text-gray-500 pb-2">
                &gt; Do <b>Send Money</b> to one of these numbers
              </p>
              <PaymentTo copiedMedium={copiedMedium} copyNumber={copyNumber} />
            </div>
          ) : (
            <div className="flex flex-col gap-2 shadow-[0px_0px_5px_rgba(0,0,0,0.3)] px-4 pt-1 pb-3 rounded-lg ">
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm sm:text-base 2xl:text-lg font-semibold text-gray-800">
                  Balance:
                </h2>
                <span
                  className={`font-bold text-base sm:text-lg md:text-lg 2xl:text-xl flex items-baseline gap-1 ${walletBalance < totalPrice ? "text-orange-500" : "text-green-800"}`}
                >
                  <span className="text-xl sm:text-2xl 2xl:text-3xl ">
                    ৳
                  </span>{" "}
                  <span>
                    {walletBalance.toFixed(2)}
                  </span>
                </span>
              </div>

              {walletBalance < totalPrice ? (
                <div className="flex items-center gap-2 mt-1 ">
                  <MessageCircleWarningIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 inline-block mr-1" />
                  <span className="text-sm sm:text-base text-orange-500">
                    Insufficient balance. Top-up now.
                  </span>
                  <Link
                    to="/dashboard/topup"
                    className="shrink-0 ml-3 text-xs md:text-sm px-3 pb-0.5 md:pb-1 font-semibold text-green-600 border-2 border-green-500 rounded-lg flex items-center shadow-[0px_0px_5px_rgba(0,0,0,0.1)] hover:scale-105 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.2)] transition-all"
                  >
                    Top Up
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-1 ">
                  <CircleCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 inline-block mr-1" />
                  <span className="text-sm sm:text-base text-green-600">
                    Sufficient balance. You can pay from your wallet.
                  </span>
                </div>
              )}
            </div>
          )}
        </fieldset>
      ) : (
        <>
          <h2 className="font-spaceG text-md sm:text-xl font-bold text-blue-600">
            Pay via (Send Money){" "}
            <sup className="text-[10px] sm:text-xs text-red-400">
              *Pay Exact
            </sup>
          </h2>
          <PaymentTo copiedMedium={copiedMedium} copyNumber={copyNumber} className="mr-2" />
        </>
      )}
    </div>
  );
};

export default PaymentMethodsPanel;
