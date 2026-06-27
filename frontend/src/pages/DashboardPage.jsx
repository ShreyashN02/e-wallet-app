import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import AnimatedAmount from "../components/AnimatedAmount";
import AddMoneyModal from "../components/AddMoneyModal";
import TransferModal from "../components/TransferModal";
import TransactionRow from "../components/TransactionRow";
import { useAuth } from "../context/AuthContext";
import { getBalance, createWallet } from "../services/walletService";
import { getTransactionHistory } from "../services/transactionService";

export default function DashboardPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // "add" | "transfer" | null
  const [banner, setBanner] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let balanceData;
      try {
        balanceData = await getBalance();
      } catch (err) {
        if (err.response?.status === 404) {
          balanceData = await createWallet();
        } else {
          throw err;
        }
      }
      setWallet(balanceData);

      const history = await getTransactionHistory({ page: 0, size: 5 });
      setRecent(history.transactions);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleSuccess(updatedWallet, message) {
    setWallet(updatedWallet);
    setActiveModal(null);
    setBanner(message);
    // Refresh recent activity to reflect the new transaction
    getTransactionHistory({ page: 0, size: 5 }).then((h) => setRecent(h.transactions));
    setTimeout(() => setBanner(null), 4000);
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        {banner && <div style={styles.banner}>{banner}</div>}

        <section style={styles.balanceCard}>
          <div style={styles.balanceLabel}>
            <span>AVAILABLE BALANCE</span>
            <span style={styles.balanceSub}>Updated just now</span>
          </div>

          {loading ? (
            <div style={styles.balanceSkeleton} />
          ) : (
            <AnimatedAmount value={wallet?.balance ?? 0} style={styles.balanceFigure} />
          )}

          <div style={styles.actionsRow}>
            <button style={styles.primaryAction} onClick={() => setActiveModal("add")}>
              + Add money
            </button>
            <button style={styles.secondaryAction} onClick={() => setActiveModal("transfer")}>
              Send money
            </button>
          </div>
        </section>

        <section style={styles.activitySection}>
          <div style={styles.activityHeader}>
            <h2 style={styles.activityTitle}>Recent activity</h2>
            <a href="/transactions" style={styles.viewAllLink}>
              View all
            </a>
          </div>

          {loading ? (
            <p style={styles.emptyText}>Loading…</p>
          ) : recent.length === 0 ? (
            <p style={styles.emptyText}>
              Nothing here yet. Add money or send your first transfer to get started.
            </p>
          ) : (
            <div>
              {recent.map((t) => (
                <TransactionRow key={`${t.transactionId}-${t.type}`} transaction={t} />
              ))}
            </div>
          )}
        </section>
      </main>

      {activeModal === "add" && (
        <AddMoneyModal
          onClose={() => setActiveModal(null)}
          onSuccess={(w) => handleSuccess(w, "Money added to your wallet.")}
        />
      )}
      {activeModal === "transfer" && (
        <TransferModal
          onClose={() => setActiveModal(null)}
          onSuccess={(w) => handleSuccess(w, "Transfer sent successfully.")}
        />
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "var(--paper)" },
  main: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "40px 24px 80px",
  },
  banner: {
    background: "var(--signal-green-bg)",
    color: "var(--signal-green)",
    fontSize: 14,
    fontWeight: 600,
    padding: "12px 16px",
    borderRadius: "var(--radius-sm)",
    marginBottom: 20,
  },
  balanceCard: {
    background: "var(--ink)",
    borderRadius: "var(--radius-lg)",
    padding: "32px 30px",
    color: "var(--paper)",
    marginBottom: 32,
  },
  balanceLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    letterSpacing: "0.08em",
    color: "rgba(250, 248, 243, 0.55)",
    marginBottom: 14,
  },
  balanceSub: { fontWeight: 500, letterSpacing: "normal", fontSize: 12 },
  balanceFigure: {
    display: "block",
    fontSize: 44,
    fontWeight: 600,
    color: "var(--gold)",
    lineHeight: 1.1,
  },
  balanceSkeleton: {
    width: 220,
    height: 44,
    borderRadius: 8,
    background: "rgba(250, 248, 243, 0.12)",
  },
  actionsRow: { display: "flex", gap: 12, marginTop: 26 },
  primaryAction: {
    background: "var(--gold)",
    color: "var(--ink)",
    fontWeight: 700,
    fontSize: 14.5,
    padding: "12px 20px",
    border: "none",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
  },
  secondaryAction: {
    background: "transparent",
    color: "var(--paper)",
    fontWeight: 700,
    fontSize: 14.5,
    padding: "12px 20px",
    border: "1px solid rgba(250, 248, 243, 0.35)",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
  },
  activitySection: {
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-lg)",
    padding: "24px 26px",
  },
  activityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },
  activityTitle: { fontSize: 17, fontWeight: 700, margin: 0 },
  viewAllLink: { fontSize: 13.5, fontWeight: 600, color: "var(--slate)", textDecoration: "underline" },
  emptyText: { color: "var(--slate-soft)", fontSize: 14, padding: "20px 0" },
};
