import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import type { User } from "../../context/AuthContext";
import { HALLS, type HallId } from "../../constant/halls.ts";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";
type AuthStep = "login" | "signup" | "otp" | "profile" | "forgot";
type AuthModalProps = { initialStep?: AuthStep; onClose: () => void };

type ApiResponse = {
  token?: string;
  user?: User;
  message?: string;
  error?: string;
};

async function request(
  path: string,
  body: Record<string, unknown>,
): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.error ?? data.message ?? "Request failed");
  return data;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

const AuthModal = ({ initialStep = "login", onClose }: AuthModalProps) => {
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [roll, setRoll] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [hallId, setHallId] = useState<HallId>(HALLS[0].id);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const close = () => {
    onClose();
    navigate("/", { replace: true });
  };

  const switchStep = (nextStep: AuthStep) => {
    setError("");
    setMessage("");
    setStep(nextStep);
  };

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await request("/api/auth/login", {
        identifier: roll,
        password,
      });
      if (!result.token || !result.user)
        throw new Error("Invalid login response from server");
      login(result.token, result.user);
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in");
    } finally {
      setBusy(false);
    }
  };

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{7}$/.test(roll))
      return setError("Student ID must contain exactly 7 digits.");
    if (!new RegExp(`^${roll}@student\\.ruet\\.ac\\.bd$`, "i").test(email))
      return setError(
        "Use your RUET student email, for example 2303130@student.ruet.ac.bd.",
      );
    setBusy(true);
    setError("");
    try {
      await request("/api/auth/signup/request-otp", {
        roll: Number(roll),
        email,
      });
      setMessage(`OTP sent to ${email}`);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await request("/api/auth/signup/verify-otp", {
        roll: Number(roll),
        email,
        otp,
      });
      setStep("profile");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setBusy(false);
    }
  };

  const completeSignup = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password))
      return setError(
        "Password must be at least 6 characters with one alphabet and one digit.",
      );
    setBusy(true);
    setError("");
    try {
      const result = await request("/api/auth/signup/complete", {
        roll: Number(roll),
        email,
        password,
        name,
        gender,
        preferred_hall_id: hallId,
      });
      if (!result.token || !result.user)
        throw new Error("Invalid signup response from server");
      login(result.token, result.user);
      close();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to complete signup",
      );
    } finally {
      setBusy(false);
    }
  };

  const submitForgot = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await request("/api/auth/forgot-password", { email });
      setMessage("If this account exists, a reset link has been sent.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send reset link",
      );
    } finally {
      setBusy(false);
    }
  };

  const title =
    step === "login"
      ? "Welcome back"
      : step === "signup"
        ? "Create your account"
        : step === "otp"
          ? "Verify your email"
          : step === "profile"
            ? "Complete your profile"
            : "Reset your password";
  const submit =
    step === "login"
      ? submitLogin
      : step === "signup"
        ? requestOtp
        : step === "otp"
          ? verifyOtp
          : step === "profile"
            ? completeSignup
            : submitForgot;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div
        key={step}
        className="relative w-full max-w-md animate-[auth-card-in_280ms_ease-out] rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-3 text-2xl text-slate-400 hover:text-slate-800"
          aria-label="Close authentication dialog"
        >
          &times;
        </button>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
          InstaPrint
        </p>
        <h2 id="auth-title" className="mt-2 text-2xl font-bold text-slate-900">
          {title}
        </h2>
        {step === "otp" && (
          <p className="mt-1 text-sm text-slate-500">
            Enter the OTP sent to {email}.
          </p>
        )}
        {step === "profile" && (
          <p className="mt-1 text-sm text-slate-500">
            One last step, then you can start printing.
          </p>
        )}
        {(error || message) && (
          <p
            className={`mt-4 rounded-lg px-3 py-2 text-sm ${error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
          >
            {error || message}
          </p>
        )}

        <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
          {step === "login" && (
            <>
              <label className="text-sm font-medium text-slate-700">
                Student ID or email
                <input
                  required
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  className={inputClass}
                  placeholder="2303130 or student email"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Password
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </label>
            </>
          )}
          {step === "signup" && (
            <>
              <label className="text-sm font-medium text-slate-700">
                Student ID
                <input
                  required
                  inputMode="numeric"
                  value={roll}
                  onChange={(e) =>
                    setRoll(e.target.value.replace(/\D/g, "").slice(0, 7))
                  }
                  className={inputClass}
                  placeholder="7 digit roll"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                RUET student email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="2303130@student.ruet.ac.bd"
                />
              </label>
            </>
          )}
          {step === "otp" && (
            <label className="text-sm font-medium text-slate-700">
              OTP
              <input
                required
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={inputClass}
                placeholder="Enter OTP"
              />
            </label>
          )}
          {step === "profile" && (
            <>
              <label className="text-sm font-medium text-slate-700">
                Name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Password
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="At least 6 characters"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-medium text-slate-700">
                  Gender
                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value as "male" | "female")
                    }
                    className={inputClass}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Preferred hall
                  <select
                    value={hallId}
                    onChange={(e) => setHallId(e.target.value as HallId)}
                    className={inputClass}
                  >
                    {HALLS.map((hall) => (
                      <option key={hall.id} value={hall.id}>
                        {hall.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </>
          )}
          {step === "forgot" && (
            <label className="text-sm font-medium text-slate-700">
              Student email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>
          )}
          <button
            disabled={busy}
            className="rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
          >
            {busy
              ? "Please wait..."
              : step === "login"
                ? "Log in"
                : step === "signup"
                  ? "Verify email"
                  : step === "otp"
                    ? "Verify OTP"
                    : step === "profile"
                      ? "Save and complete"
                      : "Send reset link"}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm text-slate-600">
          {step === "login" && (
            <>
              <button
                type="button"
                onClick={() => switchStep("forgot")}
                className="text-blue-700 hover:underline"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => switchStep("signup")}
                className="text-blue-700 hover:underline"
              >
                Don't have an account? Sign up
              </button>
            </>
          )}
          {step === "signup" && (
            <button
              type="button"
              onClick={() => switchStep("login")}
              className="text-blue-700 hover:underline"
            >
              Already have an account? Log in
            </button>
          )}
          {(step === "otp" || step === "profile" || step === "forgot") && (
            <button
              type="button"
              onClick={() => switchStep("login")}
              className="text-blue-700 hover:underline"
            >
              Back to log in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
