import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Login from "../../pages/auth/Login";
import SignUp from "../../pages/auth/SignUp";
import VerifyOtp from "../../pages/auth/VerifyOtp";
import CompleteProfile from "../../pages/auth/CompleteProfile";
import ForgotPassword from "../../pages/auth/ForgotPassword";
import ForgotVerifyOtp from "../../pages/auth/ForgotVerifyOtp";
import ResetPassword from "../../pages/auth/ResetPassword";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthStep =
  | "login"
  | "signup"
  | "otp"
  | "profile"
  | "forgot"
  | "forgot-otp"
  | "reset-password";

export type AuthModalProps = {
  initialStep?: AuthStep;
  onClose: () => void;
};

// Signup flow: signup → otp → profile (roll + email দুই step এ লাগে)
export type SignupSharedState = {
  roll: string;
  email: string;
  userId: string; // নতুন — VerifyOtp থেকে আসবে
};

// Forgot flow: forgot → forgot-otp → reset-password
export type ForgotSharedState = {
  email: string;
  resetToken: string; // verify-otp এ পাওয়া token, reset step এ পাঠাবে
};

// ─── Component ────────────────────────────────────────────────────────────────

const AuthModal = ({ initialStep = "login", onClose }: AuthModalProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>(initialStep);

  const [signupData, setSignupData] = useState<SignupSharedState>({
    roll: "",
    email: "",
    userId: "",
  });
  const [forgotData, setForgotData] = useState<ForgotSharedState>({
    email: "",
    resetToken: "",
  });

  const close = () => {
    onClose();
    navigate("/", { replace: true });
  };

  const goTo = (nextStep: AuthStep) => setStep(nextStep);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        key={step}
        className="relative w-full max-w-md animate-[auth-card-in_280ms_ease-out] rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-6 top-5 text-3xl text-slate-400 hover:text-slate-800 shadow rounded-full w-9 transition-colors"
          aria-label="Close"
        >
          &times;
        </button>

        {/* ── Signup flow ── */}
        {step === "login" && <Login onClose={close} onGoTo={goTo} />}
        {step === "signup" && (
          <SignUp
            onClose={close}
            onGoTo={goTo}
            signupData={signupData}
            onSignupDataChange={setSignupData}
          />
        )}
        {step === "otp" && (
          <VerifyOtp
            onClose={close}
            onGoTo={goTo}
            signupData={signupData}
            onSignupDataChange={setSignupData}
          />
        )}
        {step === "profile" && (
          <CompleteProfile
            onClose={close}
            onGoTo={goTo}
            signupData={signupData}
          />
        )}

        {/* ── Forgot password flow ── */}
        {step === "forgot" && (
          <ForgotPassword
            onClose={close}
            onGoTo={goTo}
            forgotData={forgotData}
            onForgotDataChange={setForgotData}
          />
        )}
        {step === "forgot-otp" && (
          <ForgotVerifyOtp
            onClose={close}
            onGoTo={goTo}
            forgotData={forgotData}
            onForgotDataChange={setForgotData} // resetToken save করার জন্য
          />
        )}
        {step === "reset-password" && (
          <ResetPassword
            onClose={close}
            onGoTo={goTo}
            forgotData={forgotData}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
