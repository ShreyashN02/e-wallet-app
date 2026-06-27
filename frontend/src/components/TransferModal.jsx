import { useState } from "react";
import Modal from "./Modal";
import { transferMoney } from "../services/walletService";

export default function TransferModal({ onClose, onSuccess }) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const wallet = await transferMoney({
        recipientEmail,
        amount: Number(amount),
        note: note || undefined,
      });
      onSuccess(wallet);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't complete the transfer. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Send money" onClose={onClose}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Recipient's email
          <input
            type="email"
            required
            autoFocus
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            style={styles.input}
            placeholder="friend@example.com"
          />
        </label>

        <label style={styles.label}>
          Amount (₹)
          <input
            type="number"
            min="1"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
            placeholder="500.00"
          />
        </label>

        <label style={styles.label}>
          Note (optional)
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={styles.input}
            placeholder="e.g. Dinner split"
            maxLength={100}
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? "Sending…" : "Send money"}
        </button>
      </form>
    </Modal>
  );
}

const styles = {
  form: { display: "flex", flexDirection: "column", gap: 14 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--ink)" },
  input: {
    fontSize: 15,
    padding: "11px 13px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--line)",
    background: "var(--paper)",
    color: "var(--ink)",
  },
  error: {
    background: "var(--signal-rust-bg)",
    color: "var(--signal-rust)",
    fontSize: 13,
    padding: "10px 12px",
    borderRadius: "var(--radius-sm)",
    margin: 0,
  },
  submitBtn: {
    marginTop: 4,
    background: "var(--ink)",
    color: "var(--paper)",
    fontWeight: 700,
    fontSize: 15,
    padding: "12px 0",
    borderRadius: "var(--radius-sm)",
    border: "none",
    cursor: "pointer",
  },
};
