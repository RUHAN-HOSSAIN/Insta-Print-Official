import { useState, type FormEvent } from "react";
import { Check, Copy, WalletCards } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import FeedbackPopup from "../../components/feedback/FeedbackPopup";
import FieldWarning from "../../components/feedback/FieldWarning";

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
    <main className="min-h-screen bg-[#f5f8fc] px-6 pb-16 pt-(--header-height,72px) font-spaceG text-slate-900 sm:px-8">
      <FeedbackPopup
        open={Boolean(popup)}
        tone={popup?.tone ?? "error"}
        title={popup?.title ?? ""}
        message={popup?.message ?? ""}
        onClose={() => setPopup(null)}
      />
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center border-b border-slate-200 px-2 py-6 text-sm font-semibold text-slate-500 sm:text-base">
          Dashboard / <span className="text-[#1967d2] underline underline-offset-2">Top-up</span>
        </div>

        <section className="relative mt-8 rounded-xl bg-linear-to-tr from-[#31954a] to-[#087f70] px-5 py-8 text-white shadow-[0px_0px_10px_rgba(0,0,0,0.35)] sm:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle, #ffffff 2px, transparent 2px)", backgroundSize: "32px 32px" }} />
          <div className="relative text-center">
            <WalletCards className="mx-auto h-12 w-12 sm:h-14 sm:w-14" />
            <p className="mt-4 text-base font-medium text-white/80 sm:text-lg">Current balance</p>
            <p className="mt-2 text-3xl font-bold sm:text-4xl">৳ {user.wallet_balance.toFixed(2)}</p>
          </div>
        </section>

        <section className="mt-8">
          <h1 className="text-2xl font-bold sm:text-3xl">How to top-up</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Send money to either number and enter your transaction ID
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(["bKash", "Nagad"] as const).map((provider) => (
              <div
                key={provider}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
              >
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${provider === "bKash" ? "bg-pink-50 text-pink-600" : "bg-orange-50 text-orange-500"}`}
                >
                  <WalletCards className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold">{provider}</p>
                  <p className="mt-1 text-sm tracking-wider text-slate-500">
                    {PAYMENT_NUMBER}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Copy ${provider} number`}
                  onClick={() => copyNumber(provider)}
                  className="rounded-full p-2 transition hover:bg-slate-100"
                >
                  {copied === provider ? (
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
          <label className="relative flex items-center gap-3 rounded-lg border border-[#dcefe0] bg-[#fbfefb] px-4 py-3 text-base font-semibold text-[#31954a]">
            {" "}
            <FieldWarning message={fieldError} />
            <WalletCards className="h-5 w-5 shrink-0" />
            <input
              required
              value={transactionId}
              onChange={(event) => {
                setTransactionId(event.target.value);
                setFieldError("");
              }}
              placeholder="Transaction ID (TrxID)"
              className={`w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-[#31954a] ${fieldError ? "ring-2 ring-amber-300" : ""}`}
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
