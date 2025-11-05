"use client";

import type { Building, Sensor } from "@/lib/types";
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

function getBuildingStatus(sensors: Sensor[]): 'critical' | 'warning' | 'offline' | 'ok' {
    if (sensors.some(s => s.status === 'critical')) return 'critical';
    if (sensors.some(s => s.status === 'warning')) return 'warning';
    if (sensors.some(s => s.status === 'offline')) return 'offline';
    return 'ok';
}

const statusConfig = {
    critical: {
        badgeVariant: 'destructive',
        icon: AlertCircle,
        textColor: 'text-red-500',
        bgColor: 'bg-red-500/10',
    },
    warning: {
        badgeVariant: 'warning',
        icon: AlertTriangle,
        textColor: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
    },
    ok: {
        badgeVariant: 'success',
        icon: CheckCircle,
        textColor: 'text-green-500',
        bgColor: 'bg-green-500/10',
    },
    offline: {
        badgeVariant: 'secondary',
        icon: WifiOff,
        textColor: 'text-gray-500',
        bgColor: 'bg-gray-500/10',
    }
}


export default function BuildingCard({ building, sensors }: BuildingCardProps) {
  const Icon = buildingIcons[building.type || 'residential'];
  const status = getBuildingStatus(sensors);
  
  const okCount = sensors.filter(s => s.status === 'ok').length;
  const warningCount = sensors.filter(s => s.status === 'warning').length;
  const criticalCount = sensors.filter(s => s.status === 'critical').length;
  const offlineCount = sensors.filter(s => s.status === 'offline').length;

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-headline">{building.name}</h3>
              {building.address && building.address.city && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{building.address.street}, {building.address.city}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant={statusConfig[status].badgeVariant}>
            {sensors.length} {sensors.length === 1 ? 'sensor' : 'sensorer'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow">
        <div className="grid grid-cols-4 gap-2 text-center">
            <div className={cn("flex flex-col items-center p-2 rounded-lg", statusConfig.ok.bgColor)}>
                <statusConfig.ok.icon className={cn("h-5 w-5 mb-1", statusConfig.ok.textColor)} />
                <span className="text-xl font-bold">{okCount}</span>
                <span className="text-xs text-muted-foreground">OK</span>
            </div>
            <div className={cn("flex flex-col items-center p-2 rounded-lg", statusConfig.warning.bgColor)}>
                <statusConfig.warning.icon className={cn("h-5 w-5 mb-1", statusConfig.warning.textColor)} />
                <span className="text-xl font-bold">{warningCount}</span>
                <span className="text-xs text-muted-foreground">Advarsel</span>
            </div>
            <div className={cn("flex flex-col items-center p-2 rounded-lg", statusConfig.critical.bgColor)}>
                <statusConfig.critical.icon className={cn("h-5 w-5 mb-1", statusConfig.critical.textColor)} />
                <span className="text-xl font-bold">{criticalCount}</span>
                <span className="text-xs text-muted-foreground">Kritisk</span>
            </div>
            <div className={cn("flex flex-col items-center p-2 rounded-lg", statusConfig.offline.bgColor)}>
                <statusConfig.offline.icon className={cn("h-5 w-5 mb-1", statusConfig.offline.textColor)} />
                <span className="text-xl font-bold">{offlineCount}</span>
                <span className="text-xs text-muted-foreground">Offline</span>
            </div>
        </div>
        
        <div className="space-y-2">
          {sensors.slice(0, 3).map(sensor => (
            <div 
              key={sensor.id} 
              className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", 
                    sensor.status === 'ok' ? 'bg-green-500' :
                    sensor.status === 'warning' ? 'bg-yellow-500' :
                    sensor.status === 'critical' ? 'bg-red-500' : 'bg-gray-500')} 
                />
                <span className="text-sm font-medium">{sensor.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {sensor.currentValue} {sensor.unit}
              </span>
            </div>
          ))}
          
          {sensors.length > 3 && (
            <p className="text-xs text-center text-muted-foreground pt-1">
              + {sensors.length - 3} flere sensorer
            </p>
          )}

           {sensors.length === 0 && (
            <p className="text-xs text-center text-muted-foreground py-4">
              Ingen sensorer lagt til i denne bygningen.
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-4">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/buildings/${building.id}`}>
            Se detaljer
          </Link>
        </Button>
        <Button className="flex-1" asChild>
          <Link href={`/buildings/${building.id}/sensors`}>
            Administrer
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
