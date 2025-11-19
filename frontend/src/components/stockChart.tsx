import { useState, useEffect } from 'react';
import {StockChartComponent,StockChartSeriesCollectionDirective,StockChartSeriesDirective,Inject,Crosshair,DateTime,SplineAreaSeries,
  LineSeries,SplineSeries,CandleSeries,HiloOpenCloseSeries,HiloSeries,RangeAreaSeries,Trendlines,RangeTooltip,Tooltip,EmaIndicator,RsiIndicator,
  BollingerBands,TmaIndicator,MomentumIndicator,SmaIndicator,AtrIndicator,AccumulationDistributionIndicator,MacdIndicator,StochasticIndicator,Export,IStockChartEventArgs
} from "@syncfusion/ej2-react-charts";

import { buildPath } from "../../Path";
import { useAuth } from '../context/AuthContext'; 
import "@syncfusion/ej2-base/styles/material.css";

const SAMPLE_CSS = `
  .chart-gradient stop[offset="0"] { stop-opacity: 0.5; }
  .chart-gradient stop[offset="0.3"] { stop-opacity: 0.4; }
  .chart-gradient stop[offset="0.6"] { stop-opacity: 0.2; }
  .chart-gradient stop[offset="1"] { stop-opacity: 0; }
  
  /* Control pane layout fix */
  .control-pane {
    text-align: left !important;
  }
  
  /* Stock chart toolbar - make everything horizontal */
  #stockchartsplinearea_stockChart_toolbar,
  #stockchartsplinearea > div:first-child,
  .e-stockchart-toolbar {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;
    flex-wrap: wrap !important;
    gap: 10px !important;
  }
  
  /* Period selector and Indicators should be inline */
  #stockchartsplinearea_stockChart_PeriodsSelector,
  #stockchartsplinearea_stockChart_Indicator,
  .e-period-selector,
  .e-toolbar-item {
    display: inline-block !important;
    vertical-align: middle !important;
  }
`;

const themes = [
  "bootstrap5","bootstrap5dark","tailwind","tailwinddark","material","materialdark",
  "bootstrap4","bootstrap","bootstrapdark","fabric","fabricdark","highcontrast",
  "fluent","fluentdark","material3","material3dark","fluent2","fluent2highcontrast",
  "fluent2dark","tailwind3","tailwind3dark"
];

interface StockChartProps {
  symbol: string;
}

interface ChartDataPoint {
  x: Date;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
}

const SplineArea = ({ symbol }: StockChartProps) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    fetchStockHistory(symbol);
    fetchCurrentPrice(symbol);
  }, [symbol]);

  const fetchCurrentPrice = async (ticker: string) => {
    try {
      const response = await fetch(buildPath('stock/prices'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: [ticker.toUpperCase()] })
      });
      
      const data = await response.json();
      
      if (data.prices && data.prices[ticker.toUpperCase()]) {
        setCurrentPrice(data.prices[ticker.toUpperCase()]);
      }
    } catch (err) {
      console.error("Error fetching current price:", err);
    }
  };

  const fetchStockHistory = async (ticker: string) => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch maximum data (1 year) so the period selector can filter it client-side
      const response = await fetch(buildPath(`stock/history/${ticker}?period=1y`));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }
      
      const data = await response.json();
      
      if (data.error || !data.data || data.data.length === 0) {
        setError(data.error || "No data available");
        setChartData([{ 
          x: new Date(), 
          high: 100, 
          low: 95, 
          open: 98, 
          close: 99, 
          volume: 1000000 
        }]);
      } else {
        // Convert date strings back to Date objects
        const formattedData = data.data.map((item: any) => ({
          ...item,
          x: new Date(item.x)
        }));
        setChartData(formattedData);
        
        // If price API failed, use last close price from chart data
        if (!currentPrice && formattedData.length > 0) {
          const latestData = formattedData[formattedData.length - 1];
          setCurrentPrice(latestData.close);
        }
      }
    } catch (err) {
      console.error("Error fetching stock history:", err);
      setError("Failed to load chart data");
      setChartData([{ 
        x: new Date(), 
        high: 100, 
        low: 95, 
        open: 98, 
        close: 99, 
        volume: 1000000 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const load = (args: IStockChartEventArgs) => {
    // Load customizations
  };

  if (loading) {
    return (
      <div className="control-pane" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        Loading {symbol} chart...
      </div>
    );
  }

  return (
    <div className="control-pane">
      <style>{SAMPLE_CSS}</style>

      <svg style={{ height: 0 }}>
        <defs>
          {themes.map((theme) => (
            <linearGradient
              key={theme}
              id={`${theme}-gradient-chart`}
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
        id="stockchartsplinearea"
        title={currentPrice ? `${symbol} - $${currentPrice.toFixed(2)}` : `${symbol} Stock Price`}
        titleStyle={{
        fontFamily: 'Segoe UI',
        fontWeight: '600',
        size: '24px',  // Change this value to make it bigger or smaller
        color: '#19005eff'
        }}
        load={load}
        theme="Material3"
        indicatorType={[]}
        trendlineType={[]}
        exportType={[]}
        primaryXAxis={{
          valueType: "DateTime",
          majorGridLines: { width: 0 },
          crosshairTooltip: { enable: true }
        }}
        primaryYAxis={{
          lineStyle: { color: "transparent" },
          majorTickLines: { color: "transparent", height: 0 },
        }}
        tooltip={{
          enable: true,
          format: "<b>${point.x}</b><br/>Stock Price: <b>${point.y}</b>",
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
            RangeTooltip,
            Tooltip,
            Crosshair,
            LineSeries,
            SplineSeries,
            CandleSeries,
            HiloOpenCloseSeries,
            HiloSeries,
            RangeAreaSeries,
            Trendlines,
            EmaIndicator,
            RsiIndicator,
            BollingerBands,
            TmaIndicator,
            MomentumIndicator,
            SmaIndicator,
            AtrIndicator,
            Export,
            AccumulationDistributionIndicator,
            MacdIndicator,
            StochasticIndicator
          ]}
        />

        <StockChartSeriesCollectionDirective>
          <StockChartSeriesDirective
            dataSource={chartData}
            xName="x"
            yName="high"
            type="SplineArea"
            fill="#4054a5ff"
            border={{ 
              width: 2, 
              color: "#1113a1ff"    
            }}
            opacity={.75}
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
    </div>
  );
};

export default SplineArea;