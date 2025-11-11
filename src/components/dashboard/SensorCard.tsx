// Filsti: src/components/dashboard/SensorCard.tsx

"use client";

import { useState } from "react";
import { Sensor } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Thermometer, 
  Wifi, 
  Battery, 
  MapPin, 
  MoreVertical, 
  Trash2,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface SensorCardProps {
  sensor: Sensor;
}

export default function SensorCard({ sensor }: SensorCardProps) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ok":
        return "default";
      case "warning":
        return "secondary";
      case "critical":
        return "destructive";
      case "offline":
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      case "offline":
      case "pending":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-600";
    if (level > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const handleDeleteSensor = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "users", user.uid, "sensors", sensor.id));
      toast.success(`${sensor.name} er fjernet`);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting sensor:", error);
      toast.error("Kunne ikke fjerne sensor");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{sensor.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(sensor.status)}>
              {sensor.status === "ok" && "Normal"}
              {sensor.status === "warning" && "Advarsel"}
              {sensor.status === "critical" && "Kritisk"}
              {sensor.status === "offline" && "Offline"}
              {sensor.status === "pending" && "Venter"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/sensors/${sensor.id}`}>
                    Vis detaljer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Fjern sensor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Value */}
        <div className="text-center py-4 border rounded-lg bg-muted/50">
          <div className={cn("text-4xl font-bold", getStatusColor(sensor.status))}>
            {sensor.currentValue} {sensor.unit}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Nåværende verdi</div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          {sensor.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Plassering:</span>
              <span className="font-medium">{sensor.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Battery className={cn("h-4 w-4", getBatteryColor(sensor.batteryLevel))} />
            <span className="text-muted-foreground">Batteri:</span>
            <span className={cn("font-medium", getBatteryColor(sensor.batteryLevel))}>
              {sensor.batteryLevel}%
            </span>
          </div>

          {sensor.signalStrength !== undefined && (
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Signal:</span>
              <span className="font-medium">{sensor.signalStrength}%</span>
            </div>
          )}

          {sensor.lastCommunication && (
            <div className="text-xs text-muted-foreground">
              Sist oppdatert:{" "}
              {format(
                sensor.lastCommunication.toDate(),
                "d. MMM yyyy HH:mm",
                { locale: nb }
              )}
            </div>
          )}
        </div>

        {/* Thresholds */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">Terskler:</div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              ⚠️ {sensor.thresholds.warning}
            </Badge>
            <Badge variant="destructive" className="text-xs">
              🔴 {sensor.thresholds.critical}
            </Badge>
          </div>
        </div>

        {/* View Details Button */}
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/sensors/${sensor.id}`}>
            Se detaljer
          </Link>
        </Button>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fjern sensor?</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil fjerne <strong>{sensor.name}</strong>? 
              Dette vil permanent slette all historikk og data for denne sensoren.
              <br /><br />
              <span className="text-destructive font-medium">
                Denne handlingen kan ikke angres.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSensor}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fjern sensor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}