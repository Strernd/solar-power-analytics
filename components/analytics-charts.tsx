"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MonthData } from "./monthDataFromUpload";

interface ChartProps {
  data: MonthData[];
}

function EnergyFlowChart({ data }: ChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Energy Flow Analysis</CardTitle>
        <CardDescription>
          Monthly breakdown of energy consumption and grid interaction
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer
          config={{
            consumption: { label: "Consumption", color: "hsl(var(--chart-1))" },
            fromGrid: { label: "From Grid", color: "hsl(var(--chart-2))" },
            toGrid: { label: "To Grid", color: "hsl(var(--chart-3))" },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                dataKey="consumption"
                fill="var(--color-consumption)"
                name="Consumption"
              />
              <Bar
                dataKey="fromGrid"
                fill="var(--color-fromGrid)"
                name="From Grid"
              />
              <Bar dataKey="toGrid" fill="var(--color-toGrid)" name="To Grid" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function RevenueAnalysisChart({ data }: ChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Revenue Analysis</CardTitle>
        <CardDescription>
          Monthly breakdown of revenue, cost, and net benefit
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer
          config={{
            revenueGrid: {
              label: "Revenue Grid",
              color: "hsl(var(--chart-4))",
            },
            costGrid: { label: "Cost Grid", color: "hsl(var(--chart-5))" },
            difference: { label: "Net Benefit", color: "hsl(var(--chart-6))" },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                dataKey="revenueGrid"
                fill="var(--color-revenueGrid)"
                name="Revenue Grid"
              />
              <Bar
                dataKey="costGrid"
                fill="var(--color-costGrid)"
                name="Cost Grid"
              />
              <Bar
                dataKey="difference"
                fill="var(--color-difference)"
                name="Net Benefit"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface AnalyticsCharts {
  data: MonthData[];
}

export function AnalyticsCharts({ data }: AnalyticsCharts) {
  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EnergyFlowChart data={data} />
        <RevenueAnalysisChart data={data} />
      </div>
    </div>
  );
}
