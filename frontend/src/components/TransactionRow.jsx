import { useAuth } from "../context/AuthContext";

const TYPE_LABELS = {
  ADD_MONEY: "Added money",
  TRANSFER_SENT: "Sent to",
  TRANSFER_RECEIVED: "Received from",
};

const formatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function TransactionRow({ transaction }) {
  const { user } = useAuth();
  const isCredit =
    transaction.type === "ADD_MONEY" || transaction.type === "TRANSFER_RECEIVED";

  const counterpartyId = isCredit ? transaction.senderUserId : transaction.receiverUserId;

  let label = TYPE_LABELS[transaction.type] || transaction.type;
  if (transaction.type === "ADD_MONEY") {
    label = "Added to wallet";
  } else if (counterpartyId) {
    label = `${label} user #${counterpartyId}`;
  }

  const date = new Date(transaction.timestamp);
  const dateLabel = date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div style={styles.row}>
      <div style={styles.left}>
        <span
          style={{
            ...styles.iconBadge,
            background: isCredit ? "var(--signal-green-bg)" : "var(--signal-rust-bg)",
            color: isCredit ? "var(--signal-green)" : "var(--signal-rust)",
          }}
        >
          {isCredit ? "↓" : "↑"}
        </span>
        <div>
          <div style={styles.label}>{label}</div>
          <div style={styles.meta}>
            {dateLabel}
            {transaction.note ? ` · ${transaction.note}` : ""}
          </div>
        </div>
      </div>

      <div
        className={`mono ${isCredit ? "amount-positive" : "amount-negative"}`}
        style={styles.amount}
      >
        {isCredit ? "+" : "−"}₹{formatter.format(transaction.amount)}
      </div>
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0",
    borderBottom: "1px solid var(--line)",
  },
  left: { display: "flex", alignItems: "center", gap: 14 },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 15,
    flexShrink: 0,
  },
  label: { fontSize: 14.5, fontWeight: 600, color: "var(--ink)" },
  meta: { fontSize: 12.5, color: "var(--slate-soft)", marginTop: 2 },
  amount: { fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap" },
};
