import { useState, type FormEvent } from "react";
import {
  Check,
  CirclePlusIcon,
  Copy,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { paymentMethods, type PaymentMethod } from "../../constant/paymentMethods";
import FeedbackPopup from "../../components/feedback/FeedbackPopup";
import FieldWarning from "../../components/feedback/FieldWarning";
import BkashLogo  from "../../assets/logos/BkashLogo.png";
import  NagadLogo from "../../assets/logos/NagadLogo.png";
import { WalletIcon } from "../../assets/icons/Icons";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";
const PAYMENT_NUMBER = "01716897644";

const TopUp = () => {
  const { user, token, updateUser } = useAuth();
  const [transactionId, setTransactionId] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [popup, setPopup] = useState<{
    tone: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const copyNumber = async (provider: string) => {
    await navigator.clipboard.writeText(PAYMENT_NUMBER);
    setCopied(provider);
    window.setTimeout(() => setCopied(""), 1800);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldError("");
    setPopup(null);
    if (!transactionId.trim())
      return setFieldError("Transaction ID is required.");

    setBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/topup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ txn_id: transactionId.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Top-up failed");
      if (typeof data.wallet_balance === "number")
        updateUser({ wallet_balance: data.wallet_balance });
      setPopup({
        tone: "success",
        title: "Top-up successful",
        message: `৳ ${Number(data.amount_added ?? 0).toFixed(2)} was added to your wallet. Your current balance is ৳ ${Number(data.wallet_balance ?? 0).toFixed(2)}.`,
      });
      setTransactionId("");
    } catch (err) {
      setPopup({
        tone: "error",
        title: "Top-up could not be completed",
        message:
          err instanceof Error
            ? err.message
            : "Your payment has not reached us yet. Please try again later.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b  to-[#26065F] via-[#4801EC] shadow-[0px_15px_0px_rgba(39,6,98,1)] px-6 pb-16 pt-(--header-height,72px) font-spaceG text-slate-900 sm:px-8">
      <FeedbackPopup
        open={Boolean(popup)}
        tone={popup?.tone ?? "error"}
        title={popup?.title ?? ""}
        message={popup?.message ?? ""}
        onClose={() => setPopup(null)}
      />
      <div className="mx-auto max-w-2xl">
        {/* <div className="flex items-center border-b border-slate-200 px-2 py-6 text-sm font-semibold text-slate-500 sm:text-base">
          Dashboard /{" "}
          <span className="text-[#1967d2] underline underline-offset-2">
            Top-up
          </span>
        </div> */}

        <section className="relative mt-8 rounded-xl bg-linear-to-tr from-green-600 to-green-700 px-5 py-8 text-white shadow-[0px_0px_10px_rgba(0,0,0,0.35)] sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 2px, transparent 1.5px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative text-center">
            <WalletIcon className="mx-auto h-12 w-12 sm:h-14 sm:w-14" />
            <p className="mt-4 text-base font-medium text-white/90 sm:text-lg">
              Current balance
            </p>
            <p className="mt-2 text-3xl font-bold sm:text-4xl text-white">
              ৳ {user.wallet_balance.toFixed(2)}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-gray-50">
            How to top-up
          </h1>
          <ul className="font-roboto tracking-wider mt-4 mb-6 list-outside pl-5 list-disc space-y-2 text-sm text-gray-200 sm:text-base">
            <li>
              <b>Send money</b> to either number and enter your transaction ID
            </li>
            <li>
              Dial <b>*247#</b> to send money <b>under 10 TK!</b>
            </li>
            <li>
              For <b>free sending</b>, set our number as <b>'priyo'.</b>
            </li>
          </ul>
          
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((item : PaymentMethod) => (
              <div
                key={item.medium}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${item.medium === "BKash" ? "bg-pink-50 text-pink-600" : "bg-orange-50 text-orange-500"}`}
                >
                  {item.medium === "BKash" ? (
                    <img src={BkashLogo} alt="bKash Logo" className="w-12" />
                  ) : (
                    <img src={NagadLogo} alt="Nagad Logo" className="w-7" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold">{item.medium}</p>
                  <p className="font-roboto mt-1 text-sm tracking-wider text-slate-500">
                    {item.number}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Copy ${item.medium} number`}
                  onClick={() => copyNumber(item.medium)}
                  className="rounded-full p-2 transition hover:bg-slate-100"
                >
                  {copied === item.medium ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-7 rounded-xl bg-white p-5 shadow-[0_0px_15px_rgba(0,0,0,0.12)] sm:p-7"
        >
          <label className="relative flex items-center gap-3 rounded-lg border border-[#dcefe0] bg-[#fbfefb] px-4 py-3 text-base font- text-gray-500">
            {" "}
            <FieldWarning message={fieldError} />
            <CirclePlusIcon className="h-5 w-5 shrink-0" />
            <input
              required
              value={transactionId}
              onChange={(event) => {
                setTransactionId(event.target.value);
                setFieldError("");
              }}
              placeholder="Transaction ID"
              className={`font-roboto tracking-wider w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-gray-500 ${fieldError ? "ring-2 ring-amber-300" : ""}`}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full rounded-lg bg-[#222] px-5 py-3 text-base font-bold text-white transition hover:bg-black disabled:opacity-60"
          >
            {busy ? "Verifying..." : "Verify & Top-up"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default TopUp;
