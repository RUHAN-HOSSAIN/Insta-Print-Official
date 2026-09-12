import { useState, type FormEvent } from "react";
import { ArrowLeft, Check, Copy, Gift, WalletCards } from "lucide-react";
import { useAuth } from "../../context/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";
const PAYMENT_NUMBER = "01716897644";

const TopUp = () => {
  const { user, token, updateUser } = useAuth();
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
    setError("");
    setMessage("");
    if (!transactionId.trim()) return setError("Transaction ID is required.");

    setBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ txn_id: transactionId.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Top-up failed");
      if (typeof data.wallet_balance === "number") updateUser({ wallet_balance: data.wallet_balance });
      setMessage(`Top-up successful. New balance: ৳ ${data.wallet_balance?.toFixed(2) ?? ""}`);
      setTransactionId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process top-up");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7fbf8] px-4 pb-16 pt-(--header-height,72px) font-spaceG text-slate-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3 border-b border-slate-200 py-6 text-base font-semibold text-slate-500"><ArrowLeft className="h-5 w-5" />Dashboard / Top-up</div>

        <section className="mt-8 rounded-[30px] bg-linear-to-br from-[#319b4c] to-[#078c77] px-6 py-10 text-center text-white shadow-xl shadow-green-900/15 sm:px-12">
          <p className="text-xl font-medium text-white/80">Current balance</p>
          <p className="mt-3 text-5xl font-bold tracking-tight">৳ {user.wallet_balance.toFixed(2)}</p>
          <div className="mx-auto mt-6 w-fit rounded-full bg-white/20 px-6 py-3 text-lg font-semibold">Credit points</div>
        </section>

        <div className="mt-7 flex items-center gap-4 rounded-[26px] bg-linear-to-r from-[#ffb400] to-[#ff8100] px-6 py-5 text-white shadow-lg shadow-orange-300/25 sm:px-8"><div className="rounded-full bg-white/20 p-4"><Gift className="h-8 w-8" /></div><div className="flex-1"><p className="text-xl font-bold sm:text-2xl">Top-up bonus credits!</p><p className="mt-1 text-base text-white/85 sm:text-lg">Get up to +50 bonus credits on recharge</p></div><span className="text-3xl">›</span></div>

        <section className="mt-10"><h1 className="text-3xl font-bold sm:text-4xl">How to top-up</h1><p className="mt-3 text-lg text-slate-500 sm:text-xl">Send money to either number and enter your transaction ID</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {(["bKash", "Nagad"] as const).map((provider) => <div key={provider} className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white px-5 py-5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.55)]"><div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${provider === "bKash" ? "bg-pink-50 text-pink-600" : "bg-orange-50 text-orange-500"}`}><WalletCards className="h-7 w-7" /></div><div className="flex-1"><p className="text-xl font-bold">{provider}</p><p className="mt-1 text-lg tracking-widest text-slate-500">{PAYMENT_NUMBER}</p></div><button type="button" aria-label={`Copy ${provider} number`} onClick={() => copyNumber(provider)} className="rounded-full p-3 transition hover:bg-slate-100">{copied === provider ? <Check className="h-6 w-6 text-green-600" /> : <Copy className="h-6 w-6" />}</button></div>)}
          </div>
        </section>

        <form onSubmit={handleSubmit} className="mt-8 rounded-[28px] bg-white p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] sm:p-10"><label className="flex items-center gap-3 rounded-2xl border-2 border-[#dcefe0] bg-[#fbfefb] px-5 py-4 text-lg font-semibold text-[#31954a]"><WalletCards className="h-6 w-6 shrink-0" /><input required value={transactionId} onChange={(event) => setTransactionId(event.target.value)} placeholder="Transaction ID (TrxID)" className="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-[#31954a]" /></label>{error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-600">{error}</p>}{message && <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-base font-medium text-green-700">{message}</p>}<button type="submit" disabled={busy} className="mt-6 w-full rounded-2xl bg-[#222] px-5 py-5 text-xl font-bold text-white transition hover:bg-black disabled:opacity-60">{busy ? "Verifying..." : "Verify & Top-up"}</button></form>
      </div>
    </main>
  );
};

export default TopUp;
