// Filsti: src/components/dashboard/SensorCard.tsx

"use client";

import { useState } from "react";
import { Sensor, SENSOR_TYPE_LABELS } from "@/lib/types";
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
  Loader2,
  Link2Off
} from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { doc, deleteDoc, updateDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface SensorCardProps {
  sensor: Sensor;
}

export default function SensorCard({ sensor }: SensorCardProps) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRemoveFromBuildingDialog, setShowRemoveFromBuildingDialog] = useState(false);
  const [removingFromBuilding, setRemovingFromBuilding] = useState(false);

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
      // 1. Fjern sensoren fra brukerens collection
      await deleteDoc(doc(db, "users", user.uid, "sensors", sensor.id));

      // 2. Oppdater available_sensors - gjør sensoren tilgjengelig igjen
      const availableSensorRef = doc(db, "available_sensors", sensor.sensorId);
      const availableSensorDoc = await getDoc(availableSensorRef);

      if (availableSensorDoc.exists()) {
        const currentData = availableSensorDoc.data();
        
        // Legg til i previousOwners hvis det ikke allerede finnes
        const previousOwners = currentData.previousOwners || [];
        if (currentData.registeredToUser === user.uid) {
          previousOwners.push({
            userId: user.uid,
            registeredAt: currentData.registeredAt,
            unregisteredAt: Timestamp.now(),
          });
        }

        // Oppdater til available status
        await updateDoc(availableSensorRef, {
          status: "available",
          registeredToUser: null,
          registeredAt: null,
          previousOwners,
          updatedAt: Timestamp.now(),
        });
      }

      toast.success(
        `${sensor.name} er fjernet. Sensor-ID "${sensor.sensorId}" kan nå registreres på nytt.`,
        { duration: 5000 }
      );
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting sensor:", error);
      toast.error("Kunne ikke fjerne sensor");
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveFromBuilding = async () => {
    if (!user) return;

    setRemovingFromBuilding(true);
    try {
      const sensorRef = doc(db, "users", user.uid, "sensors", sensor.id);
      await updateDoc(sensorRef, {
        buildingId: null,
        updatedAt: Timestamp.now(),
      });

      toast.success(`${sensor.name} er fjernet fra bygningen`);
      setShowRemoveFromBuildingDialog(false);
    } catch (error) {
      console.error("Error removing sensor from building:", error);
      toast.error("Kunne ikke fjerne sensor fra bygning");
    } finally {
      setRemovingFromBuilding(false);
    }
  };

  const sensorTypeLabel = SENSOR_TYPE_LABELS[sensor.type] || sensor.type;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">{sensor.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{sensorTypeLabel}</p>
              </div>
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
                  {sensor.buildingId && (
                    <DropdownMenuItem
                      onClick={() => setShowRemoveFromBuildingDialog(true)}
                    >
                      <Link2Off className="mr-2 h-4 w-4" />
                      Fjern fra bygning
                    </DropdownMenuItem>
                  )}
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
            {sensor.humidityValue !== undefined && sensor.type === 'temp_humidity' && (
              <div className="text-2xl font-semibold text-muted-foreground mt-2">
                {sensor.humidityValue}%
              </div>
            )}
            <div className="text-sm text-muted-foreground mt-1">
              {sensor.type === 'temp_humidity' && sensor.humidityValue !== undefined
                ? 'Temperatur / Fuktighet'
                : 'Nåværende verdi'}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Sensor-ID:</span>
              <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                {sensor.sensorId}
              </code>
            </div>

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
              <div className="text-xs text-muted-foreground mt-2">
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
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fjern sensor fra din konto?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Er du sikker på at du vil fjerne <strong>{sensor.name}</strong>?
              </p>
              <div className="p-2 bg-muted rounded border">
                <p className="text-xs text-muted-foreground">Sensor-ID:</p>
                <code className="text-sm font-mono">{sensor.sensorId}</code>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  ℹ️ Viktig informasjon:
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1 list-disc list-inside">
                  <li>All historikk og data for denne sensoren vil bli slettet</li>
                  <li>Sensor-IDen blir tilgjengelig for re-registrering</li>
                  <li>Du kan legge til samme sensor igjen senere</li>
                  <li>Sensoren kan også selges/overføres til andre brukere</li>
                </ul>
              </div>
              
              <p className="text-destructive font-medium text-sm">
                ⚠️ Denne handlingen kan ikke angres. Data vil bli permanent slettet.
              </p>
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

      {/* Remove from Building Confirmation Dialog */}
      <AlertDialog open={showRemoveFromBuildingDialog} onOpenChange={setShowRemoveFromBuildingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fjern sensor fra bygning?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Er du sikker på at du vil fjerne <strong>{sensor.name}</strong> fra bygningen?
              </p>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  ℹ️ Dette vil skje:
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1 list-disc list-inside">
                  <li>Sensoren blir fjernet fra bygningen</li>
                  <li>All sensordata og historikk blir bevart</li>
                  <li>Du kan knytte sensoren til en annen bygning senere</li>
                  <li>Sensoren vil fortsatt være synlig under "Dine sensorer"</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removingFromBuilding}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFromBuilding}
              disabled={removingFromBuilding}
            >
              {removingFromBuilding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fjern fra bygning
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}