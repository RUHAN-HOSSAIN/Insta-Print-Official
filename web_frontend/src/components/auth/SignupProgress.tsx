import { Check } from "lucide-react";
import type { AuthStep } from "./AuthModal";

type SignupProgressProps = {
  step: Extract<AuthStep, "signup" | "otp" | "profile">;
};

const steps = [
  { key: "signup", label: "Account details" },
  { key: "otp", label: "Verify email" },
  { key: "profile", label: "Complete profile" },
] as const;

const SignupProgress = ({ step }: SignupProgressProps) => {
  const activeIndex = steps.findIndex((item) => item.key === step);

  return (
    <nav aria-label="Signup progress" className="mb-7 md:mb-9 mt-5 md:mt-7">
      <ol className="flex items-start">
        {steps.map((item, index) => {
          const completed = index < activeIndex;
          const active = index === activeIndex;

          return (
            <li key={item.key} className="relative flex min-w-0 flex-1 flex-col items-center font-sans">
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-1/2 right-[-50%] top-4 h-0.5 ${
                    index < activeIndex ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                  completed
                    ? "border-blue-600 bg-blue-600 text-white"
                    : active
                      ? "border-blue-600 bg-white text-blue-700 ring-3 md:ring-4 ring-blue-100"
                      : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {completed ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
              </span>
              {/* <span
                className={`mt-2 max-w-24 text-center text-[10px] font-medium leading-tight sm:text-xs ${
                  active || completed ? "text-blue-700" : "text-slate-400"
                }`}
              >
                {item.label}
              </span> */}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default SignupProgress;
