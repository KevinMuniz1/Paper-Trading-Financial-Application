import { useState, useEffect, forwardRef, useImperativeHandle, useMemo, memo, useRef } from 'react';
import {
  StockChartComponent,
  StockChartSeriesCollectionDirective,
  StockChartSeriesDirective,
  Inject,
  Crosshair,
  DateTime,
  SplineAreaSeries,
  LineSeries,
  SplineSeries,
  RangeTooltip,
  Tooltip,
  Legend,
  IStockChartEventArgs,
  PeriodSelector
} from "@syncfusion/ej2-react-charts";

import { buildPath } from "../../Path";
import "@syncfusion/ej2-base/styles/material.css";

const SAMPLE_CSS = `
  .chart-gradient stop[offset="0"] { stop-opacity: 0.5; }
  .chart-gradient stop[offset="0.3"] { stop-opacity: 0.4; }
  .chart-gradient stop[offset="0.6"] { stop-opacity: 0.2; }
  .chart-gradient stop[offset="1"] { stop-opacity: 0; }
  
  .control-pane {
    text-align: left !important;
  }
  
  #portfoliochart_stockChart_toolbar,
  #portfoliochart_stockChart_PeriodsSelector,
  #portfoliochart_stockChart_Indicator,
  .e-stockchart-toolbar,
  .e-period-selector,
  .e-toolbar-item {
    display: none !important;
  }

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

  .stat-value.positive {
    color: #00802f;
  }

  .stat-value.negative {
    color: #d03535;
  }
`;

