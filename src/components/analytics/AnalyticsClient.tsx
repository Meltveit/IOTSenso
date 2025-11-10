"use client";

import type { Alert, Sensor } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { subDays, format } from "date-fns";
import { nb } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatCard from "../dashboard/StatCard";
import { AlertTriangle, Bell, ShieldCheck } from "lucide-react";

type AnalyticsClientProps = {
  sensors: Sensor[];
  alerts: Alert[];
};

const chartConfig = {
  alerts: {
    label: "Varsler",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function AnalyticsClient({
  sensors,
  alerts,
}: AnalyticsClientProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) =>
    subDays(new Date(), i)
  ).reverse();
  
  const alertData = last7Days.map((day) => ({
    date: format(day, "MMM d", { locale: nb }),
    alerts: alerts.filter(
      (alert) =>
        alert.timestamp && format(alert.timestamp.toDate(), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    ).length,
  }));

  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter((a) => a.type === "critical").length;
  const warningAlerts = alerts.filter((a) => a.type === "warning").length;

  return (
    <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Totalt antall varsler (siste 7 dager)" value={totalAlerts} icon={Bell} />
            <StatCard title="Antall advarsler" value={warningAlerts} icon={ShieldCheck} />
            <StatCard title="Kritiske varsler" value={criticalAlerts} icon={AlertTriangle} variant="destructive" />
        </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline">Varsler over tid</CardTitle>
              <CardDescription>
                Antall varsler utløst per dag.
              </CardDescription>
            </div>
            <Select defaultValue="7">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Velg tidsperiode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Siste 7 dager</SelectItem>
                <SelectItem value="30">Siste 30 dager</SelectItem>
                <SelectItem value="90">Siste 90 dager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ChartContainer config={chartConfig}>
              <BarChart data={alertData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="alerts" fill="var(--color-alerts)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
