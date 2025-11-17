import {StockChartComponent,StockChartSeriesCollectionDirective,StockChartSeriesDirective,Inject,Crosshair,DateTime,SplineAreaSeries,
  LineSeries,SplineSeries,CandleSeries,HiloOpenCloseSeries,HiloSeries,RangeAreaSeries,Trendlines,RangeTooltip,Tooltip,EmaIndicator,RsiIndicator,
  BollingerBands,TmaIndicator,MomentumIndicator,SmaIndicator,AtrIndicator,AccumulationDistributionIndicator,MacdIndicator,StochasticIndicator,Export,IStockChartEventArgs
} from "@syncfusion/ej2-react-charts";

import { googl } from "./stock-data";
import "@syncfusion/ej2-base/styles/tailwind.css";



// Syncfusion sample gradient CSS
const SAMPLE_CSS = `
  .chart-gradient stop[offset="0"] { stop-opacity: 0.5; }
  .chart-gradient stop[offset="0.3"] { stop-opacity: 0.4; }
  .chart-gradient stop[offset="0.6"] { stop-opacity: 0.2; }
  .chart-gradient stop[offset="1"] { stop-opacity: 0; }
`;

// Syncfusion theme color arrays (required)
const themes = [
  "bootstrap5","bootstrap5dark","tailwind","tailwinddark","material","materialdark",
  "bootstrap4","bootstrap","bootstrapdark","fabric","fabricdark","highcontrast",
  "fluent","fluentdark","material3","material3dark","fluent2","fluent2highcontrast",
  "fluent2dark","tailwind3","tailwind3dark"
];

const borderColor = [
  "#FD7E14","#FD7E14","#5A61F6","#8B5CF6","#00bdae","#9ECB08","#a16ee5","#a16ee5",
  "#a16ee5","#4472c4","#4472c4","#79ECE4","#1AC9E6","#1AC9E6","#6355C7","#4EAAFF",
  "#6200EE","#9BB449","#9BB449","#2F4074","#8029F1"
];


const SplineArea = () => {
  const load = (args: IStockChartEventArgs) => {
    // The actual chart theme → must stay EXACTLY as passed ("TailwindDark")
    const chartTheme = args.stockChart.theme;

    // Lowercase version ONLY for gradient IDs and your color array
    const themeKey = chartTheme.toLowerCase();

    // Lookup index in your lowercase themes array
    const themeIndex = themes.indexOf(themeKey);

    args.stockChart.series[0].border = {
      width: 2,
      color: borderColor[themeIndex],
    };

    args.stockChart.series[0].fill = `url(#${themeKey}-gradient-chart)`;
  };

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
        title="Google Stock Price"
        load={load}
        theme="Material3"   // ✔ Correct casing
        primaryXAxis={{
          valueType: "DateTime",
          majorGridLines: { width: 0 },
          crosshairTooltip: { enable: true }
        }}
        primaryYAxis={{
          lineStyle: { color: "transparent" },
          majorTickLines: { color: "transparent", height: 0 },
          crosshairTooltip: { enable: true }
        }}
        tooltip={{
          enable: true,
          format:
            "<b>${point.x}</b><br/>Stock Price: <b>${point.y}</b>",
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
            dataSource={googl}
            xName="x"
            yName="high"
            type="SplineArea"
            fill="#5447cc8e"
            border={{ 
            width: 2, 
           color: "#11a33dff"    
             }}
             opacity={.75}
            
          />
        </StockChartSeriesCollectionDirective>
      </StockChartComponent>
    </div>
  );
};

export default SplineArea;
