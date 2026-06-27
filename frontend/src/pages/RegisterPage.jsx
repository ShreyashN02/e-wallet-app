import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createWallet } from "../services/walletService";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      // Provision a zero-balance wallet right after registration so the
      // dashboard has something to show immediately
      try {
        await createWallet();
      } catch {
        // non-fatal: dashboard will lazily create the wallet on first add-money
      }
      navigate("/dashboard");
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      const firstFieldError = fieldErrors ? Object.values(fieldErrors)[0] : null;
      setError(
        firstFieldError || err.response?.data?.message || "Couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brandRow}>
          <span style={styles.brandMark}>EW</span>
          <span style={styles.brandName}>E-Wallet</span>
        </div>

        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>Get a wallet, add money, and send it to anyone in seconds.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Full name
            <input
              type="text"
              name="fullName"
              required
              minLength={2}
              value={form.fullName}
              onChange={handleChange}
              style={styles.input}
              placeholder="Jordan Lee"
              autoComplete="name"
            />
          </label>

          <label style={styles.label}>
            Email
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label style={styles.label}>
            Phone number
            <input
              type="tel"
              name="phoneNumber"
              required
              pattern="[0-9]{10}"
              title="10 digit phone number"
              value={form.phoneNumber}
              onChange={handleChange}
              style={styles.input}
              placeholder="9876543210"
              autoComplete="tel"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.footerLink}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--paper)",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-lg)",
    padding: "36px 32px",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  brandMark: {
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    fontSize: 14,
    background: "var(--ink)",
    color: "var(--paper)",
    padding: "6px 9px",
    borderRadius: 6,
    letterSpacing: "0.04em",
  },
  brandName: { fontWeight: 700, fontSize: 17 },
  title: { fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.01em" },
  subtitle: { fontSize: 14, color: "var(--slate)", margin: "0 0 28px" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
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
    marginTop: 6,
    background: "var(--ink)",
    color: "var(--paper)",
    fontWeight: 700,
    fontSize: 15,
    padding: "12px 0",
    borderRadius: "var(--radius-sm)",
    border: "none",
    cursor: "pointer",
  },
  footerText: { textAlign: "center", fontSize: 13.5, color: "var(--slate)", marginTop: 22 },
  footerLink: { color: "var(--ink)", fontWeight: 600, textDecoration: "underline" },
};
