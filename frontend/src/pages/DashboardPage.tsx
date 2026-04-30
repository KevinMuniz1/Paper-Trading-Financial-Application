import { useState, useEffect, useRef } from 'react';
import NavBar from '../components/NavBar';
import HoldingsBar from '../components/watchListBar';
import WatchlistSection from '../components/WatchlistSection';
import '../components/DashboardPage.css';
import PortfolioChartAdvanced from '../components/portfolioChart';
import BuyingPowerCard from '../components/CardAddBuyingPower';
import { useAuth } from '../context/AuthContext';
import { buildPath } from '../../Path';

interface PortfolioStats {
  totalPortfolioValue: number;
  buyingPower: number;
  totalGain: number;
  totalGainPercent: number;
}

const DashboardPage = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const { user, loading } = useAuth();
  const userId = user?.userId;
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (userId) fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const res = await fetch(buildPath('portfolio/summary'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.portfolio) setStats(data.portfolio);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <NavBar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
          Loading…
        </div>
      </div>
    );
  }

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const gainPositive = (stats?.totalGain ?? 0) >= 0;

  return (
    <div className="page-shell">
      <NavBar />

      <div className="dashboard-body">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-header-title">Portfolio Overview</h1>
            <p className="page-header-sub">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button className="bp-button" onClick={() => setIsCardVisible(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add / Withdraw Funds
          </button>
        </div>

        {/* Stat cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card-label">Portfolio Value</div>
            <div className="stat-card-value num">
              {stats ? `$${fmt(stats.totalPortfolioValue)}` : '—'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Buying Power</div>
            <div className="stat-card-value num">
              {stats ? `$${fmt(stats.buyingPower)}` : '—'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Total Gain / Loss</div>
            <div className={`stat-card-value num ${gainPositive ? 'positive' : 'negative'}`}>
              {stats ? `${gainPositive ? '+' : ''}$${fmt(stats.totalGain)}` : '—'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Return</div>
            <div className={`stat-card-value num ${gainPositive ? 'positive' : 'negative'}`}>
              {stats ? `${gainPositive ? '+' : ''}${stats.totalGainPercent.toFixed(2)}%` : '—'}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="dashboard-grid">
          {/* Chart */}
          <div className="chart-panel">
            <div className="chart-panel-header">
              <p className="chart-panel-title">Portfolio Performance</p>
            </div>
            {userId ? (
              <PortfolioChartAdvanced ref={chartRef} userId={userId} />
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Log in to view your portfolio
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="right-column">
            <div className="side-panel">
              <HoldingsBar />
            </div>
            <div className="side-panel">
              <WatchlistSection />
            </div>
          </div>
        </div>
      </div>

      {/* Buying power modal */}
      {isCardVisible && (
        <div className="modal-overlay" onClick={() => setIsCardVisible(false)}>
          <div className="buyingPowerDiv" onClick={e => e.stopPropagation()}>
            <BuyingPowerCard onClose={() => { setIsCardVisible(false); fetchStats(); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
