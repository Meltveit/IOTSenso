import AnalyticsClient from "@/components/analytics/AnalyticsClient";
import type { Sensor, Alert } from "@/lib/types";

export default function AnalyticsPage() {
  // In a real app, you would fetch this data from your API
  const sensors: Sensor[] = [];
  const alerts: Alert[] = [];

  return <AnalyticsClient sensors={sensors} alerts={alerts} />;
}
