import NavBar from '../components/NavBar';
import '../components/DashboardPage.css';
import StockChart from '../components/stockChart';
import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { buildPath } from '../../Path';
import TradeStockCard from '../components/buyAndSellCard';
import { useAuth } from '../context/AuthContext';

const fmt = (v: any, prefix = '', suffix = '') =>
  v && v !== 'None' && v !== '-' ? `${prefix}${v}${suffix}` : '—';

const fmtNum = (v: any) => {
  const n = parseFloat(v);
  if (isNaN(n)) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
};

const DisplayStockPage = () => {
  const { symbol } = useParams();
  const { user } = useAuth();
  const userId = user?.userId;
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTradeModalVisible, setIsTradeModalVisible] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    if (symbol) {
      fetchOverview(symbol.toUpperCase());
      checkWatchlist(symbol.toUpperCase());
    }
  }, [symbol, userId]);

  const fetchOverview = async (sym: string) => {
    try {
      setLoading(true); setError('');
      const res = await fetch(buildPath(`overview/${sym}`));
      const data = await res.json();
      if (data.error) setError(data.error);
      else setOverview(data.overview);
    } catch { setError('Failed to load stock data.'); }
    finally { setLoading(false); }
  };

  const checkWatchlist = async (sym: string) => {
    if (!userId) return;
    try {
      const res = await fetch(buildPath('watchlist/check'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, symbol: sym }),
      });
      const data = await res.json();
      setIsInWatchlist(data.isInWatchlist);
    } catch { /* ignore */ }
  };

  const toggleWatchlist = async () => {
    if (!userId || !symbol) return;
    const sym = symbol.toUpperCase();
    const endpoint = isInWatchlist ? 'watchlist/delete' : 'watchlist/add';
    try {
      const res = await fetch(buildPath(endpoint), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, symbol: sym }),
      });
      const data = await res.json();
      if (data.success) {
        setIsInWatchlist(!isInWatchlist);
        window.dispatchEvent(new Event('refreshWatchlist'));
      }
    } catch { /* ignore */ }
  };

  const refreshAfterTrade = () => {
    setIsTradeModalVisible(false);
    window.dispatchEvent(new Event('refreshHoldings'));
    window.dispatchEvent(new Event('refreshAccountValue'));
  };

  const metrics = overview ? [
    { label: 'Market Cap',       value: fmtNum(overview.MarketCapitalization) },
    { label: 'P/E Ratio',        value: fmt(overview.PERatio) },
    { label: 'EPS',              value: fmt(overview.EPS, '$') },
    { label: '52-Wk High',       value: fmt(overview['52WeekHigh'], '$') },
    { label: '52-Wk Low',        value: fmt(overview['52WeekLow'], '$') },
    { label: 'Dividend Yield',   value: overview.DividendYield && overview.DividendYield !== 'None' ? `${(parseFloat(overview.DividendYield) * 100).toFixed(2)}%` : '—' },
    { label: 'Beta',             value: fmt(overview.Beta) },
    { label: 'Analyst Target',   value: fmt(overview.AnalystTargetPrice, '$') },
    { label: 'Revenue (TTM)',    value: fmtNum(overview.RevenueTTM) },
    { label: 'Gross Profit',     value: fmtNum(overview.GrossProfitTTM) },
    { label: 'Profit Margin',    value: overview.ProfitMargin && overview.ProfitMargin !== 'None' ? `${(parseFloat(overview.ProfitMargin) * 100).toFixed(1)}%` : '—' },
    { label: 'Sector',           value: fmt(overview.Sector) },
  ] : [];

  if (!symbol) return <div className="page-shell"><NavBar /><div style={{ padding: '2rem', color: 'var(--text-muted)' }}>No symbol provided.</div></div>;

  return (
    <div className="page-shell">
      <NavBar />

      <div className="stock-body">

        {/* Header */}
        <div className="stock-header-row">
          <div className="stock-hero">
            <span className="stock-hero-symbol">{symbol.toUpperCase()}</span>
            {overview?.Name && <span className="stock-hero-name">{overview.Name} · {overview.Exchange}</span>}
          </div>
          <div className="stock-action-row">
            <button className="btn-primary" onClick={() => setIsTradeModalVisible(true)}>Trade</button>
            <button className={`btn-outline${isInWatchlist ? ' active' : ''}`} onClick={toggleWatchlist}>
              {isInWatchlist ? '★ Watchlist' : '☆ Watchlist'}
            </button>
          </div>
        </div>

        {/* Content grid */}
        <div className="stock-content-grid">
          {/* Left: chart + metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="chart-panel">
              <StockChart symbol={symbol} />
            </div>

            {overview && (
              <div className="chart-panel">
                <p className="chart-panel-title" style={{ marginBottom: '1rem' }}>Key Statistics</p>
                <div className="metrics-grid">
                  {metrics.map(m => (
                    <div key={m.label} className="metric-item">
                      <div className="metric-label">{m.label}</div>
                      <div className="metric-value num">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: about */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {loading && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading {symbol}…</div>}
            {error && <div style={{ color: 'var(--red)', fontSize: '0.9rem' }}>{error}</div>}
            {overview && (
              <div className="about-panel">
                <p className="about-panel-title">About</p>
                <p>{overview.Description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trade modal */}
      {isTradeModalVisible && (
        <div className="modal-overlay" onClick={() => setIsTradeModalVisible(false)}>
          <div className="buyingPowerDiv" onClick={e => e.stopPropagation()}>
            <TradeStockCard
              onClose={() => setIsTradeModalVisible(false)}
              onTradeSuccess={refreshAfterTrade}
              stockSymbol={overview?.Symbol || symbol}
              stockName={overview?.Name || symbol}
              currentPrice={150}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayStockPage;
