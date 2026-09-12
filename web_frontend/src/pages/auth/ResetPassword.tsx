import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { AuthStep, ForgotSharedState } from "../../components/auth/AuthModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

import mainLogo from "../../assets/logo_main.webp";
import { showFeedbackError, showFeedbackSuccess } from "../../components/feedback/swalFeedback";

type ResetPasswordProps = {
  onClose: () => void;
  onGoTo: (step: AuthStep) => void;
  forgotData: ForgotSharedState;
};

const ResetPassword = ({ onGoTo, forgotData }: ResetPasswordProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
      showFeedbackError("Password must be at least 6 characters with one letter and one digit.");
      return;
    }
    if (password !== confirmPassword) {
      showFeedbackError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset_token: forgotData.resetToken,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Reset failed");

      await showFeedbackSuccess("Password reset successful", "You can now log in with your new password.");
      onGoTo("login");
    } catch (err) {
      setError("");
      showFeedbackError(err instanceof Error ? err.message : "Unable to reset password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="font-roboto">
      <img src={mainLogo} className="mx-auto h-14 w-14 my-2" />
      <h1 className="text-slate-900 text-center text-xl font-semibold">
        Set new password
      </h1>
      <p className="text-slate-700 text-center mt-2 text-sm font-light">
        Choose a new password for your account.
      </p>

      <form className="space-y-6 mt-7" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="password"
            className="mb-2 text-slate-900 font-medium inline-block"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="px-3 py-2.5 pr-10 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 text-slate-900 font-medium inline-block"
          >
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 px-3.5 rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-wait disabled:opacity-60 shadow-[0px_0px_10px_rgba(0,0,0,0.3)]"
        >
          {busy ? "Please wait..." : "Set new password"}
        </button>

        <div className="text-slate-900 text-sm font-light text-center">
          <button
            type="button"
            onClick={() => onGoTo("login")}
            className="text-blue-700 hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Back to log in
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;