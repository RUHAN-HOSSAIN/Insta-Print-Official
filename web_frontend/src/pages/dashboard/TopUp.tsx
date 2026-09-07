import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

// ─── Component ────────────────────────────────────────────────────────────────

const TopUp = () => {
  const { user, token, updateUser } = useAuth();

  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const parsedAmount = parseFloat(amount);

    // Client-side validation
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return setError("Enter a valid amount.");
    }
    if (!transactionId.trim()) {
      return setError("Transaction ID is required.");
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/topup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parsedAmount,
          txn_id: transactionId.trim(),
        }),
        // Server side: admin approval হলে wallet_balance বাড়াবে
        // অথবা auto verify করলে এখানেই balance update আসবে
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? data.message ?? "Top-up failed");

      // Server যদি updated balance return করে
      if (typeof data.wallet_balance === "number") {
        updateUser({ wallet_balance: data.wallet_balance });
      }

      setMessage("Top-up request submitted successfully.");
      setAmount("");
      setTransactionId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process top-up");
    } finally {
      setBusy(false);
    }
  };

  // ── Render ──
  // Available: user.wallet_balance (current balance দেখাও),
  //            amount, setAmount, transactionId, setTransactionId,
  //            error, message, busy, handleSubmit
  return (
    <div>
      {/* তোমার UI এখানে */}
      <p>Current balance: ৳ {user.wallet_balance.toFixed(2)}</p>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          required
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (৳)"
        />
        <input
          required
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder="bKash/Nagad Transaction ID"
        />
        <button type="submit" disabled={busy}>
          {busy ? "Please wait..." : "Submit top-up request"}
        </button>
      </form>
    </div>
  );
};

export default TopUp;