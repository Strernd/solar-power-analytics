import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export type RawDataItem = {
  Time: string;
  "Bezug (Wh)": string;
  "Energie - Eigenverbrauch (Wh)": string;
  "Exportieren (Wh)": string;
  "Produktion (Wh)": string;
  "SolarSelfConsumption.Energy (Wh)": string;
  "Verbrauch (Wh)": string;
  "Von der Batterie (Wh)": string;
};

export type MappedDataItem = {
  timestamp: dayjs.Dayjs;
  gridConsumption: number;
  selfConsumption: number;
  exported: number;
  production: number;
  solarSelfConsumption: number;
  consumption: number;
  batteryDischarge: number;
  autarky: number;
};

export const mapData = (item: RawDataItem): MappedDataItem => {
  const gridConsumption = parseFloat(item["Bezug (Wh)"]) || 0;
  const consumption = parseFloat(item["Verbrauch (Wh)"]) || 0;
  return {
    timestamp: dayjs(item.Time, "DD.MM.YYYY"),
    gridConsumption: gridConsumption,
    selfConsumption: parseFloat(item["Energie - Eigenverbrauch (Wh)"]) || 0,
    exported: parseFloat(item["Exportieren (Wh)"]) || 0,
    production: parseFloat(item["Produktion (Wh)"]) || 0,
    solarSelfConsumption:
      parseFloat(item["SolarSelfConsumption.Energy (Wh)"]) || 0,
    consumption: consumption,
    batteryDischarge: parseFloat(item["Von der Batterie (Wh)"]) || 0,
    autarky:
      consumption > 0 ? (consumption - gridConsumption) / consumption : 1,
  };
};
