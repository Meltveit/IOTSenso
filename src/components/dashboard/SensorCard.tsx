"use client";

import type { Sensor } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Thermometer, Waves, Gauge, Wind } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ICONS = {
  temperature: Thermometer,
  humidity: Waves,
  pressure: Gauge,
  vibration: Wind,
};

const chartConfig = {
  value: {
    label: "Value",
  },
} satisfies ChartConfig;

type SensorCardProps = {
  sensor: Sensor;
};

export default function SensorCard({ sensor }: SensorCardProps) {
  const Icon = ICONS[sensor.type];
  const unit =
    sensor.type === "temperature"
      ? "°C"
      : sensor.type === "humidity"
      ? "%"
      : sensor.type === "pressure"
      ? "Pa"
      : "m/s²";

  const statusColors = {
    normal: "bg-green-500/20 text-green-700 border-green-500/30",
    warning: "bg-accent/20 text-accent-foreground border-accent/30",
    critical: "bg-destructive/20 text-destructive border-destructive/30",
  };
  
  const chartColor = {
    normal: "hsl(var(--chart-1))",
    warning: "hsl(var(--chart-2))",
    critical: "hsl(var(--destructive))",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="grid gap-1">
          <CardTitle className="flex items-center gap-2 font-headline">
            <Icon className="h-5 w-5 text-muted-foreground" />
            {sensor.name}
          </CardTitle>
          <CardDescription>{sensor.location}</CardDescription>
        </div>
        <Badge variant="outline" className={cn("text-xs", statusColors[sensor.status])}>
          {sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="text-4xl font-bold">
          {sensor.currentValue}
          <span className="text-xl text-muted-foreground">{unit}</span>
        </div>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sensor.data}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`color-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor[sensor.status]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColor[sensor.status]} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor[sensor.status]}
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#color-${sensor.id})`}
              />
               <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/sensors/${sensor.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
