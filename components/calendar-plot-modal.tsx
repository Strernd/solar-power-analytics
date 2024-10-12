"use client";

import { useState, useEffect, ReactNode } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DayData = {
  date: dayjs.Dayjs;
  value: number;
};

const CirclePlot = ({ value }: { value: number }) => {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const fillPercentage = value / 100;
  const strokeDasharray = `${circumference * fillPercentage} ${circumference}`;

  let color = "text-red-500";
  if (value > 90) color = "text-green-500";
  else if (value > 60) color = "text-yellow-500";
  else if (value > 30) color = "text-orange-500";

  return (
    <div className="relative w-[40px] h-[40px] flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className={`${color} opacity-20`}
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={strokeDasharray}
          className={color}
          transform="rotate(-90 20 20)"
        />
      </svg>
      <span className="absolute text-xs font-semibold">{value}</span>
    </div>
  );
};

const CalendarGrid = ({ data }: { data: DayData[] }) => {
  const firstDayOfMonth = data[0].date.day();
  const totalDays = data.length + firstDayOfMonth;
  const totalWeeks = Math.ceil(totalDays / 7);

  return (
    <div className="grid grid-cols-7 gap-2">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} className="text-center font-semibold">
          {day}
        </div>
      ))}
      {Array.from({ length: totalWeeks * 7 }, (_, i) => {
        const dayIndex = i - firstDayOfMonth;
        const dayData = data[dayIndex];
        return (
          <div key={i} className="flex items-center justify-center h-[50px]">
            {dayData && <CirclePlot value={dayData.value} />}
          </div>
        );
      })}
    </div>
  );
};

type CalendarModalProps = {
  children: ReactNode;
  data: DayData[];
};

export function CalendarPlotModal({ children, data }: CalendarModalProps) {
  let date = dayjs();
  if (data.length > 0) {
    date = data[0].date;
  }
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Daily Autarky Detail - {date.format("MMMM YYYY")}
          </DialogTitle>
        </DialogHeader>
        {data.length > 0 && <CalendarGrid data={data} />}
      </DialogContent>
    </Dialog>
  );
}
