import { useState, useEffect, useRef } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { buildPath } from "../../Path";

interface StockChartProps {
  symbol: string;
}

interface RawDataPoint {
  x: string | Date;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
}

const SplineArea = ({ symbol }: StockChartProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1y');

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { color: '#0d1526' }, textColor: '#94a3b8' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#1a2d4a' } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true },
      width: containerRef.current.clientWidth,
      height: 400,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: '#3b82f6',
      topColor: 'rgba(59,130,246,0.3)',
      bottomColor: 'rgba(59,130,246,0)',
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    fetchStockHistory(symbol, selectedPeriod, true);
    fetchCurrentPrice(symbol);

    const interval = setInterval(() => {
      fetchCurrentPrice(symbol);
      fetchStockHistory(symbol, selectedPeriod, false);
    }, 5000);

    return () => clearInterval(interval);
  }, [symbol, selectedPeriod]);

  const fetchCurrentPrice = async (ticker: string) => {
    try {
      const response = await fetch(buildPath('stock/prices'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: [ticker.toUpperCase()] })
      });
      const data = await response.json();
      if (data.prices?.[ticker.toUpperCase()]) {
        setCurrentPrice(data.prices[ticker.toUpperCase()]);
      }
    } catch (err) {
      console.error("Error fetching current price:", err);
    }
  };

  const fetchStockHistory = async (ticker: string, period = '1y', showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");

      const response = await fetch(buildPath(`stock/history/${ticker}?period=${period}`));
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) throw new Error("Server returned non-JSON response");

      const data = await response.json();

      if (data.error || !data.data?.length) {
        setError(data.error || "No data available");
        return;
      }

      const seen = new Set<number>();
      const chartData = (data.data as RawDataPoint[])
        .map(item => ({
          time: Math.floor(new Date(item.x).getTime() / 1000) as unknown as import('lightweight-charts').Time,
          value: item.high,
        }))
        .sort((a, b) => (a.time as number) - (b.time as number))
        .filter(item => {
          const t = item.time as number;
          if (seen.has(t)) return false;
          seen.add(t);
          return true;
        });

      if (seriesRef.current) {
        seriesRef.current.setData(chartData);
        chartRef.current?.timeScale().fitContent();
      }

      if (!currentPrice && data.data.length > 0) {
        setCurrentPrice(data.data[data.data.length - 1].close);
      }
    } catch (err) {
      console.error("Error fetching stock history:", err);
      setError("Failed to load chart data");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'Segoe UI', fontWeight: '600', fontSize: '24px', color: '#19005e', margin: '0 0 15px 0' }}>
        {currentPrice ? `${symbol} - $${currentPrice.toFixed(2)}` : `${symbol} Stock Price`}
      </h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        {['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y', 'max'].map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: selectedPeriod === period ? '2px solid #4054a5ff' : '1px solid #ccc',
              background: selectedPeriod === period ? '#4054a5ff' : 'white',
              color: selectedPeriod === period ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: selectedPeriod === period ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            {period.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', height: '400px' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            justifyContent: 'center', alignItems: 'center',
            background: 'white', zIndex: 1
          }}>
            Loading {symbol} chart...
          </div>
        )}
        <div ref={containerRef} style={{ height: '400px' }} />
      </div>

      {error && <div style={{ color: 'red', padding: '10px', textAlign: 'center' }}>{error}</div>}
    </div>
  );
};

export default SplineArea;
