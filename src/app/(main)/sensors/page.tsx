import SensorsClient from "@/components/sensors/SensorsClient";
import type { Sensor } from "@/lib/types";

export default function SensorsPage() {
    // In a real app, you would fetch this data from your API
    const sensors: Sensor[] = [];

    return <SensorsClient sensors={sensors} />;
}
