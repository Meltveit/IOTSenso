// app/(main)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ShieldCheck, Thermometer, Zap, Loader2 } from "lucide-react";
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
import type { Sensor, Alert } from "@/lib/types";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Real-time listener for sensors
    const sensorsQuery = query(
      collection(db, "users", user.uid, "sensors")
    );

    const unsubscribeSensors = onSnapshot(sensorsQuery, (snapshot) => {
      const sensorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sensor[];
      setSensors(sensorsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sensors:", error);
      setLoading(false);
    });

    // Real-time listener for alerts
    const alertsQuery = query(
      collection(db, "users", user.uid, "alerts"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribeAlerts = onSnapshot(alertsQuery, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Alert[];
      setAlerts(alertsData);
    }, (error) => {
      console.error("Error fetching alerts:", error);
    });

    return () => {
      unsubscribeSensors();
      unsubscribeAlerts();
    };
  }, [user]);
  
  const totalSensors = sensors.length;
  const onlineSensors = sensors.filter(s => s.status === 'ok' || s.status === 'warning').length;
  const criticalAlerts = alerts.filter(a => a.type === 'critical').length;
  
  // Calculate average temperature from temperature sensors
  const tempSensors = sensors.filter(s => s.type === 'temperature');
  const avgTemp = tempSensors.length > 0
    ? (tempSensors.reduce((sum, s) => sum + s.currentValue, 0) / tempSensors.length).toFixed(1)
    : '--';

  const getAlertBadgeVariant = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'battery': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Vennligst logg inn for å se dashboard</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Totalt sensorer" 
          value={totalSensors} 
          icon={Zap} 
        />
        <StatCard 
          title="Sensorer online" 
          value={onlineSensors} 
          icon={ShieldCheck} 
          description={totalSensors > 0 ? `${Math.round((onlineSensors / totalSensors) * 100)}% uptime` : 'N/A'} 
        />
        <StatCard 
          title="Kritiske varsler" 
          value={criticalAlerts} 
          icon={AlertTriangle} 
          variant="destructive" 
        />
        <StatCard 
          title="Gj.snitt temp" 
          value={`${avgTemp}°C`} 
          icon={Thermometer} 
          description="På tvers av temp-sensorer" 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
            {sensors.length > 0 ? (
              sensors.map((sensor) => (
                <SensorCard key={sensor.id} sensor={sensor} />
              ))
            ) : (
              <Card className="md:col-span-2 flex items-center justify-center h-64">
                <CardContent className="text-center text-muted-foreground p-6">
                  <p className="font-semibold">Ingen sensorer funnet.</p>
                  <p className="text-sm">Legg til en sensor for å begynne overvåking.</p>
                </CardContent>
              </Card>
            )}
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Siste varsler</CardTitle>
                <CardDescription>Logg over nylige systemvarsler.</CardDescription>
            </CardHeader>
            <CardContent>
                {alerts.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Melding</TableHead>
                                <TableHead>Tid</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts.map((alert) => (
                                <TableRow key={alert.id}>
                                    <TableCell>
                                        <Badge variant={getAlertBadgeVariant(alert.type)}>
                                            {alert.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{alert.message}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDistanceToNow(alert.timestamp.toDate(), { addSuffix: true })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">
                        Ingen varsler ennå.
                    </p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}