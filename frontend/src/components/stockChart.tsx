import { useState, useEffect, useRef } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { buildPath } from '../../Path';
import { useTheme, CHART_COLORS } from '../context/ThemeContext';

interface StockChartProps { symbol: string; }

interface RawDataPoint {
  x: string | Date;
  high: number; low: number; open: number; close: number; volume: number;
}

const PERIODS = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y'];
const LIVE_INTERVAL_MS = 5000;

const SplineArea = ({ symbol }: StockChartProps) => {
  const { theme } = useTheme();
  const c = CHART_COLORS[theme];

  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [currentPrice, setCurrentPrice]     = useState<number | null>(null);
  const [prevClose, setPrevClose]           = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1d');
  const [isLive, setIsLive]                 = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<ISeriesApi<'Area'> | null>(null);
  const lastTimeRef  = useRef<number>(0);

  /* ── Create chart once on mount ─────────────── */
  useEffect(() => {
    if (!containerRef.current) return;
    const colors = CHART_COLORS[theme];

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: colors.bg },
        textColor: colors.text,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: colors.grid },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
      crosshair: {
        vertLine: { color: colors.crosshair, labelBackgroundColor: colors.crosshairBg },
        horzLine: { color: colors.crosshair, labelBackgroundColor: colors.crosshairBg },
      },
      width: containerRef.current.clientWidth,
      height: 340,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: colors.line,
      topColor: colors.topColor,
      bottomColor: colors.bottomColor,
      lineWidth: 2,
      priceLineVisible: true,
      priceLineColor: colors.priceLine,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const onResize = () => {
      if (containerRef.current)
        chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Re-apply colors when theme switches ────── */
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;
    chartRef.current.applyOptions({
      layout: { background: { color: c.bg }, textColor: c.text },
      grid: { horzLines: { color: c.grid } },
      crosshair: {
        vertLine: { color: c.crosshair, labelBackgroundColor: c.crosshairBg },
        horzLine: { color: c.crosshair, labelBackgroundColor: c.crosshairBg },
      },
    });
    seriesRef.current.applyOptions({
      lineColor: c.line,
      topColor: c.topColor,
      bottomColor: c.bottomColor,
      priceLineColor: c.priceLine,
    });
  }, [theme, c]);

  /* ── Load history + start live ticker ──────── */
  useEffect(() => {
    let cancelled = false;
    setIsLive(false);

    fetchHistory(symbol, selectedPeriod).then(() => {
      if (cancelled) return;
      setIsLive(true);
    });

    const liveId = setInterval(async () => {
      if (cancelled) return;
      const price = await fetchLivePrice(symbol);
      if (price == null || !seriesRef.current) return;

      const now = Math.floor(Date.now() / 1000);
      const t   = Math.max(now, lastTimeRef.current + 1) as unknown as Time;
      seriesRef.current.update({ time: t, value: price });
      lastTimeRef.current = t as number;
      setCurrentPrice(price);
      setIsLive(true);
    }, LIVE_INTERVAL_MS);

    return () => { cancelled = true; clearInterval(liveId); setIsLive(false); };
  }, [symbol, selectedPeriod]);

  const fetchLivePrice = async (ticker: string): Promise<number | null> => {
    try {
      const res  = await fetch(buildPath('stock/prices'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: [ticker.toUpperCase()] }),
      });
      const data = await res.json();
      return data.prices?.[ticker.toUpperCase()] ?? null;
    } catch { return null; }
  };

  const fetchHistory = async (ticker: string, period: string) => {
    try {
      setLoading(true); setError('');
      const res  = await fetch(buildPath(`stock/history/${ticker}?period=${period}`));
      if (!res.ok) throw new Error('Bad response');
      const data = await res.json();

      if (data.error || !data.data?.length) { setError(data.error || 'No data available'); return; }

      const seen = new Set<number>();
      const points = (data.data as RawDataPoint[])
        .map(d => ({ time: Math.floor(new Date(d.x).getTime() / 1000) as unknown as Time, value: d.close }))
        .sort((a, b) => (a.time as number) - (b.time as number))
        .filter(d => { const t = d.time as number; if (seen.has(t)) return false; seen.add(t); return true; });

      if (!seriesRef.current) return;
      seriesRef.current.setData(points);
      chartRef.current?.timeScale().fitContent();

      if (points.length > 0) {
        const last = points[points.length - 1];
        lastTimeRef.current = last.time as number;
        setCurrentPrice(last.value);
        setPrevClose(points.length > 1 ? points[points.length - 2].value : last.value);
      }
    } catch { setError('Failed to load chart data'); }
    finally   { setLoading(false); }
  };

  const priceChange    = currentPrice != null && prevClose != null ? currentPrice - prevClose : null;
  const changePct      = priceChange  != null && prevClose         ? (priceChange / prevClose) * 100 : null;
  const changePositive = priceChange == null || priceChange >= 0;

  /* ── Theme-aware UI colours ─────────────────── */
  const uiText      = theme === 'light' ? '#1c140d' : '#f5f0e8';
  const uiMuted     = theme === 'light' ? '#a09080' : '#5c5040';
  const uiBg        = theme === 'light' ? '#f5f0e8' : '#1d1916';
  const uiBorder    = theme === 'light' ? '#e2d8cc' : '#2e2620';
  const uiInactiveTxt = theme === 'light' ? '#a09080' : '#5c5040';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: uiText, letterSpacing: '-0.5px', fontFamily: 'Inter, sans-serif' }}>
              {symbol.toUpperCase()}
            </span>
            {isLive && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block', animation: 'livepulse 1.4s ease-in-out infinite' }} />
                Live
              </span>
            )}
          </div>
          {currentPrice != null && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: uiText, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.5px' }}>
                ${currentPrice.toFixed(2)}
              </span>
              {priceChange != null && changePct != null && (
                <span style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: changePositive ? (theme === 'light' ? '#15803d' : '#4ade80') : (theme === 'light' ? '#b91c1c' : '#f87171') }}>
                  {changePositive ? '+' : ''}{priceChange.toFixed(2)} ({changePositive ? '+' : ''}{changePct.toFixed(2)}%)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', gap: '3px', background: uiBg, border: `1px solid ${uiBorder}`, borderRadius: 7, padding: '3px' }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setSelectedPeriod(p)} style={{
              padding: '4px 9px', borderRadius: 5, border: 'none',
              background: selectedPeriod === p ? '#C8102E' : 'transparent',
              color: selectedPeriod === p ? '#fff' : uiInactiveTxt,
              fontFamily: 'Inter, sans-serif', fontSize: '0.72rem',
              fontWeight: selectedPeriod === p ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.12s', letterSpacing: '0.04em',
            }}>
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', height: 340, borderRadius: 6, overflow: 'hidden' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg, zIndex: 2, color: uiMuted, fontSize: '0.84rem', fontFamily: 'Inter, sans-serif' }}>
            Loading {symbol.toUpperCase()}…
          </div>
        )}
        <div ref={containerRef} style={{ height: 340 }} />
      </div>

      {error && <div style={{ color: theme === 'light' ? '#b91c1c' : '#f87171', fontSize: '0.82rem', textAlign: 'center', marginTop: '0.5rem' }}>{error}</div>}

      <style>{`@keyframes livepulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }`}</style>
    </div>
  );
};

export default SplineArea;
