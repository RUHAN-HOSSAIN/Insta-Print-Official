import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type FeedbackTone = "success" | "warning" | "error" | "info";

interface FeedbackPopupProps {
  open: boolean;
  tone: FeedbackTone;
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

const toneConfig: Record<FeedbackTone, { icon: typeof CheckCircle2; accent: string; ring: string }> = {
  success: { icon: CheckCircle2, accent: "text-emerald-600", ring: "border-emerald-500" },
  warning: { icon: AlertTriangle, accent: "text-amber-600", ring: "border-amber-500" },
  error: { icon: AlertTriangle, accent: "text-red-600", ring: "border-red-500" },
  info: { icon: Info, accent: "text-blue-600", ring: "border-blue-500" },
};

const FeedbackPopup = ({ open, tone, title, message, duration = 5000, onClose }: FeedbackPopupProps) => {
  const [remaining, setRemaining] = useState(duration);
  const config = toneConfig[tone];
  const Icon = config.icon;

  useEffect(() => {
    if (!open) return;
    const resetTimer = window.setTimeout(() => setRemaining(duration), 0);
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const next = Math.max(0, duration - (Date.now() - startedAt));
      setRemaining(next);
      if (next === 0) onClose();
    }, 50);
    return () => {
      window.clearTimeout(resetTimer);
      window.clearInterval(timer);
    };
  }, [duration, onClose, open]);

  if (!open) return null;
  const progress = ((duration - remaining) / duration) * 360;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4 animate-[feedback-in_280ms_ease-out]" role={tone === "error" ? "alert" : "status"}>
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 pr-14 shadow-[0_20px_55px_-20px_rgba(15,23,42,0.42)]">
        <button type="button" onClick={onClose} aria-label="Close message" className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
        <div className="flex items-start gap-3"><div className={`mt-0.5 rounded-full bg-slate-50 p-2 ${config.accent}`}><Icon className="h-6 w-6" /></div><div><h3 className="text-lg font-bold text-slate-900">{title}</h3><p className="mt-1 whitespace-pre-line text-base leading-6 text-slate-600">{message}</p></div></div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${tone === "success" ? "bg-emerald-500" : tone === "warning" ? "bg-amber-500" : tone === "error" ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${(remaining / duration) * 100}%` }} /></div>
        <div className={`absolute right-3 top-11 h-7 w-7 rounded-full border-2 ${config.ring}`} style={{ background: `conic-gradient(currentColor ${progress}deg, transparent ${progress}deg)`, color: "currentColor" }} aria-hidden="true" />
      </div>
    </div>
  );
};

export default FeedbackPopup;
