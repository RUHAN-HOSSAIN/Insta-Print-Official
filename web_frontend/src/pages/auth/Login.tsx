import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import type { AuthStep } from "../../components/auth/AuthModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

import mainLogo from "../../assets/logo_main.webp";

type LoginProps = {
  onClose: () => void;
  onGoTo: (step: AuthStep) => void;
};

const IDENTIFIER_REGEX = /^\d{7}(@student\.ruet\.ac\.bd)?$/;

const Login = ({ onClose, onGoTo }: LoginProps) => {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const validate = (): string | null => {
    if (!IDENTIFIER_REGEX.test(identifier.trim())) {
      return "Enter a valid 7-digit roll (e.g. 2303130) or RUET student email (e.g. _roll_@student.ruet.ac.bd)";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.error ?? data.message ?? "Login failed");
      if (!data.token || !data.user)
        throw new Error("Invalid response from server");

      login(data.token, data.user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="font-roboto">
      <img src={mainLogo} className="mx-auto h-14 w-14 my-2" />
      <h1 className="text-slate-900 text-center text-xl font-semibold">
        Welcome back
      </h1>
      <p className="text-slate-700 text-center mt-2 text-sm font-light">
        Enter your email and password to sign in.
      </p>

      <form className="space-y-6 mt-7" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="identifier"
            className="mb-2 text-slate-900 font-medium inline-block"
          >
            Username
          </label>
          <input
            id="identifier"
            type="text"
            required
            inputMode="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter roll or student email"
            pattern="^\d{7}(@student\.ruet\.ac\.bd)?$"
            title="7-digit roll or {roll}@student.ruet.ac.bd"
            className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 text-slate-900 font-medium inline-block"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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

        <div className="flex items-start flex-wrap gap-2">
          <label className="flex items-center group has-[input:checked]:text-slate-900">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="sr-only"
            />
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded outline-1 outline-slate-300
                  bg-white
                  group-has-[input:checked]:bg-blue-600
                  group-has-[input:checked]:outline-blue-600
                  group-focus-within:outline-2
                  group-focus-within:outline-blue-600"
              aria-hidden="true"
            >
              <svg
                className="size-3 text-white opacity-0 group-has-[input:checked]:opacity-100"
                viewBox="0 0 12 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 5l3 3 7-7" />
              </svg>
            </span>
            <span className="ml-3 text-sm text-slate-700">Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => onGoTo("forgot")}
            className="ml-auto text-sm font-medium text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Forgot password?
          </button>
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
          {busy ? "Please wait..." : "Sign in"}
        </button>

        <div className="text-slate-900 text-sm font-light text-center">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => onGoTo("signup")}
            className="text-blue-700 hover:underline ml-1 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;