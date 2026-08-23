import { useMemo, useRef, useEffect, useState } from "react";
import { validatePageRange } from "../../utils/pageRange";
import type { SelectedFile, PrintFileOptions, PagesPerSheet } from "../../types/Print.types";

interface SelectedFileCardProps {
  item: SelectedFile;
  onOptionsChange: (id: string, options: PrintFileOptions) => void;
  onRemove: (id: string) => void;
}

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" className="fill-gray-500 dark:fill-gray-400 shrink-0">
    <path d="M360-460h40v-80h40q17 0 28.5-11.5T480-580v-40q0-17-11.5-28.5T440-660h-80v200Zm40-120v-40h40v40h-40Zm120 120h80q17 0 28.5-11.5T640-500v-120q0-17-11.5-28.5T600-660h-80v200Zm40-40v-120h40v120h-40Zm120 40h40v-80h40v-40h-40v-40h40v-40h-80v200ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" />
  </svg>
);

const RemoveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" className="fill-current">
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </svg>
);

/** Small inline pill toggle — used for Color and Page-selection (2 fixed options) */
const Pill = ({
  options,
  value,
  onChange,
}: {
  options: [{ value: string; label: string }, { value: string; label: string }];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="inline-flex rounded-full bg-gray-100 dark:bg-gray-800 p-1 text-xs">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
          opt.value === value
            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

/** Inline -/+ copies counter */
const CopiesCounter = ({
  value,
  onChange,
  min = 1,
  max = 50,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) => {
  const handleTyped = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") return onChange(min);
    onChange(Math.min(max, Math.max(min, Number(raw))));
  };

  return (
    <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 p-1">
      <button
        type="button"
        onClick={() => value > min && onChange(value - 1)}
        disabled={value <= min}
        className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease copies"
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleTyped}
        className="w-10 text-center bg-transparent text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none"
        aria-label="Number of copies"
      />
      <button
        type="button"
        onClick={() => value < max && onChange(value + 1)}
        disabled={value >= max}
        className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase copies"
      >
        +
      </button>
    </div>
  );
};

const PAGES_PER_SHEET_OPTIONS: { value: PagesPerSheet; label: string }[] = [
  { value: "1", label: "1-up" },
  { value: "2", label: "2-up" },
  { value: "4", label: "4-up" },
  { value: "8", label: "8-up" },
  { value: "16", label: "16-up" },
];

/** Inline custom dropdown for pages-per-sheet */
const PagesPerSheetDropdown = ({
  value,
  onChange,
}: {
  value: PagesPerSheet;
  onChange: (value: PagesPerSheet) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = PAGES_PER_SHEET_OPTIONS.find((o) => o.value === value) ?? PAGES_PER_SHEET_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-24 flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        {selected.label}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <path d="M480-360 280-560h400L480-360Z" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-32 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 py-1 overflow-hidden">
          {PAGES_PER_SHEET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {opt.label}
              {opt.value === value && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -960 960 960" fill="currentColor">
                  <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SelectedFileCard = ({ item, onOptionsChange, onRemove }: SelectedFileCardProps) => {
  const { options, totalPages } = item;

  const rangeError = useMemo(() => {
    if (options.pageSelection !== "custom") return null;
    return validatePageRange(options.customPageRange, totalPages);
  }, [options.pageSelection, options.customPageRange, totalPages]);

  const update = <K extends keyof PrintFileOptions>(key: K, value: PrintFileOptions[K]) => {
    onOptionsChange(item.id, { ...options, [key]: value });
  };

  return (
    <div className="border rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 overflow-hidden">
      {/* Header: file name + real PDF page count + remove */}
      <div className="flex items-center justify-between gap-4 p-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 min-w-0">
          <FileIcon />
          <h2 className="line-clamp-1 text-sm font-medium text-gray-800 dark:text-gray-100">
            {item.file.name}
          </h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {totalPages !== null ? `${totalPages} Pages` : "..."}
          </span>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
            aria-label={`Remove ${item.file.name}`}
          >
            <RemoveIcon />
          </button>
        </div>
      </div>

      {/* Options: copies, color, pages-per-sheet, page range */}
      <div className="flex flex-col gap-4 p-4 text-sm">
        <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">Copies</h3>
            <CopiesCounter value={options.copies} onChange={(v) => update("copies", v)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">Color</h3>
            <Pill
              value={options.colorMode}
              onChange={(v) => update("colorMode", v as PrintFileOptions["colorMode"])}
              options={[{ value: "bw", label: "B&W" }, { value: "color", label: "Color" }]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">Pages per sheet</h3>
            <PagesPerSheetDropdown value={options.pagesPerSheet} onChange={(v) => update("pagesPerSheet", v)} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">Pages</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Pill
              value={options.pageSelection}
              onChange={(v) => update("pageSelection", v as PrintFileOptions["pageSelection"])}
              options={[{ value: "all", label: "All" }, { value: "custom", label: "Custom" }]}
            />
            {options.pageSelection === "custom" && (
              <input
                type="text"
                value={options.customPageRange}
                onChange={(e) => update("customPageRange", e.target.value)}
                placeholder="e.g. 1-5, 8, 11-13"
                className={`flex-1 min-w-45 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-shadow ${
                  rangeError ? "ring-2 ring-red-300 dark:ring-red-600" : "focus:ring-blue-200 dark:focus:ring-blue-800"
                }`}
              />
            )}
          </div>
          {rangeError && <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">{rangeError}</p>}
        </div>
      </div>
    </div>
  );
};

export default SelectedFileCard;