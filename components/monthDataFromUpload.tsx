import dayjs from "dayjs";
import { MappedDataItem } from "./mapSolarEdgeData";
import _ from "lodash";

export type MonthData = {
  firstDay?: dayjs.Dayjs;
  consumption: number;
  fromGrid: number;
  toGrid: number;
  gridCostPerKwh: number;
  costGrid: number;
  revenueGrid: number;
  difference: number;
  opportunityCost: number;
  averageAutarky: number;
  totalDays: number;
};

export const processRawData = (
  rawData: MappedDataItem[],
  gridRevenuePerKwh: number,
  gridCostPerMonth: { [key: string]: number }
): MonthData[] => {
  // Sort data by timestamp
  const sortedData = [...rawData].sort((a, b) =>
    a.timestamp.isBefore(b.timestamp) ? -1 : 1
  );

  // Group data by month
  const groupedData = _.groupBy(sortedData, (item) =>
    item.timestamp.format("YYYY-MM")
  );
  console.log(groupedData);
  // Process each month
  return Object.values(groupedData).map((monthItems) => {
    const gridCostPerKwh =
      gridCostPerMonth[monthItems[0].timestamp.format("YYYY-MMM")] || 0.28;
    const consumption = Math.round(
      monthItems.reduce((sum, item) => sum + item.consumption, 0) / 1000
    ); // Convert to kWh
    const fromGrid = Math.round(
      monthItems.reduce((sum, item) => sum + item.gridConsumption, 0) / 1000
    ); // Convert to kWh
    const toGrid = Math.round(
      monthItems.reduce((sum, item) => sum + item.exported, 0) / 1000
    ); // Convert to kWh
    const averageAutarky =
      monthItems.reduce((sum, item) => sum + item.autarky, 0) /
      monthItems.length;

    const costGrid = fromGrid * gridCostPerKwh;
    const revenueGrid = toGrid * gridRevenuePerKwh;
    const difference = revenueGrid - costGrid;
    const opportunityCost = (consumption - fromGrid) * gridCostPerKwh;

    return {
      firstDay: monthItems[0].timestamp,
      consumption,
      fromGrid,
      toGrid,
      gridCostPerKwh,
      costGrid,
      revenueGrid,
      difference,
      opportunityCost,
      averageAutarky,
      totalDays: monthItems.length,
    };
  });
};
