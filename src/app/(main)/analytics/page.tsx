import AnalyticsClient from "@/components/analytics/AnalyticsClient";
import { mockAlerts, mockSensors } from "@/lib/data";

export default function AnalyticsPage() {
  // In a real app, you would fetch this data from your API
  const sensors = mockSensors;
  const alerts = mockAlerts;

  return <AnalyticsClient sensors={sensors} alerts={alerts} />;
}
