import { useState } from "react";
import { CopyIcon } from "../../assets/icons/Icons";
import { paymentMethods } from "../../constant/paymentMethods";

const PaymentMethodsPanel = () => {
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
      <h2 className="font-spaceG text-md sm:text-xl font-bold text-blue-600">Pay via (Send Money)</h2>
      <div>
        {paymentMethods.map((method) => (
          <div key={method.medium} className="flex items-center gap-2 sm:gap-3 md:gap-5 my-2 mr-2">
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
              <CopyIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            {method.status === "unavailable" ? (
              <span className="text-xs text-gray-700">Currently unavailable</span>
            ) : copiedMedium === method.medium ? (
              <span className="text-xs text-green-600">Copied</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodsPanel;