const themes = [
  "bootstrap5", "bootstrap5dark", "tailwind", "tailwinddark", "material", "materialdark",
  "bootstrap4", "bootstrap", "bootstrapdark", "fabric", "fabricdark", "highcontrast",
  "fluent", "fluentdark", "material3", "material3dark", "fluent2", "fluent2highcontrast",
  "fluent2dark", "tailwind3", "tailwind3dark"
];

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
  const [isTransitioning, setIsTransitioning] = useState(false); // Track period transitions
  
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    return localStorage.getItem('portfolioChartPeriod') || '1d';
  });

  // Use refs to track previous values and avoid unnecessary re-renders
  const chartDataRef = useRef<ChartDataPoint[]>([]);
  const statsRef = useRef<PortfolioStats | null>(null);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchPortfolioData(selectedPeriod, false);
    }
  }));

  useEffect(() => {
    fetchPortfolioData(selectedPeriod, true);
    
    const interval = setInterval(() => {
      fetchPortfolioData(selectedPeriod, false);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [userId, selectedPeriod]);

  const fetchPortfolioData = async (period: string = '1d', showLoading: boolean = true): Promise<void> => {
    
    try {
      if (showLoading) {
        setLoading(true);
      }
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

      if (performanceData.performance && performanceData.performance.length > 0) {
        const formattedData = performanceData.performance.map((item: any) => ({
          x: new Date(item.timestamp),
          portfolioValue: item.portfolioValue,
          totalInvested: item.totalInvested,
          gain: item.gain
        }));

        // More robust comparison - check if data actually changed
        let shouldUpdate = false;
        
        if (chartDataRef.current.length !== formattedData.length) {
          shouldUpdate = true;
        } else if (formattedData.length > 0 && chartDataRef.current.length > 0) {
          const lastPrev = chartDataRef.current[chartDataRef.current.length - 1];
          const lastNew = formattedData[formattedData.length - 1];
          
          if (lastPrev.portfolioValue !== lastNew.portfolioValue ||
              lastPrev.totalInvested !== lastNew.totalInvested) {
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
        const newStats = {
          currentValue: parseFloat(summaryData.portfolio.totalPortfolioValue) || 0,
          totalInvested: parseFloat(summaryData.portfolio.totalInvested) || 0,
          totalGain: parseFloat(summaryData.portfolio.totalGain) || 0,
          totalGainPercent: parseFloat(summaryData.portfolio.totalGainPercent) || 0,
          buyingPower: parseFloat(summaryData.portfolio.buyingPower) || 0
        };

        // Check if stats actually changed using refs
        let statsChanged = false;
        
        if (!statsRef.current) {
          statsChanged = true;
        } else {
          if (statsRef.current.currentValue !== newStats.currentValue ||
              statsRef.current.totalGain !== newStats.totalGain ||
              statsRef.current.buyingPower !== newStats.buyingPower ||
              statsRef.current.totalInvested !== newStats.totalInvested) {
            statsChanged = true;
          }
        }

        if (statsChanged) {
          statsRef.current = newStats;
          setStats(newStats);
        }
      }

    } catch (err) {
      setError("Failed to load portfolio data");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const load = (args: IStockChartEventArgs) => {
    // Load customizations if needed
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    localStorage.setItem('portfolioChartPeriod', period);
    setIsTransitioning(true); // Mark as transitioning
    fetchPortfolioData(period, false).then(() => {
      setIsTransitioning(false); // Done transitioning
    });
  };

  const memoizedChartData = useMemo(() => chartData, [chartData]);

  if (loading) {
    return (
      <div className="control-pane" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        Loading portfolio chart...
      </div>
    );
  }

  return (
    <div className="control-pane">
      <style>{SAMPLE_CSS}</style>

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

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '15px',
        flexWrap: 'wrap'
      }}>
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

      <svg style={{ height: 0 }}>
        <defs>
          {themes.map((theme) => (
            <linearGradient
              key={theme}
              id={`${theme}-gradient-portfolio`}
              className="chart-gradient"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0"></stop>
              <stop offset="0.3"></stop>
              <stop offset="0.6"></stop>
              <stop offset="1"></stop>
            </linearGradient>
          ))}
        </defs>
      </svg>

      <StockChartComponent
        id="portfoliochart"
        title="Portfolio Performance History"
        load={load}
        theme="Material3"
        indicatorType={[]}
        trendlineType={[]}
        exportType={[]}
        enableSelector={false}
        enablePeriodSelector={false}
        height='500'
        primaryXAxis={{
          valueType: "DateTime",
          majorGridLines: { width: 0 },
          crosshairTooltip: { enable: true }
        }}
        primaryYAxis={{
          title: 'Value ($)',
          lineStyle: { color: "transparent" },
          majorTickLines: { color: "transparent", height: 0 },
          labelFormat: '${value}',
          minimum: 0
        }}
        tooltip={{
          enable: true,
          format: "<b>${point.x}</b><br/>Portfolio Value: <b>$${point.y}</b>",
        }}
        crosshair={{
          enable: true,
          lineType: "Both",
          snapToData: true,
          dashArray: "5, 5"
        }}
        chartArea={{ border: { width: 0 } }}
      >
        <Inject
          services={[
            DateTime,
            SplineAreaSeries,
            LineSeries,
            SplineSeries,
            RangeTooltip,
            Tooltip,
            Crosshair,
            Legend
          ]}
        />

        <StockChartSeriesCollectionDirective>
          <StockChartSeriesDirective
            dataSource={memoizedChartData}
            xName="x"
            yName="portfolioValue"
            type="SplineArea"
            name="Portfolio Value"
            fill="#4054a5ff"
            border={{
              width: 2,
              color: "#1113a1ff"
            }}
            opacity={0.75}
            animation={{ enable: false }}
          />

          <StockChartSeriesDirective
            dataSource={memoizedChartData}
            xName="x"
            yName="totalInvested"
            type="Spline"
            name="Total Invested"
            fill="transparent"
            border={{
              width: 2,
              color: "#ff6b6b",
              dashArray: "5,5"
            }}
            animation={{ enable: false }}
          />
        </StockChartSeriesCollectionDirective>
      </StockChartComponent>

      {error && (
        <div style={{
          color: 'red',
          padding: '10px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {chartData.length === 0 && !error && !loading && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#666'
        }}>
          No portfolio history available yet. Start trading to build your history!
        </div>
      )}
    </div>
  );
});

PortfolioChartAdvanced.displayName = 'PortfolioChartAdvanced';

export default memo(PortfolioChartAdvanced);