import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, AreaSeries } from "lightweight-charts";

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

export default function StockChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1M');

  // Generate data based on period
  const generateData = (period: TimePeriod) => {
    const now = new Date();
    const data = [];
    let days = 30;
    
    switch(period) {
      case '1D': days = 1; break;
      case '1W': days = 7; break;
      case '1M': days = 30; break;
      case '3M': days = 90; break;
      case '1Y': days = 365; break;
      case 'ALL': days = 730; break;
    }

    let basePrice = 152;
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      basePrice += (Math.random() - 0.5) * 5;
      data.push({ time: dateStr, value: basePrice });
    }
    
    return data;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#191919",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        visible: false,
      },
      rightPriceScale: {
        visible: false,
      },
      crosshair: {
        horzLine: {
          visible: false,
        },
        vertLine: {
          visible: false,
        },
      },
    });

    const areaSeries = chart.addSeries(AreaSeries,{
      lineColor: "#00C853",
      topColor: "rgba(0, 200, 83, 0.4)",
      bottomColor: "rgba(0, 200, 83, 0.0)",
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    const data = generateData(selectedPeriod);
    areaSeries.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update data when period changes
  useEffect(() => {
    if (seriesRef.current) {
      const data = generateData(selectedPeriod);
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [selectedPeriod]);

  const periods: TimePeriod[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

  return (
    <div style={{ width: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ position: "relative", width: "100%", height: "300px", marginBottom: "16px" }}>
        <div ref={chartContainerRef} style={{ width: "100%", height: "300px" }} />
        <style>{`
          a[href*="tradingview.com"] {
            display: none !important;
          }
        `}</style>
      </div>
      
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              border: selectedPeriod === period ? "none" : "1px solid #e0e0e0",
              borderRadius: "8px",
              background: selectedPeriod === period ? "#000000" : "#ffffff",
              color: selectedPeriod === period ? "#ffffff" : "#666666",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (selectedPeriod !== period) {
                e.currentTarget.style.background = "#f5f5f5";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPeriod !== period) {
                e.currentTarget.style.background = "#ffffff";
              }
            }}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
}