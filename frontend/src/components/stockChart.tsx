import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, AreaSeries } from "lightweight-charts";
import "./DashboardPage.css";

type TimePeriod = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

export default function StockChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1M");

  // Generate random price data
  const generateData = (period: TimePeriod) => {
    const now = new Date();
    const data = [];
    let days = 30;

    switch (period) {
      case "1D": days = 1; break;
      case "1W": days = 7; break;
      case "1M": days = 30; break;
      case "3M": days = 90; break;
      case "1Y": days = 365; break;
      case "ALL": days = 730; break;
    }

    let price = 152;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      price += (Math.random() - 0.5) * 5;

      data.push({
        time: date.toISOString().split("T")[0],
        value: price,
      });
    }

    return data;
  };

  // Create chart
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
      timeScale: { visible: false },
      rightPriceScale: { visible: false },
      crosshair: {
        horzLine: { visible: false },
        vertLine: { visible: false },
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#00C853",
      topColor: "rgba(0, 200, 83, 0.4)",
      bottomColor: "rgba(0, 200, 83, 0)",
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const data = generateData(selectedPeriod);
    series.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update data on period change
  useEffect(() => {
    if (seriesRef.current) {
      const data = generateData(selectedPeriod);
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [selectedPeriod]);

  const periods: TimePeriod[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

  return (
    <div className="chart-wrapper">
      <div className="chart-container">
        <div className="chart-element" ref={chartContainerRef} />
      </div>

      <div className="period-selector">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`period-btn ${
              selectedPeriod === period ? "active" : ""
            }`}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
}
