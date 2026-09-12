import { AlertCircle } from "lucide-react";

interface FieldWarningProps {
  message?: string;
}

const FieldWarning = ({ message }: FieldWarningProps) => {
  if (!message) return null;
  return (
    <div
      className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 flex w-max max-w-[calc(100vw-40px)] -translate-x-1/2 items-center gap-2 rounded border border-slate-500 bg-white px-2.5 py-1.5 text-left text-sm sm:text-base font-normal text-slate-900 shadow-[0px_2px_5px_rgba(0,0,0,0.1)]"
      role="alert"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-[#ed6b00] text-white">
        <AlertCircle className="h-4 w-4" strokeWidth={3} />
      </span>
      <span>{message}</span>
      <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-slate-500" />
      <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-px border-x-[7px] border-t-[7px] border-x-transparent border-t-white" />
    </div>
  );
};

export default FieldWarning;