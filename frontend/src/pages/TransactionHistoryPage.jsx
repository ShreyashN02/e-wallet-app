import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import TransactionRow from "../components/TransactionRow";
import { getTransactionHistory } from "../services/transactionService";

const PAGE_SIZE = 10;

export default function TransactionHistoryPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ transactions: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (pageNumber) => {
    setLoading(true);
    try {
      const result = await getTransactionHistory({ page: pageNumber, size: PAGE_SIZE });
      setData(result);
    } catch (err) {
      console.error("Failed to load transaction history", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const hasPrev = page > 0;
  const hasNext = page < data.totalPages - 1;

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>Transaction history</h1>
          <span style={styles.countLabel}>{data.totalElements} total</span>
        </div>

        <section style={styles.card}>
          {loading ? (
            <p style={styles.emptyText}>Loading…</p>
          ) : data.transactions.length === 0 ? (
            <p style={styles.emptyText}>No transactions on this page.</p>
          ) : (
            <div>
              {data.transactions.map((t) => (
                <TransactionRow key={`${t.transactionId}-${t.type}`} transaction={t} />
              ))}
            </div>
          )}

          <div style={styles.pagination}>
            <button
              style={{ ...styles.pageBtn, ...(hasPrev ? {} : styles.pageBtnDisabled) }}
              disabled={!hasPrev}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
            >
              ← Previous
            </button>
            <span style={styles.pageIndicator}>
              Page {data.totalPages === 0 ? 0 : page + 1} of {data.totalPages}
            </span>
            <button
              style={{ ...styles.pageBtn, ...(hasNext ? {} : styles.pageBtnDisabled) }}
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "var(--paper)" },
  main: { maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.01em" },
  countLabel: { fontSize: 13.5, color: "var(--slate)", fontFamily: "var(--font-mono)" },
  card: {
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-lg)",
    padding: "10px 26px 22px",
  },
  emptyText: { color: "var(--slate-soft)", fontSize: 14, padding: "20px 0" },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    paddingTop: 18,
    borderTop: "1px solid var(--line)",
  },
  pageBtn: {
    fontSize: 13.5,
    fontWeight: 600,
    color: "var(--ink)",
    background: "transparent",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)",
    padding: "8px 14px",
    cursor: "pointer",
  },
  pageBtnDisabled: {
    color: "var(--slate-soft)",
    cursor: "not-allowed",
    opacity: 0.6,
  },
  pageIndicator: { fontSize: 13, color: "var(--slate)", fontFamily: "var(--font-mono)" },
};
