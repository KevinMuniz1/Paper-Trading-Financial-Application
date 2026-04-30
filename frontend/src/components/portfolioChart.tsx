import { useState, useEffect, forwardRef, useImperativeHandle, memo, useRef } from 'react';
import { createChart, AreaSeries, LineSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { buildPath } from "../../Path";

const STATS_CSS = `
  .portfolio-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 8px;
  }
  .stat-card {
    padding: 12px;
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .stat-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }
  .stat-value {
    font-size: 20px;
    font-weight: bold;
    color: #333;
  }
  .stat-value.positive { color: #00802f; }
  .stat-value.negative { color: #d03535; }
`;

interface PortfolioChartProps {
  userId: string | number;
}

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

const PortfolioChartAdvanced = forwardRef(({ userId }: PortfolioChartProps, ref) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    return localStorage.getItem('portfolioChartPeriod') || '1d';
  });

  const chartDataRef = useRef<ChartDataPoint[]>([]);
  const statsRef = useRef<PortfolioStats | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchPortfolioData(selectedPeriod, false);
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#0d1526' }, textColor: '#94a3b8' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1a2d4a' } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
      width: containerRef.current.clientWidth,
      height: 440,
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#3b82f6',
      topColor: 'rgba(59,130,246,0.3)',
      bottomColor: 'rgba(59,130,246,0)',
      lineWidth: 2,
      title: 'Portfolio Value',
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: '#ef4444',
      lineWidth: 2,
      title: 'Total Invested',
    });

    chartRef.current = chart;
    areaSeriesRef.current = areaSeries;
    lineSeriesRef.current = lineSeries;

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      areaSeriesRef.current = null;
      lineSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!areaSeriesRef.current || !lineSeriesRef.current || !chartData.length) return;

    const seen = new Set<number>();
    const sorted = [...chartData]
      .sort((a, b) => a.x.getTime() - b.x.getTime())
      .filter(item => {
        const t = Math.floor(item.x.getTime() / 1000);
        if (seen.has(t)) return false;
        seen.add(t);
        return true;
      });

    type LWTime = import('lightweight-charts').Time;
    const areaData = sorted.map(d => ({ time: Math.floor(d.x.getTime() / 1000) as unknown as LWTime, value: d.portfolioValue }));
    const lineData = sorted.map(d => ({ time: Math.floor(d.x.getTime() / 1000) as unknown as LWTime, value: d.totalInvested }));

    areaSeriesRef.current.setData(areaData);
    lineSeriesRef.current.setData(lineData);
    chartRef.current?.timeScale().fitContent();
  }, [chartData]);

  useEffect(() => {
    fetchPortfolioData(selectedPeriod, true);

    const interval = setInterval(() => {
      fetchPortfolioData(selectedPeriod, false);
    }, 10000);

    return () => clearInterval(interval);
  }, [userId, selectedPeriod]);

  const fetchPortfolioData = async (period = '1d', showLoading = true): Promise<void> => {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const performanceResponse = await fetch(buildPath('portfolio/performance'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, period })
      });
      const performanceData = await performanceResponse.json();

      const summaryResponse = await fetch(buildPath('portfolio/summary'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const summaryData = await summaryResponse.json();

      if (performanceData.error || summaryData.error) {
        setError(performanceData.error || summaryData.error);
        return;
      }

      if (performanceData.performance?.length > 0) {
        const formattedData: ChartDataPoint[] = performanceData.performance.map((item: any) => ({
          x: new Date(item.timestamp),
          portfolioValue: item.portfolioValue,
          totalInvested: item.totalInvested,
          gain: item.gain
        }));

        let shouldUpdate = false;
        if (chartDataRef.current.length !== formattedData.length) {
          shouldUpdate = true;
        } else if (formattedData.length > 0 && chartDataRef.current.length > 0) {
          const lastPrev = chartDataRef.current[chartDataRef.current.length - 1];
          const lastNew = formattedData[formattedData.length - 1];
          if (lastPrev.portfolioValue !== lastNew.portfolioValue || lastPrev.totalInvested !== lastNew.totalInvested) {
            shouldUpdate = true;
          }
        }

        if (shouldUpdate) {
          chartDataRef.current = formattedData;
          setChartData(formattedData);
        }
      } else {
        const now = new Date();
        setChartData([{
          x: now,
          portfolioValue: summaryData.portfolio?.totalPortfolioValue || 0,
          totalInvested: summaryData.portfolio?.totalInvested || 0,
          gain: summaryData.portfolio?.totalGain || 0
        }]);
      }

      if (summaryData.portfolio) {
        const newStats: PortfolioStats = {
          currentValue: parseFloat(summaryData.portfolio.totalPortfolioValue) || 0,
          totalInvested: parseFloat(summaryData.portfolio.totalInvested) || 0,
          totalGain: parseFloat(summaryData.portfolio.totalGain) || 0,
          totalGainPercent: parseFloat(summaryData.portfolio.totalGainPercent) || 0,
          buyingPower: parseFloat(summaryData.portfolio.buyingPower) || 0
        };

        const statsChanged = !statsRef.current ||
          statsRef.current.currentValue !== newStats.currentValue ||
          statsRef.current.totalGain !== newStats.totalGain ||
          statsRef.current.buyingPower !== newStats.buyingPower ||
          statsRef.current.totalInvested !== newStats.totalInvested;

        if (statsChanged) {
          statsRef.current = newStats;
          setStats(newStats);
        }
      }
    } catch (err) {
      setError("Failed to load portfolio data");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    localStorage.setItem('portfolioChartPeriod', period);
    setIsTransitioning(true);
    fetchPortfolioData(period, false).then(() => {
      setIsTransitioning(false);
    });
  };

  return (
    <div>
      <style>{STATS_CSS}</style>

      {stats && (
        <div className="portfolio-stats">
          <div className="stat-card">
            <div className="stat-label">Portfolio Value</div>
            <div className="stat-value">
              ${stats.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Invested</div>
            <div className="stat-value">
              ${stats.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Gain/Loss</div>
            <div className={`stat-value ${stats.totalGain >= 0 ? 'positive' : 'negative'}`}>
              {stats.totalGain >= 0 ? '+' : ''}${stats.totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {' '}({stats.totalGain >= 0 ? '+' : ''}{stats.totalGainPercent.toFixed(2)}%)
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Buying Power</div>
            <div className="stat-value">
              ${stats.buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        {['1d', '5d', '1mo', '3mo', '1y', 'ytd', 'all'].map(period => (
          <button
            key={period}
            onClick={() => handlePeriodChange(period)}
            disabled={isTransitioning}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: selectedPeriod === period ? '2px solid #4054a5ff' : '1px solid #ccc',
              background: selectedPeriod === period ? '#4054a5ff' : 'white',
              color: selectedPeriod === period ? 'white' : '#333',
              cursor: isTransitioning ? 'wait' : 'pointer',
              fontWeight: selectedPeriod === period ? '600' : '400',
              transition: 'all 0.2s',
              opacity: isTransitioning ? 0.6 : 1
            }}
          >
            {period.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', height: '500px' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            justifyContent: 'center', alignItems: 'center',
            background: 'white', zIndex: 1
          }}>
            Loading portfolio chart...
          </div>
        )}
        <div ref={containerRef} style={{ height: '500px' }} />
      </div>

      {error && (
        <div style={{ color: 'red', padding: '10px', textAlign: 'center' }}>{error}</div>
      )}

      {chartData.length === 0 && !error && !loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          No portfolio history available yet. Start trading to build your history!
        </div>
      )}
    </div>
  );
});

PortfolioChartAdvanced.displayName = 'PortfolioChartAdvanced';

export default memo(PortfolioChartAdvanced);
