import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import type { SignupSharedState } from "../../components/auth/AuthModal";
import { HALLS, type HallId } from "../../constant/halls";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

import mainLogo from "../../assets/logo_main.webp";

type CompleteProfileProps = {
  onClose: () => void;
  signupData: SignupSharedState;
};

const CompleteProfile = ({ onClose, signupData }: CompleteProfileProps) => {
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [hallId, setHallId] = useState<HallId>(HALLS[0].id);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
      return setError(
        "Password must be at least 6 characters with one letter and one digit.",
      );
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: signupData.userId, // নতুন
          roll: Number(signupData.roll),
          email: signupData.email,
          name,
          password,
          gender,
          preferred_hall_id: hallId,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.error ?? data.message ?? "Signup failed");
      if (!data.token || !data.user)
        throw new Error("Invalid response from server");

      login(data.token, data.user);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to complete signup",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="font-roboto">
      <img src={mainLogo} className="mx-auto h-14 w-14 my-2" />
      <h1 className="text-slate-900 text-center text-xl font-semibold">
        Complete your profile
      </h1>
      <p className="text-slate-700 text-center mt-2 text-sm font-light">
        One last step, then you can start printing.
      </p>

      <form className="space-y-6 mt-7" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="name"
            className="mb-2 text-slate-900 font-medium inline-block"
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
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
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="gender"
              className="mb-2 text-slate-900 font-medium inline-block"
            >
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as "male" | "female")}
              className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="hallId"
              className="mb-2 text-slate-900 font-medium inline-block"
            >
              Preferred hall
            </label>
            <select
              id="hallId"
              value={hallId}
              onChange={(e) => setHallId(e.target.value as HallId)}
              className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600"
            >
              {HALLS.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.name}
                </option>
              ))}
            </select>
          </div>
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
          {busy ? "Please wait..." : "Create account"}
        </button>
      </form>
    </div>
  );
};

export default CompleteProfile;
