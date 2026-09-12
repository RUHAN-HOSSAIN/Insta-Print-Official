import { AlertCircle } from "lucide-react";

interface FieldWarningProps {
  message?: string;
}

const FieldWarning = ({ message }: FieldWarningProps) => {
  if (!message) return null;
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 w-max max-w-[calc(100vw-40px)] -translate-x-1/2 animate-[field-warning-in_220ms_ease-out] rounded-xl bg-[#f6a400] px-4 py-2.5 text-center text-base font-bold text-white shadow-lg shadow-amber-500/25" role="alert">
      <span className="flex items-center gap-2"><AlertCircle className="h-5 w-5 shrink-0" />{message}</span>
      <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-[#f6a400]" />
    </div>
  );
};

export default FieldWarning;
