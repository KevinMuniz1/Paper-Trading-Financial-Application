import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import '../components/DashboardPage.css';
import { buildPath } from '../../Path';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Position {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  gain: number;
  gainPercent: number;
  purchaseDate: string | null;
}

type SortKey = 'symbol' | 'quantity' | 'avgCost' | 'currentPrice' | 'totalCost' | 'currentValue' | 'gain' | 'gainPercent';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function TradeHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('symbol');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (user?.userId) fetchPositions();
  }, [user?.userId]);

  const fetchPositions = async () => {
    try {
      setLoading(true); setError('');
      const res = await fetch(buildPath('trades'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.userId }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setPositions(data.trades || []);
    } catch { setError('Failed to load positions.'); }
    finally { setLoading(false); }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...positions].sort((a, b) => {
    const av = a[sortKey] as any;
    const bv = b[sortKey] as any;
    const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalValue    = positions.reduce((s, p) => s + p.currentValue, 0);
  const totalCost     = positions.reduce((s, p) => s + p.totalCost, 0);
  const totalGain     = totalValue - totalCost;
  const totalGainPct  = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const gainPositive  = totalGain >= 0;

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span style={{ marginLeft: 4, opacity: sortKey === col ? 1 : 0.3, fontSize: '0.7rem' }}>
      {sortKey === col ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );

  const thStyle: React.CSSProperties = {
    padding: '0.6rem 1rem', fontSize: '0.68rem', fontWeight: 600,
    textTransform: 'uppercase' as const, letterSpacing: '0.07em',
    color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none',
    whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)',
    background: 'var(--bg-elevated)', textAlign: 'right' as const,
  };
  const tdStyle: React.CSSProperties = {
    padding: '0.7rem 1rem', fontSize: '0.85rem',
    color: 'var(--text-primary)', borderBottom: '1px solid var(--border)',
    fontVariantNumeric: 'tabular-nums', textAlign: 'right' as const,
    whiteSpace: 'nowrap',
  };

  return (
    <div className="page-shell">
      <NavBar />
      <div className="dashboard-body">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-header-title">Positions</h1>
            <p className="page-header-sub">All current open positions in your portfolio</p>
          </div>
          <button
            onClick={fetchPositions}
            style={{ padding: '0.5rem 1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card-label">Market Value</div>
            <div className="stat-card-value num">{loading ? '—' : `$${fmt(totalValue)}`}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Total Invested</div>
            <div className="stat-card-value num">{loading ? '—' : `$${fmt(totalCost)}`}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Unrealized P&amp;L</div>
            <div className={`stat-card-value num ${gainPositive ? 'positive' : 'negative'}`}>
              {loading ? '—' : `${gainPositive ? '+' : ''}$${fmt(totalGain)}`}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Return</div>
            <div className={`stat-card-value num ${gainPositive ? 'positive' : 'negative'}`}>
              {loading ? '—' : `${gainPositive ? '+' : ''}${totalGainPct.toFixed(2)}%`}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '2rem 0' }}>Loading positions…</div>
        ) : error ? (
          <div style={{ color: 'var(--red)', fontSize: '0.88rem' }}>{error}</div>
        ) : positions.length === 0 ? (
          <div style={{
            background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem'
          }}>
            No open positions. Start trading to build your portfolio.
          </div>
        ) : (
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, textAlign: 'left' }} onClick={() => handleSort('symbol')}>
                      Symbol <SortIcon col="symbol" />
                    </th>
                    <th style={thStyle} onClick={() => handleSort('quantity')}>
                      Shares <SortIcon col="quantity" />
                    </th>
                    <th style={thStyle} onClick={() => handleSort('avgCost')}>
                      Avg Cost <SortIcon col="avgCost" />
                    </th>
                    <th style={thStyle} onClick={() => handleSort('currentPrice')}>
                      Last Price <SortIcon col="currentPrice" />
                    </th>
                    <th style={thStyle} onClick={() => handleSort('totalCost')}>
                      Cost Basis <SortIcon col="totalCost" />
                    </th>
                    <th style={thStyle} onClick={() => handleSort('currentValue')}>
                      Mkt Value <SortIcon col="currentValue" />
                    </th>
                    <th style={thStyle} onClick={() => handleSort('gain')}>
                      P&amp;L ($) <SortIcon col="gain" />
                    </th>
                    <th style={thStyle} onClick={() => handleSort('gainPercent')}>
                      P&amp;L (%) <SortIcon col="gainPercent" />
                    </th>
                    <th style={{ ...thStyle, textAlign: 'left' }}>Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(p => {
                    const up = p.gain >= 0;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/stock/${p.symbol}`)}
                        style={{ cursor: 'pointer', transition: 'background 0.12s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ ...tdStyle, textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.symbol}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        </td>
                        <td style={tdStyle}>{p.quantity}</td>
                        <td style={tdStyle}>${fmt(p.avgCost)}</td>
                        <td style={tdStyle}>${fmt(p.currentPrice)}</td>
                        <td style={tdStyle}>${fmt(p.totalCost)}</td>
                        <td style={tdStyle}>${fmt(p.currentValue)}</td>
                        <td style={{ ...tdStyle, color: up ? 'var(--green)' : 'var(--red)' }}>
                          {up ? '+' : ''}${fmt(p.gain)}
                        </td>
                        <td style={{ ...tdStyle }}>
                          <span className={up ? 'badge-positive' : 'badge-negative'}>
                            {up ? '+' : ''}{p.gainPercent.toFixed(2)}%
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {fmtDate(p.purchaseDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
