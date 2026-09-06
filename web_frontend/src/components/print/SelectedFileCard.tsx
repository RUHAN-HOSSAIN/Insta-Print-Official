// components/print/SelectedFileCard.tsx
import { useEffect, useState } from "react";
import { CloseIcon } from "../../assets/icons/Icons";
import { getPdfPageCount } from "../../utils/pdfPageCount";
import { analyzePdfInkCoverage } from "../../utils/pdfColorAnalysis";

import { pricingData } from "../../constant/pricing";
import type { PrintFile } from "../../types/PrintRequest";

interface Props {
  file: File;
  index: number;
  onRemove: (index: number) => void;
  onTotalChange: (index: number, total: number) => void;
  onDetailsChange: (index: number, details: PrintFile | null) => void;
  isCoverLetter?: boolean;
}

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative w-13 h-7 min-[900px]:w-14 min-[900px]:h-8 rounded-full transition-colors duration-200 focus:outline-none border border-gray-100
      ${checked ? "bg-blue-500" : "bg-[#E9E9EA]"}`}
  >
    <span
      className={`absolute top-1 left-1 w-5 h-5 min-[900px]:w-6 min-[900px]:h-6 bg-white rounded-full shadow-md transition-transform duration-200
        ${checked ? "translate-x-6" : "translate-x-0"}`}
    />
  </button>
);

const BASE_BW = pricingData[0].price;
const BASE_COLOR = pricingData[1].price;

const SelectedFileCard = ({
  file,
  index,
  onRemove,
  onTotalChange,
  onDetailsChange,
  isCoverLetter = false,
}: Props) => {
  const [isColor, setIsColor] = useState(false);
  const [copies, setCopies] = useState(1);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageCountError, setPageCountError] = useState(false);

  // dynamic ink analysis state — file এর জন্য একবারই চলে
  const [inkRates, setInkRates] = useState<{
    bwRate: number;
    colorRate: number;
    isDynamic: boolean;
    inkMessage: string | null;
  } | null>(null);

  useEffect(() => {
    let isCurrentFile = true;

    getPdfPageCount(file)
      .then((count) => {
        if (isCurrentFile) setPageCount(count);
      })
      .catch(() => {
        if (isCurrentFile) setPageCountError(true);
      });

    // cover letter এর জন্য ink analysis দরকার নেই
    if (!isCoverLetter) {
      analyzePdfInkCoverage(file, BASE_BW, BASE_COLOR).then((result) => {
        if (isCurrentFile) {
          setInkRates({
            bwRate: result.bwRate,
            colorRate: result.colorRate,
            isDynamic: result.isDynamic,
            inkMessage: result.inkMessage,
          });
        }
      });
    }

    return () => {
      isCurrentFile = false;
    };
  }, [file, isCoverLetter]);

  // rates ready না হওয়া পর্যন্ত base rate ব্যবহার করো
  const unitPrice = isColor
    ? inkRates?.colorRate ?? BASE_COLOR
    : inkRates?.bwRate ?? BASE_BW;
  const isDynamicPrice = inkRates?.isDynamic ?? false;

  const total = isCoverLetter ? 1 : Math.round((pageCount ?? 0) * copies * unitPrice * 100) / 100;

  useEffect(() => {
    if (isCoverLetter || pageCount !== null) onTotalChange(index, total);
    if (pageCount !== null || isCoverLetter) {
      onDetailsChange(index, {
        name: file.name,
        pages: pageCount ?? 1,
        copies: isCoverLetter ? 1 : copies,
        color: isCoverLetter ? "mono" : isColor ? "color" : "mono",
        subtotal: total,
      });
    }
  }, [copies, file.name, index, isColor, isCoverLetter, onDetailsChange, onTotalChange, pageCount, total]);

  const decreaseCopies = () => setCopies((c) => Math.max(1, c - 1));
  const increaseCopies = () => setCopies((c) => Math.min(20, c + 1));

  return (
    <div className="font-roboto bg-white px-5 md:px-7 py-5 shadow-[0px_1px_10px_rgba(0,0,0,0.2)]">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 border-b border-gray-300 pb-3">
        <h2 className="font-medium text-gray-900 md:text-lg truncate flex-1">
          {file.name}
        </h2>
        <div className="flex items-center gap-2 md:gap-5 shrink-0">
          <span className="text-gray-700 text-[10px] md:text-[13px] font-semibold shadow-[0px_0px_10px_rgba(0,0,0,0.1)] px-1.5 py-0.5 md:px-3 md:py-1 rounded-full border border-gray-200">
            {pageCountError ? "Invalid PDF" : pageCount === null ? "Reading..." : `${pageCount} page${pageCount === 1 ? "" : "s"}`}
          </span>
          <button type="button" onClick={() => onRemove(index)} className="hover:scale-107 transition-transform">
            <CloseIcon className="text-white bg-red-600 rounded w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="flex flex-col gap-3 pt-4">
        <div
          className={`flex justify-between items-center px-4 py-3 rounded border border-gray-100 hover:scale-104 transition-all duration-300 shadow-[0px_0px_5px_rgba(0,0,0,0.1)]
                      ${isColor ? "bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.3)]" : "bg-[#F9F9F9]"}`}
        >
          <span className="min-[900px]:text-lg text-gray-600 font-semibold">Color Printing</span>
          <Toggle checked={isColor} onChange={setIsColor} />
        </div>

        <div
          className={`flex justify-between items-center px-4 py-3 rounded border border-gray-100 hover:scale-104 transition-all duration-300 shadow-[0px_0px_5px_rgba(0,0,0,0.1)]
                      ${copies > 1 ? "bg-white shadow-[0px_0px_10px_rgba(0,0,0,0.3)]" : "bg-[#F9F9F9]"}`}
        >
          <span className="min-[900px]:text-lg text-gray-600 font-semibold">Copies</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={decreaseCopies} className="w-6 h-6 min-[900px]:w-8 min-[900px]:h-8 rounded border border-gray-300 bg-white text-gray-700 text-lg font-medium hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center">-</button>
            <div className="w-8 h-6 min-[900px]:w-12 min-[900px]:h-8 rounded border border-gray-300 bg-white flex items-center justify-center text-sm font-semibold text-gray-800">{copies}</div>
            <button type="button" onClick={increaseCopies} className="w-6 h-6 min-[900px]:w-8 min-[900px]:h-8 rounded border border-gray-300 bg-white text-gray-700 text-lg font-medium hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center">+</button>
          </div>
        </div>
      </div>

      {/* Price summary — dynamic হলে yellow */}
      <div className="mt-4 pt-3 px-1 flex justify-between items-center border-t border-gray-300 text-gray-600 text-sm md:text-base font-medium">
        <span>
          {pageCount === null ? "Reading pages..." : `${pageCount}p`} &times; {isCoverLetter ? "Cover letter" : isColor ? "Color" : "B&W"} &times; {isCoverLetter ? "1" : copies}
        </span>
        <div className="flex items-baseline gap-2 text-right">
          {!isCoverLetter && inkRates?.inkMessage && (
            <span className="text-[10px] md:text-xs text-yellow-500">
              {inkRates.inkMessage}
            </span>
          )}
          <span
            className={`font-semibold text-lg ${
              !isCoverLetter && isDynamicPrice ? "text-yellow-500" : "text-gray-900"
            }`}
          >
            ৳ {pageCount === null ? "-" : isDynamicPrice && !isCoverLetter ? total.toFixed(2) : total}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SelectedFileCard;