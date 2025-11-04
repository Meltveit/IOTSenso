import SensorsClient from "@/components/sensors/SensorsClient";
import { mockSensors } from "@/lib/data";

export default function SensorsPage() {
    // In a real app, you would fetch this data from your API
    const sensors = mockSensors;

    return <SensorsClient sensors={sensors} />;
}
