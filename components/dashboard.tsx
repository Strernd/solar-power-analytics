"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { mapData, MappedDataItem, RawDataItem } from "./mapSolarEdgeData";
import { MonthData, processRawData } from "./monthDataFromUpload";
import _ from "lodash";
import { AnalyticsCharts } from "./analytics-charts";
import { CalendarPlotModal } from "./calendar-plot-modal";
import { toast } from "sonner";
import exampleData from "./example.json";
import dayjs from "dayjs";

const parseDemoData = (data: (typeof exampleData)[number]) =>
  ({
    ...data,
    timestamp: dayjs(data.timestamp),
  } as MappedDataItem);

export function DashboardComponent() {
  const [mappedData, setMappedData] = useState<MappedDataItem[]>([]);
  const [gridRevenuePerKwh, setGridRevenuePerKwh] = useState<number>(0.082);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [newGridCost, setNewGridCost] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [gridCostPerMonth, setGridCostPerMonth] = useState<{
    [key: string]: number;
  }>({});

  console.log(JSON.stringify(mappedData, null, 2));

  const monthData = processRawData(
    mappedData,
    gridRevenuePerKwh,
    gridCostPerMonth
  );

  const parseFile = (file: File): Promise<RawDataItem[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            reject(
              new Error(
                `Error parsing file ${file.name}: ${results.errors[0].message}`
              )
            );
          } else {
            resolve(results.data as RawDataItem[]);
          }
        },
        header: true,
        skipEmptyLines: true,
        error: (error) => {
          reject(
            new Error(`Error parsing file ${file.name}: ${error.message}`)
          );
        },
      });
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const ps = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      ps.push(parseFile(file));
    }
    Promise.all(ps).then((results) => {
      const mapped = _.flatten(results).map(mapData);
      const newData = [...mappedData, ...mapped];
      setMappedData(_.uniqBy(newData, (item) => item.timestamp.toString()));
      setUploadStatus("CSV file successfully parsed");
      toast("CSV file successfully imported");
      setIsOpen(false);
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setUploadStatus(null);
    }
  };

  const calculateTotals = (data: MonthData[]): MonthData => {
    const totals = monthData.reduce(
      (acc, curr) => ({
        consumption: acc.consumption + curr.consumption,
        fromGrid: acc.fromGrid + curr.fromGrid,
        toGrid: acc.toGrid + curr.toGrid,
        gridCostPerKwh: acc.gridCostPerKwh + curr.gridCostPerKwh,
        costGrid: acc.costGrid + curr.costGrid,
        revenueGrid: acc.revenueGrid + curr.revenueGrid,
        difference: acc.difference + curr.difference,
        opportunityCost: acc.opportunityCost + curr.opportunityCost,
        totalDays: acc.totalDays + curr.totalDays,
        averageAutarky:
          (acc.averageAutarky * acc.totalDays +
            curr.averageAutarky * curr.totalDays) /
          (acc.totalDays + curr.totalDays),
      }),
      {
        consumption: 0,
        fromGrid: 0,
        toGrid: 0,
        gridCostPerKwh: 0,
        costGrid: 0,
        revenueGrid: 0,
        difference: 0,
        opportunityCost: 0,
        averageAutarky: 0,
        totalDays: 0,
      }
    );

    // Calculate average for gridCostPerKwh
    totals.gridCostPerKwh = totals.gridCostPerKwh / data.length;

    return totals;
  };

  const totals = calculateTotals(monthData);

  const handleGridCostUpdate = () => {
    if (selectedMonth && newGridCost) {
      const monthKey = `2024-${selectedMonth}`;
      setGridCostPerMonth({
        ...gridCostPerMonth,
        [monthKey]: parseFloat(newGridCost),
      });
      setSelectedMonth(null);
      setNewGridCost("");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SolarEdge Analytics</h1>

      <div className="flex justify-end space-x-2 mb-4">
        <Button
          variant="ghost"
          onClick={() => {
            setMappedData(exampleData.map(parseDemoData));
            toast("Demo data loaded");
          }}
        >
          Use Demo Data
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Global Settings</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Global Settings</DialogTitle>
              <DialogDescription>
                Set the global Grid Revenue per kWh
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <Label htmlFor="gridRevenue">Grid Revenue per kWh:</Label>
              <Input
                id="gridRevenue"
                type="number"
                value={gridRevenuePerKwh}
                onChange={(e) =>
                  setGridRevenuePerKwh(parseFloat(e.target.value))
                }
                className="w-24"
              />
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Upload Month CSV</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload CSV File</DialogTitle>
              <DialogDescription>
                Upload a CSV file to parse it into JSON and log the result to
                the console.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  multiple
                  accept=".csv"
                  onChange={handleFileUpload}
                />
              </div>
              {uploadStatus && (
                <Alert>
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{uploadStatus}</AlertDescription>
                </Alert>
              )}
            </div>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="2024">
        <TabsList>
          <TabsTrigger value="2024">2024</TabsTrigger>
          <TabsTrigger value="2025">2025</TabsTrigger>
        </TabsList>
        <TabsContent value="2024">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Consumption (kWh)</TableHead>
                  <TableHead>From Grid (kWh)</TableHead>
                  <TableHead>To Grid (kWh)</TableHead>
                  <TableHead>Avg. Autarky</TableHead>
                  <TableHead>Grid Cost per kWh</TableHead>
                  <TableHead>Cost Grid</TableHead>
                  <TableHead>Revenue Grid</TableHead>
                  <TableHead>Difference</TableHead>
                  <TableHead>Opportunity Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthData.map((row) => (
                  <TableRow key={row.firstDay!.format("MMM")}>
                    <TableCell>{row.firstDay!.format("MMM")}</TableCell>
                    <TableCell>{row.consumption}</TableCell>
                    <TableCell>{row.fromGrid}</TableCell>
                    <TableCell>{row.toGrid}</TableCell>
                    <CalendarPlotModal
                      data={mappedData
                        .filter(
                          (x) => x.timestamp.month() === row.firstDay!.month()
                        )
                        .map((x) => ({
                          date: x.timestamp,
                          value: Math.round(x.autarky * 100),
                        }))}
                    >
                      <TableCell>
                        {Math.round(row.averageAutarky * 100)}%
                      </TableCell>
                    </CalendarPlotModal>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSelectedMonth(row.firstDay!.format("MMM"))
                            }
                          >
                            {(
                              gridCostPerMonth[
                                `2024-${row.firstDay!.month()}`
                              ] || 0.28
                            ).toFixed(2)}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Update Grid Cost for {selectedMonth}
                            </DialogTitle>
                            <DialogDescription>
                              Enter the new Grid Cost per kWh
                            </DialogDescription>
                          </DialogHeader>
                          <Input
                            type="number"
                            value={newGridCost}
                            onChange={(e) => setNewGridCost(e.target.value)}
                            placeholder="New Grid Cost"
                          />
                          <Button onClick={handleGridCostUpdate}>Update</Button>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>{row.costGrid.toFixed(2)}€</TableCell>
                    <TableCell>{row.revenueGrid.toFixed(2)}€</TableCell>
                    <TableCell>{row.difference.toFixed(2)}€</TableCell>
                    <TableCell>{row.opportunityCost.toFixed(2)}€</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell>{totals.consumption}</TableCell>
                  <TableCell>{totals.fromGrid}</TableCell>
                  <TableCell>{totals.toGrid}</TableCell>
                  <TableCell>
                    {Math.round(totals.averageAutarky * 100)}%
                  </TableCell>
                  <TableCell>
                    {`Ø ${(totals.gridCostPerKwh as number).toFixed(2)}`}
                  </TableCell>
                  <TableCell>{totals.costGrid.toFixed(2)}€</TableCell>
                  <TableCell>{totals.revenueGrid.toFixed(2)}€</TableCell>
                  <TableCell>{totals.difference.toFixed(2)}€</TableCell>
                  <TableCell>{totals.opportunityCost.toFixed(2)}€</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="mt-8">
            <AnalyticsCharts data={monthData} />
          </div>
        </TabsContent>
        <TabsContent value="2025">
          <p>No data available for 2025 yet.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
