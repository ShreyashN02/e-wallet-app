export default function Modal({ title, children, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 27, 45, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 50,
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    background: "var(--paper-raised)",
    borderRadius: "var(--radius-lg)",
    padding: "24px 26px",
    border: "1px solid var(--line)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  title: { fontSize: 18, fontWeight: 700, margin: 0 },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: 22,
    lineHeight: 1,
    color: "var(--slate)",
    cursor: "pointer",
    padding: 4,
  },
};
