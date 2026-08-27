// components/print/SelectedFileCard.tsx
import { useState } from "react";
import { CloseIcon } from "../../assets/icons/Icons";

import { pricingData } from "../../constant/pricing";

interface Props {
  file: File;
  index: number;
  onRemove: (index: number) => void;
}

// Inline toggle — আলাদা file বানানোর দরকার নেই
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
    className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none
      ${checked ? "bg-blue-600" : "bg-gray-300"}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
        ${checked ? "translate-x-6" : "translate-x-0"}`}
    />
  </button>
);

const PER_PAGE_BW = Number(pricingData[0].price.slice(0, -3)); // Remove " Tk" and convert to number
const PER_PAGE_COLOR = Number(pricingData[1].price.slice(0, -3)); // Remove " Tk" and convert to number

const SelectedFileCard = ({ file, index, onRemove }: Props) => {
  const [isColor, setIsColor] = useState(false);
  const [copies, setCopies] = useState(1);

  // hardcoded এখন, pdf-lib integration পরে
  const pageCount = 5;

  const unitPrice = isColor ? PER_PAGE_COLOR : PER_PAGE_BW;
  const total = pageCount * copies * unitPrice;

  const decreaseCopies = () => setCopies((c) => Math.max(1, c - 1));
  const increaseCopies = () => setCopies((c) => Math.min(50, c + 1));

  return (
    <div className="bg-white px-6 py-5 shadow-md border border-gray-200 rounded">
      {/* ── Header: filename + page count + remove ── */}
      <div className="flex justify-between items-center gap-4 border-b border-gray-200 pb-3">
        <h2 className="font-medium text-gray-900 text-sm truncate flex-1">
          {file.name}
        </h2>
        <div className="flex items-center gap-3 shrink-0">
          <span className="bg-gray-50 border border-gray-200 shadow-sm text-gray-600 px-3 py-0.5 rounded-full text-xs">
            {pageCount} pages
          </span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="hover:scale-105 transition-transform"
          >
            <CloseIcon className="text-white bg-red-600 rounded" />
          </button>
        </div>
      </div>

      {/* ── Settings rows ── */}
      <div className="flex flex-col gap-2 pt-4">
        {/* Color Printing */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-gray-50 rounded border border-gray-100 shadow-[0px_0px_4px_rgba(0,0,0,0.08)]">
          <span className="text-sm text-gray-700 font-medium">Color Printing</span>
          <Toggle checked={isColor} onChange={setIsColor} />
        </div>

        {/* Copies */}
        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded border border-gray-100 shadow-[0px_0px_4px_rgba(0,0,0,0.08)]">
          <span className="text-sm text-gray-700 font-medium">Copies</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={decreaseCopies}
              className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 text-lg font-medium hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center"
            >
              −
            </button>
            <div className="w-10 h-8 rounded border border-gray-300 bg-white flex items-center justify-center text-sm font-semibold text-gray-800">
              {copies}
            </div>
            <button
              type="button"
              onClick={increaseCopies}
              className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 text-lg font-medium hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* ── Price summary ── */}
      <div className="mt-4 pt-3 px-1 flex justify-between items-center border-t border-gray-200 text-gray-600 text-sm">
        <span>
          {pageCount}p × {isColor ? "Color" : "B&W"} × {copies}
        </span>
        <span className="font-semibold text-gray-900">৳ {total}</span>
      </div>
    </div>
  );
};

export default SelectedFileCard;