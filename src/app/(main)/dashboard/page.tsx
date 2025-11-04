import { mockAlerts, mockSensors } from "@/lib/data";
import { AlertTriangle, ShieldCheck, Thermometer, Zap } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import SensorCard from "@/components/dashboard/SensorCard";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const totalSensors = mockSensors.length;
  const normalSensors = mockSensors.filter(s => s.status === 'normal').length;
  const criticalAlerts = mockAlerts.filter(a => a.type === 'critical').length;
  
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sensors" value={totalSensors} icon={Zap} />
        <StatCard title="Sensors Online" value={normalSensors} icon={ShieldCheck} description={`${Math.round((normalSensors / totalSensors) * 100)}% uptime`} />
        <StatCard title="Critical Alerts" value={criticalAlerts} icon={AlertTriangle} variant="destructive" />
        <StatCard title="Avg. Temperature" value="78.2°C" icon={Thermometer} description="Across all temp sensors" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
            {mockSensors.map((sensor) => (
                <SensorCard key={sensor.id} sensor={sensor} />
            ))}
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Recent Alerts</CardTitle>
                <CardDescription>A log of the most recent system alerts.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sensor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockAlerts.slice(0, 5).map(alert => (
                             <TableRow key={alert.id}>
                                <TableCell className="font-medium">{alert.sensorName}</TableCell>
                                <TableCell>
                                    <Badge variant={alert.type === 'critical' ? 'destructive' : 'default'} className={alert.type === 'warning' ? 'bg-accent text-accent-foreground' : ''}>{alert.type}</Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-xs">{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
