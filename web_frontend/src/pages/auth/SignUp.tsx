import { useState, type FormEvent } from "react";
import type {
  AuthStep,
  SignupSharedState,
} from "../../components/auth/AuthModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

import mainLogo from "../../assets/logo_main.webp";
import SignupProgress from "../../components/auth/SignupProgress";

type SignUpProps = {
  onClose: () => void;
  onGoTo: (step: AuthStep) => void;
  signupData: SignupSharedState;
  onSignupDataChange: (data: SignupSharedState) => void;
};

const SignUp = ({ onGoTo, signupData, onSignupDataChange }: SignUpProps) => {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const { roll, email } = signupData;

    if (!/^\d{7}$/.test(roll)) {
      return setError("Student ID must be exactly 7 digits.");
    }
    if (!email.trim() || !email.includes("@")) {
      return setError("Please enter a valid email address.");
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll: Number(roll), email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.error ?? data.message ?? "Failed to send OTP");

      onGoTo("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="font-roboto">
      <img src={mainLogo} className="mx-auto h-14 w-14 my-2" />
      <h1 className="text-slate-900 text-center text-xl font-semibold">
        Create your account
      </h1>
      <p className="text-slate-700 text-center mt-2 text-sm font-light">
        Enter your student ID and RUET email to get started.
      </p>

      <SignupProgress step="signup" />

      <form className="space-y-6 mt-7" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="roll"
            className="mb-2 text-slate-900 font-medium inline-block"
          >
            Student ID
          </label>
          <input
            id="roll"
            type="text"
            required
            inputMode="numeric"
            value={signupData.roll}
            onChange={(e) =>
              onSignupDataChange({
                ...signupData,
                roll: e.target.value.replace(/\D/g, "").slice(0, 7),
              })
            }
            placeholder="7 digit Student ID"
            className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 text-slate-900 font-medium inline-block"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={signupData.email}
            onChange={(e) =>
              onSignupDataChange({ ...signupData, email: e.target.value })
            }
            placeholder="Enter your email address"
            className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"
          />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 px-3.5 rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-wait disabled:opacity-60 shadow-[0px_0px_10px_rgba(0,0,0,0.3)]"
        >
          {busy ? "Please wait..." : "Send OTP"}
        </button>

        <div className="text-slate-900 text-sm font-light text-center">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => onGoTo("login")}
            className="text-blue-700 hover:underline ml-1 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Log in
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
