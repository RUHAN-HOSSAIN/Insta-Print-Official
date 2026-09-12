import { useState, type FormEvent } from "react";
import type { AuthStep, ForgotSharedState } from "../../components/auth/AuthModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

import mainLogo from "../../assets/logo_main.webp";
import { showFeedbackError } from "../../components/feedback/swalFeedback";

type ForgotVerifyOtpProps = {
  onClose: () => void;
  onGoTo: (step: AuthStep) => void;
  forgotData: ForgotSharedState;
  onForgotDataChange: (data: ForgotSharedState) => void;
};

const ForgotVerifyOtp = ({ onGoTo, forgotData, onForgotDataChange }: ForgotVerifyOtpProps) => {
  const [otp, setOtp] = useState("");
  const [, setError] = useState("");
  const [, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotData.email, otp }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Invalid OTP");

      onForgotDataChange({ ...forgotData, resetToken: data.reset_token });
      onGoTo("reset-password");
    } catch (err) {
      setError("");
      showFeedbackError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setResendBusy(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotData.email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to resend");

      setMessage("");
    } catch (err) {
      setError("");
      showFeedbackError(err instanceof Error ? err.message : "Unable to resend OTP");
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <div className="font-roboto">
      <img src={mainLogo} className="mx-auto h-14 w-14 my-2" />
      <h1 className="text-slate-900 text-center text-xl font-semibold">
        Verify OTP
      </h1>
      <p className="text-slate-700 text-center mt-2 text-sm font-light">
        Enter the OTP sent to {forgotData.email}.
      </p>

      <form className="space-y-6 mt-7" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="otp"
            className="mb-2 text-slate-900 font-medium inline-block"
          >
            OTP
          </label>
          <input
            id="otp"
            type="text"
            required
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 px-3.5 rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-wait disabled:opacity-60 shadow-[0px_0px_10px_rgba(0,0,0,0.3)]"
        >
          {busy ? "Please wait..." : "Verify OTP"}
        </button>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendBusy}
            className="text-sm font-medium text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded disabled:opacity-60"
          >
            {resendBusy ? "Resending..." : "Resend OTP"}
          </button>

          <button
            type="button"
            onClick={() => onGoTo("forgot")}
            className="text-sm font-medium text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotVerifyOtp;