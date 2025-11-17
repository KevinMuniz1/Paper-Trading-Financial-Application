import { IStockChartEventArgs } from "@syncfusion/ej2-react-charts";

export function loadStockChartTheme(args: IStockChartEventArgs): string {
  let selectedTheme = location.hash.split("/")[1] || "Material";

  args.stockChart.theme = (selectedTheme.charAt(0).toUpperCase() +
    selectedTheme.slice(1)) as any;

  return selectedTheme.toLowerCase();
}
