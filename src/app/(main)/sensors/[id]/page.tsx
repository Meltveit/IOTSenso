import SensorDetailsClient from "@/components/sensors/SensorDetailsClient";
import { notFound } from "next/navigation";
import type { Sensor } from "@/lib/types";

export default function SensorDetailPage({ params }: { params: { id: string } }) {
  // In a real app, you'd fetch this from your database
  const sensors: Sensor[] = [];
  const sensor = sensors.find((s) => s.id === params.id);

  if (!sensor) {
    // For now, we can create a dummy sensor to avoid a 404, 
    // until we connect to a real database.
    const dummySensor: Sensor = {
        id: params.id,
        name: 'Sensor Not Found',
        type: 'temperature',
        location: 'Unknown',
        status: 'normal',
        thresholds: { warning: 0, critical: 0 },
        currentValue: 0,
        data: [],
        equipmentType: 'Unknown'
    };
    return <SensorDetailsClient sensor={dummySensor} />;
  }

  return <SensorDetailsClient sensor={sensor} />;
}
