import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview" },
  { to: "/transactions", label: "History" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header style={styles.header}>
      <div style={styles.brand}>
        <span style={styles.brandMark}>EW</span>
        <span style={styles.brandName}>E-Wallet</span>
      </div>

      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                ...styles.navLink,
                ...(active ? styles.navLinkActive : {}),
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={styles.userArea}>
        <span style={styles.userName}>{user?.fullName}</span>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 32px",
    borderBottom: "1px solid var(--line)",
    background: "var(--paper-raised)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
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
  brandName: {
    fontWeight: 700,
    fontSize: 17,
    letterSpacing: "-0.01em",
  },
  nav: {
    display: "flex",
    gap: 28,
  },
  navLink: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--slate)",
    paddingBottom: 4,
    borderBottom: "2px solid transparent",
  },
  navLinkActive: {
    color: "var(--ink)",
    borderBottom: "2px solid var(--ink)",
  },
  userArea: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  userName: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--slate)",
  },
  logoutBtn: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--ink)",
    background: "transparent",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)",
    padding: "7px 14px",
    cursor: "pointer",
  },
};
