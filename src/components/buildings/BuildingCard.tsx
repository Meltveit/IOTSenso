// components/buildings/BuildingCard.tsx
"use client";

import { Building, Sensor } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Building2, 
  Factory, 
  Mountain, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle,
  WifiOff 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BuildingCardProps {
  building: Building;
  sensors: Sensor[];
}

const buildingIcons = {
  residential: Home,
  commercial: Building2,
  industrial: Factory,
  cabin: Mountain,
  other: Home
};

function getBuildingStatus(sensors: Sensor[]): { variant: "default" | "destructive" | "secondary" | "outline", text: string } {
  if (sensors.length === 0) {
    return { variant: "outline", text: 'Ingen sensorer' };
  }
  if (sensors.some(s => s.status === 'critical')) {
    return { variant: 'destructive', text: 'Kritisk' };
  }
  if (sensors.some(s => s.status === 'warning')) {
    return { variant: 'secondary', text: 'Advarsel' };
  }
  if (sensors.some(s => s.status === 'offline')) {
    return { variant: 'secondary', text: 'Frakoblet' };
  }
  return { variant: 'default', text: 'Normal' };
}

export default function BuildingCard({ building, sensors }: BuildingCardProps) {
  const Icon = buildingIcons[building.type || 'residential'];
  const status = getBuildingStatus(sensors);
  
  const activeCount = sensors.filter(s => s.status === 'ok').length;
  const warningCount = sensors.filter(s => s.status === 'warning').length;
  const criticalCount = sensors.filter(s => s.status === 'critical').length;
  const offlineCount = sensors.filter(s => s.status === 'offline').length;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Icon className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-headline">{building.name}</h3>
              {building.address && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{building.address.street}, {building.address.city}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant={status.variant}>
            {status.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statistikk */}
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center p-3 bg-green-500/10 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
            <span className="text-2xl font-bold">{activeCount}</span>
            <span className="text-xs text-muted-foreground">Aktive</span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-yellow-500/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mb-1" />
            <span className="text-2xl font-bold">{warningCount}</span>
            <span className="text-xs text-muted-foreground">Advarsel</span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-red-500/10 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 mb-1" />
            <span className="text-2xl font-bold">{criticalCount}</span>
            <span className="text-xs text-muted-foreground">Kritisk</span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-gray-500/10 rounded-lg">
            <WifiOff className="h-5 w-5 text-gray-500 mb-1" />
            <span className="text-2xl font-bold">{offlineCount}</span>
            <span className="text-xs text-muted-foreground">Frakoblet</span>
          </div>
        </div>

        {/* Sensor-liste (kompakt) */}
        <div className="space-y-2">
          {sensors.slice(0, 3).map(sensor => (
            <div 
              key={sensor.id} 
              className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", {
                  'bg-green-500': sensor.status === 'ok',
                  'bg-yellow-500': sensor.status === 'warning',
                  'bg-red-500': sensor.status === 'critical',
                  'bg-gray-500': sensor.status === 'offline' || sensor.status === 'pending',
                })} />
                <span className="text-sm font-medium">{sensor.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {sensor.currentValue} {sensor.unit}
              </span>
            </div>
          ))}
          
          {sensors.length > 3 && (
            <p className="text-xs text-center text-muted-foreground">
              + {sensors.length - 3} flere sensorer
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/buildings/${building.id}`}>
            Se detaljer
          </Link>
        </Button>
        <Button className="flex-1" asChild>
          <Link href={`/sensors?buildingId=${building.id}`}>
            Administrer sensorer
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
