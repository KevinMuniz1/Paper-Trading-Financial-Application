import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { buildPath } from "../../Path";
import { useAuth } from "../context/AuthContext";
import "./NavBar.css";

const NAV = [
  {
    to: "/DashBoardPage",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    to: "/browse",
    label: "Market",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    to: "/trades",
    label: "Positions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    to: "/accountSettings",
    label: "Account",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [portfolioValue, setPortfolioValue] = useState<number | null>(null);
  const [buyingPower, setBuyingPower] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.userId) return;
    fetchSummary();
    const id = setInterval(fetchSummary, 30_000);
    return () => clearInterval(id);
  }, [user?.userId]);

  const fetchSummary = async () => {
    try {
      const res = await fetch(buildPath("portfolio/summary"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.userId }),
      });
      const data = await res.json();
      if (data.portfolio) {
        setPortfolioValue(data.portfolio.totalPortfolioValue ?? null);
        setBuyingPower(data.portfolio.buyingPower ?? null);
      }
    } catch {
      /* ignore */
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">ST</div>
        <div>
          <div className="sidebar-logo-text">SimpliTrade</div>
          <div className="sidebar-logo-sub">Paper Trading</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section-label">Navigation</div>
      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <span className="sidebar-link-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Portfolio summary */}
      {user && portfolioValue !== null && (
        <div className="sidebar-portfolio">
          <div className="sidebar-portfolio-row">
            <span className="sidebar-portfolio-label">Portfolio</span>
            <span className="sidebar-portfolio-value num">${fmt(portfolioValue)}</span>
          </div>
          <div className="sidebar-portfolio-row">
            <span className="sidebar-portfolio-label">Buying Power</span>
            <span className="sidebar-portfolio-value num">
              ${buyingPower !== null ? fmt(buyingPower) : "—"}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div className="sidebar-user-name">
              {user.firstName} {user.lastName}
            </div>
          </div>
        )}
        <button className="sidebar-logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default NavBar;
