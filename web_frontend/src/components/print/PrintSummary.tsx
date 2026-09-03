import type { ReactNode } from "react";
import { previewPdf } from "../../utils/createCoverLetterPdf";

interface PrintSummaryProps {
  totalPrice: number;
  roundedTotalPrice: number;
  transactionId: string;
  transactionError: boolean;
  formError: string;
  submitMessage: string;
  isBusy: boolean;
  generatedCoverLetter: File | null;
  onTransactionChange: (value: string) => void;
  onClear: () => void;
  onPrint: () => void;
  children: ReactNode;
  coverLetterToggle: ReactNode;
  coverLetterFields: ReactNode;
}

const PrintSummary = ({
  totalPrice,
  roundedTotalPrice,
  transactionId,
  transactionError,
  formError,
  submitMessage,
  isBusy,
  generatedCoverLetter,
  onTransactionChange,
  onClear,
  onPrint,
  children,
  coverLetterToggle,
  coverLetterFields,
}: PrintSummaryProps) => (
  <div className="flex-1 md:sticky top-24 self-start p-6 lg:p-10 shadow-[0px_0px_10px_rgba(0,0,0,0.2)] bg-white rounded-lg">
    {children}
    <div className="flex items-center justify-between gap-7 my-5 mr-2">
      <div className="shadow-[0px_0px_4px_rgba(0,0,0,0.2)] border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between gap-3 w-full ">
        <input
          type="text"
          placeholder="Transaction ID"
          value={transactionId}
          onChange={(event) => onTransactionChange(event.target.value)}
          aria-invalid={transactionError}
          className={`w-full focus:outline-none ${transactionError ? "text-red-700" : ""}`}
        />
      </div>
      {coverLetterToggle}
    </div>
    {coverLetterFields}
    <div className="flex justify-between items-center text-2xl my-4 mx-2">
      <h2 className="font-medium text-gray-900">Total Price</h2>
      <div className="font-bold text-blue-700 text-3xl flex items-baseline gap-2">
        <h3 className="font-normal text-lg text-gray-500 line-through">
          ৳ {totalPrice.toFixed(2)}
        </h3>
        <h1>৳ {roundedTotalPrice}</h1>
      </div>
    </div>
    {(formError || submitMessage) && (
      <p
        className={`mb-3 text-sm ${formError ? "text-red-600" : "text-green-600"}`}
      >
        {formError || submitMessage}
      </p>
    )}
    <div className="w-full mt-5">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClear}
          className="flex-1 w-full rounded-lg border-2 border-blue-600 bg-white px-4 py-2 font-bold text-blue-600 transition-all hover:bg-blue-600 hover:text-white hover:scale-105"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onPrint}
          disabled={isBusy}
          className="flex-3 w-full rounded-lg bg-green-600 px-4 py-2 font-bold text-white transition-transform hover:scale-102 disabled:cursor-wait disabled:opacity-60"
        >
          {isBusy ? "Preparing..." : "Start Printing"}
        </button>
      </div>
      {generatedCoverLetter && (
        <button
          type="button"
          onClick={() => previewPdf(generatedCoverLetter)}
          className="mt-2 w-full text-sm font-medium text-blue-700 hover:underline"
        >
          Preview generated cover letter PDF
        </button>
      )}
    </div>
  </div>
);

export default PrintSummary;
