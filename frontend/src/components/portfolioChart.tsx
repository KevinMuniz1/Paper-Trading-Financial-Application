import { useState, useEffect, forwardRef, useImperativeHandle, memo, useRef } from 'react';
import { createChart, AreaSeries, LineSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { buildPath } from "../../Path";
import { useTheme, CHART_COLORS } from '../context/ThemeContext';

interface PortfolioChartProps { userId: string | number; }

interface ChartDataPoint {
  x: Date;
  portfolioValue: number;
  totalInvested: number;
  gain: number;
}

interface PortfolioStats {
  currentValue: number;
  totalInvested: number;
  totalGain: number;
  totalGainPercent: number;
  buyingPower: number;
}

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PortfolioChartAdvanced = forwardRef(({ userId }: PortfolioChartProps, ref) => {
  const { theme } = useTheme();
  const c = CHART_COLORS[theme];

  const [chartData, setChartData]   = useState<ChartDataPoint[]>([]);
  const [stats, setStats]           = useState<PortfolioStats | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedPeriod, setSelectedPeriod]   = useState(
    () => localStorage.getItem('portfolioChartPeriod') || '1d'
  );

  const chartDataRef    = useRef<ChartDataPoint[]>([]);
  const statsRef        = useRef<PortfolioStats | null>(null);
  const containerRef    = useRef<HTMLDivElement>(null);
  const chartRef        = useRef<IChartApi | null>(null);
  const areaSeriesRef   = useRef<ISeriesApi<'Area'> | null>(null);
  const lineSeriesRef   = useRef<ISeriesApi<'Line'> | null>(null);

  useImperativeHandle(ref, () => ({ refresh: () => fetchPortfolioData(selectedPeriod, false) }));

  /* ── Create chart once ───────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;
    const colors = CHART_COLORS[theme];

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: colors.bg },
        textColor: colors.text,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      },
      grid: { vertLines: { visible: false }, horzLines: { color: colors.grid } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
      crosshair: {
        vertLine: { color: colors.crosshair, labelBackgroundColor: colors.crosshairBg },
        horzLine: { color: colors.crosshair, labelBackgroundColor: colors.crosshairBg },
      },
      width: containerRef.current.clientWidth,
      height: 320,
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: colors.line,
      topColor: colors.topColor,
      bottomColor: colors.bottomColor,
      lineWidth: 2,
      title: 'Portfolio Value',
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: colors.lineInvested,
      lineWidth: 1,
      title: 'Total Invested',
    });

    chartRef.current      = chart;
    areaSeriesRef.current = areaSeries;
    lineSeriesRef.current = lineSeries;

    const onResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.remove();
      chartRef.current = null; areaSeriesRef.current = null; lineSeriesRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Re-apply colours when theme switches ────── */
  useEffect(() => {
    if (!chartRef.current || !areaSeriesRef.current || !lineSeriesRef.current) return;
    chartRef.current.applyOptions({
      layout: { background: { color: c.bg }, textColor: c.text },
      grid: { horzLines: { color: c.grid } },
      crosshair: {
        vertLine: { color: c.crosshair, labelBackgroundColor: c.crosshairBg },
        horzLine: { color: c.crosshair, labelBackgroundColor: c.crosshairBg },
      },
    });
    areaSeriesRef.current.applyOptions({
      lineColor: c.line, topColor: c.topColor, bottomColor: c.bottomColor,
    });
    lineSeriesRef.current.applyOptions({ color: c.lineInvested });
  }, [theme, c]);

  /* ── Sync chart data ─────────────────────────── */
  useEffect(() => {
    if (!areaSeriesRef.current || !lineSeriesRef.current || !chartData.length) return;
    type LWTime = import('lightweight-charts').Time;
    const seen = new Set<number>();
    const sorted = [...chartData]
      .sort((a, b) => a.x.getTime() - b.x.getTime())
      .filter(item => {
        const t = Math.floor(item.x.getTime() / 1000);
        if (seen.has(t)) return false;
        seen.add(t); return true;
      });
    const areaData = sorted.map(d => ({ time: Math.floor(d.x.getTime() / 1000) as unknown as LWTime, value: d.portfolioValue }));
    const lineData = sorted.map(d => ({ time: Math.floor(d.x.getTime() / 1000) as unknown as LWTime, value: d.totalInvested }));
    areaSeriesRef.current.setData(areaData);
    lineSeriesRef.current.setData(lineData);
    chartRef.current?.timeScale().fitContent();
  }, [chartData]);

  /* ── Fetch on mount + interval ───────────────── */
  useEffect(() => {
    fetchPortfolioData(selectedPeriod, true);
    const id = setInterval(() => fetchPortfolioData(selectedPeriod, false), 60_000);
    return () => clearInterval(id);
  }, [userId, selectedPeriod]);

  const fetchPortfolioData = async (period = '1d', showLoading = true): Promise<void> => {
    try {
      if (showLoading) setLoading(true);
      setError('');
      const [perfRes, sumRes] = await Promise.all([
        fetch(buildPath('portfolio/performance'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, period }) }),
        fetch(buildPath('portfolio/summary'),     { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) }),
      ]);
      const [perfData, sumData] = await Promise.all([perfRes.json(), sumRes.json()]);

      if (perfData.error || sumData.error) { setError(perfData.error || sumData.error); return; }

      if (perfData.performance?.length > 0) {
        const formatted: ChartDataPoint[] = perfData.performance.map((item: any) => ({
          x: new Date(item.timestamp),
          portfolioValue: item.portfolioValue,
          totalInvested: item.totalInvested,
          gain: item.gain,
        }));
        const last = chartDataRef.current[chartDataRef.current.length - 1];
        const newLast = formatted[formatted.length - 1];
        const changed = chartDataRef.current.length !== formatted.length ||
          (last && newLast && (last.portfolioValue !== newLast.portfolioValue || last.totalInvested !== newLast.totalInvested));
        if (changed) { chartDataRef.current = formatted; setChartData(formatted); }
      } else {
        setChartData([{ x: new Date(), portfolioValue: sumData.portfolio?.totalPortfolioValue || 0, totalInvested: sumData.portfolio?.totalInvested || 0, gain: sumData.portfolio?.totalGain || 0 }]);
      }

      if (sumData.portfolio) {
        const ns: PortfolioStats = {
          currentValue:     parseFloat(sumData.portfolio.totalPortfolioValue) || 0,
          totalInvested:    parseFloat(sumData.portfolio.totalInvested)  || 0,
          totalGain:        parseFloat(sumData.portfolio.totalGain)       || 0,
          totalGainPercent: parseFloat(sumData.portfolio.totalGainPercent)|| 0,
          buyingPower:      parseFloat(sumData.portfolio.buyingPower)     || 0,
        };
        const s = statsRef.current;
        if (!s || s.currentValue !== ns.currentValue || s.totalGain !== ns.totalGain || s.buyingPower !== ns.buyingPower) {
          statsRef.current = ns; setStats(ns);
        }
      }
    } catch { setError('Failed to load portfolio data'); }
    finally  { if (showLoading) setLoading(false); }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    localStorage.setItem('portfolioChartPeriod', period);
    setIsTransitioning(true);
    fetchPortfolioData(period, false).then(() => setIsTransitioning(false));
  };

  /* ── Theme-aware UI colours ──────────────────── */
  const uiMuted      = theme === 'light' ? '#a09080' : '#5c5040';
  const uiBg         = theme === 'light' ? '#f5f0e8' : '#1d1916';
  const uiBorder     = theme === 'light' ? '#e2d8cc' : '#2e2620';
  const uiInactive   = theme === 'light' ? '#a09080' : '#5c5040';
  const gainPositive = !stats || stats.totalGain >= 0;
  const gainColor    = theme === 'light' ? (gainPositive ? '#15803d' : '#b91c1c') : (gainPositive ? '#4ade80' : '#f87171');

  return (
    <div>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: '3px', background: uiBg, border: `1px solid ${uiBorder}`, borderRadius: 7, padding: '3px', width: 'fit-content', marginBottom: '1rem' }}>
        {['1d', '5d', '1mo', '3mo', '1y', 'ytd', 'all'].map(p => (
          <button key={p} onClick={() => handlePeriodChange(p)} disabled={isTransitioning} style={{
            padding: '4px 9px', borderRadius: 5, border: 'none',
            background: selectedPeriod === p ? '#C8102E' : 'transparent',
            color: selectedPeriod === p ? '#fff' : uiInactive,
            fontFamily: 'Inter, sans-serif', fontSize: '0.72rem',
            fontWeight: selectedPeriod === p ? 700 : 500,
            cursor: isTransitioning ? 'wait' : 'pointer',
            opacity: isTransitioning ? 0.6 : 1,
            transition: 'all 0.12s', letterSpacing: '0.04em',
          }}>
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', height: 320, borderRadius: 6, overflow: 'hidden' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg, zIndex: 1, color: uiMuted, fontSize: '0.84rem', fontFamily: 'Inter, sans-serif' }}>
            Loading portfolio chart…
          </div>
        )}
        <div ref={containerRef} style={{ height: 320 }} />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.6rem', paddingLeft: '0.25rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: uiMuted }}>
          <span style={{ width: 12, height: 2, background: c.line, borderRadius: 1, display: 'inline-block' }} />
          Portfolio Value{stats ? ` — $${fmt(stats.currentValue)}` : ''}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: uiMuted }}>
          <span style={{ width: 12, height: 2, background: c.lineInvested, borderRadius: 1, display: 'inline-block' }} />
          Invested{stats ? ` — $${fmt(stats.totalInvested)}` : ''}
        </span>
        {stats && (
          <span style={{ fontSize: '0.72rem', color: gainColor, fontFamily: "'JetBrains Mono', monospace" }}>
            {gainPositive ? '+' : ''}${fmt(stats.totalGain)} ({gainPositive ? '+' : ''}{stats.totalGainPercent.toFixed(2)}%)
          </span>
        )}
      </div>

      {error && <div style={{ color: theme === 'light' ? '#b91c1c' : '#f87171', fontSize: '0.82rem', textAlign: 'center', marginTop: '0.5rem' }}>{error}</div>}
      {chartData.length === 0 && !error && !loading && (
        <div style={{ color: uiMuted, fontSize: '0.84rem', textAlign: 'center', padding: '1rem 0' }}>
          No portfolio history yet. Start trading to build your chart!
        </div>
      )}
    </div>
  );
});

PortfolioChartAdvanced.displayName = 'PortfolioChartAdvanced';
export default memo(PortfolioChartAdvanced);
