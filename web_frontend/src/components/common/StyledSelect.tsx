import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type StyledSelectOption = {
  value: string;
  label: string;
};

interface StyledSelectProps {
  id: string;
  value: string;
  options: StyledSelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  error?: boolean;
  className?: string;
}

const StyledSelect = ({
  id,
  value,
  options,
  placeholder,
  onChange,
  error = false,
  className = "",
}: StyledSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setIsOpen(false);
        }}
        className={` flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2.5 text-left text-sm text-slate-900 shadow-sm outline-none transition hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${error ? "border-amber-500 ring-2 ring-amber-100" : "border-slate-300"}`}
      >
        <span className={selectedOption ? "truncate" : "truncate text-slate-500"}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-700 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          id={`${id}-options`}
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`block w-full border-b border-slate-100 px-3 py-2.5 text-left text-sm last:border-b-0 hover:bg-blue-50 ${option.value === value ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-800"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StyledSelect;
