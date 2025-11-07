"use client";

import type { Sensor } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Thermometer, Droplets, Weight, Ruler, CircleGauge, Clock, WifiOff } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const ICONS = {
  temperature: Thermometer,
  moisture: Droplets,
  weight: Weight,
  ir: Ruler,
  flow: CircleGauge,
};

type SensorCardProps = {
  sensor: Sensor;
};

export default function SensorCard({ sensor }: SensorCardProps) {
  const Icon = ICONS[sensor.type] || Thermometer;
  
  const statusColors = {
    ok: "bg-green-500/20 text-green-700 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    warning: "bg-orange-500/20 text-orange-700 border-orange-500/30",
    critical: "bg-red-500/20 text-red-700 border-red-500/30",
    offline: "bg-gray-500/20 text-gray-600 border-gray-500/30",
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok': return 'OK';
      case 'pending': return 'Venter på data';
      case 'warning': return 'Advarsel';
      case 'critical': return 'Kritisk';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  const getLastCommunication = () => {
    if (!sensor.lastCommunication) {
      return 'Aldri';
    }
    try {
      // Handle Firestore Timestamp
      const date = sensor.lastCommunication.toDate ? 
        sensor.lastCommunication.toDate() : 
        new Date(sensor.lastCommunication as any);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Ukjent';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="grid gap-1">
          <CardTitle className="flex items-center gap-2 font-headline text-lg">
            <Icon className="h-5 w-5 text-muted-foreground" />
            {sensor.name}
          </CardTitle>
          {sensor.location && (
            <CardDescription className="text-sm">{sensor.location}</CardDescription>
          )}
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-xs font-medium", statusColors[sensor.status])}
        >
          {getStatusText(sensor.status)}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-3">
        {sensor.status === 'pending' ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">Venter på første melding...</p>
          </div>
        ) : sensor.status === 'offline' ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <WifiOff className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">Ingen kommunikasjon</p>
            <p className="text-xs text-muted-foreground mt-1">{getLastCommunication()}</p>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold">
                {sensor.currentValue.toFixed(1)}
              </div>
              <span className="text-xl text-muted-foreground">{sensor.unit}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Batteri</p>
                <p className="font-medium">{sensor.batteryLevel}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Sist oppdatert</p>
                <p className="font-medium text-xs">{getLastCommunication()}</p>
              </div>
            </div>

            {/* Threshold indicators */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Terskler:</span>
                <div className="flex gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded",
                    sensor.currentValue >= sensor.thresholds.warning 
                      ? "bg-orange-500/20 text-orange-700" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    ⚠ {sensor.thresholds.warning}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded",
                    sensor.currentValue >= sensor.thresholds.critical 
                      ? "bg-red-500/20 text-red-700" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    🔴 {sensor.thresholds.critical}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/sensors/${sensor.id}`}>
            Se detaljer <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}