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
import { nb } from 'date-fns/locale';
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
      console.log("❌ No user logged in");
      setLoading(false);
      return;
    }

    console.log("✅ User logged in:", user.uid);
    console.log("📡 Setting up Firestore listeners...");
    setLoading(true);

    // Real-time listener for sensors
    const sensorsQuery = query(
      collection(db, "users", user.uid, "sensors")
    );

    const unsubscribeSensors = onSnapshot(
      sensorsQuery, 
      (snapshot) => {
        console.log("📊 Sensors snapshot received");
        console.log("   Documents:", snapshot.docs.length);
        
        const sensorsData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log("   Sensor:", doc.id, data);
          
          return {
            id: doc.id,
            ...data
          };
        }) as Sensor[];
        
        console.log("✅ Sensors loaded:", sensorsData.length);
        setSensors(sensorsData);
        setLoading(false);
      }, 
      (error) => {
        console.error("❌ Error fetching sensors:", error);
        console.error("   Code:", error.code);
        console.error("   Message:", error.message);
        setLoading(false);
      }
    );

    // Real-time listener for alerts
    const alertsQuery = query(
      collection(db, "users", user.uid, "alerts"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribeAlerts = onSnapshot(
      alertsQuery, 
      (snapshot) => {
        console.log("🔔 Alerts snapshot received");
        console.log("   Documents:", snapshot.docs.length);
        
        const alertsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Alert[];
        
        console.log("✅ Alerts loaded:", alertsData.length);
        setAlerts(alertsData);
      }, 
      (error) => {
        console.error("❌ Error fetching alerts:", error);
      }
    );

    return () => {
      console.log("🔌 Unsubscribing from Firestore listeners");
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

  const translateAlertType = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'Kritisk';
      case 'warning': return 'Advarsel';
      case 'battery': return 'Batteri';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Laster sensorer...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Vennligst logg inn for å se dashbordet.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full space-y-6">
      {/* Stats Grid - Responsive: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Totalt antall sensorer" 
          value={totalSensors} 
          icon={Zap} 
        />
        <StatCard 
          title="Sensorer online" 
          value={onlineSensors} 
          icon={ShieldCheck} 
          description={totalSensors > 0 ? `${Math.round((onlineSensors / totalSensors) * 100)}% oppetid` : 'Ingen sensorer'} 
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
          description="Fra temperatursensorer" 
        />
      </div>

      {/* Main Content Grid - Responsive layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sensors Section - Takes 2/3 on large screens */}
        <div className="xl:col-span-2 space-y-6">
          {sensors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sensors.map((sensor) => (
                <SensorCard key={sensor.id} sensor={sensor} />
              ))}
            </div>
          ) : (
            <Card className="flex items-center justify-center h-64">
              <CardContent className="text-center text-muted-foreground p-6">
                <p className="font-semibold">Ingen sensorer funnet.</p>
                <p className="text-sm">Legg til din første sensor for å komme i gang.</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Alerts Section - Takes 1/3 on large screens, full width on smaller */}
        <div className="xl:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-headline">Siste varsler</CardTitle>
              <CardDescription>Logg over nylige systemvarsler.</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => {
                    let alertDate: Date;
                    try {
                      alertDate = alert.timestamp?.toDate ? alert.timestamp.toDate() : new Date(alert.timestamp as any);
                    } catch (error) {
                      alertDate = new Date();
                    }
                    return (
                      <div 
                        key={alert.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <Badge variant={getAlertBadgeVariant(alert.type)} className="mt-0.5">
                          {translateAlertType(alert.type)}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-none mb-1">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(alertDate, { addSuffix: true, locale: nb })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Ingen varsler ennå.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
