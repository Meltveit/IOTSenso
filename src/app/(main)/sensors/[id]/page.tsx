import { mockSensors } from "@/lib/data";
import SensorDetailsClient from "@/components/sensors/SensorDetailsClient";
import { notFound } from "next/navigation";

export default function SensorDetailPage({ params }: { params: { id: string } }) {
  // In a real app, you'd fetch this from your database
  const sensor = mockSensors.find((s) => s.id === params.id);

  if (!sensor) {
    notFound();
  }

  return <SensorDetailsClient sensor={sensor} />;
}
