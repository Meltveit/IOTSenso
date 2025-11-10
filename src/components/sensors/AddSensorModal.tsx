// Filsti: src/components/sensors/AddSensorModal.tsx

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  SensorType, 
  SENSOR_TYPE_LABELS, 
  SENSOR_TYPE_DESCRIPTIONS, 
  SENSOR_UNITS 
} from "@/lib/types";
import { 
  addDoc, 
  collection, 
  Timestamp, 
  doc, 
  getDoc, 
  query, 
  getDocs 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface AddSensorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildingId?: string;
}

export default function AddSensorModal({
  open,
  onOpenChange,
  buildingId,
}: AddSensorModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [canAddSensor, setCanAddSensor] = useState(false);
  const [limitInfo, setLimitInfo] = useState({ current: 0, max: 0 });

  const [formData, setFormData] = useState({
    sensorId: "",
    name: "",
    type: "temp_humidity" as SensorType,
    location: "",
    buildingId: buildingId || "",
  });

  useEffect(() => {
    if (open && user) {
      checkSensorLimit();
    }
  }, [open, user]);

  const checkSensorLimit = async () => {
    if (!user) return;

    setCheckingLimit(true);
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const maxSensors = userData?.numberOfSensors || 0;
      const hasActiveSubscription = userData?.subscriptionStatus === "active";

      const sensorsQuery = query(collection(db, "users", user.uid, "sensors"));
      const sensorsSnapshot = await getDocs(sensorsQuery);
      const currentSensors = sensorsSnapshot.size;

      setLimitInfo({ current: currentSensors, max: maxSensors });

      if (!hasActiveSubscription) {
        setCanAddSensor(false);
      } else if (currentSensors >= maxSensors) {
        setCanAddSensor(false);
      } else {
        setCanAddSensor(true);
      }
    } catch (error) {
      console.error("Error checking sensor limit:", error);
      toast.error("Kunne ikke verifisere sensorgrense");
    } finally {
      setCheckingLimit(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!canAddSensor) {
      toast.error("Du har nådd grensen for antall sensorer i ditt abonnement");
      return;
    }

    setLoading(true);
    try {
      const sensorData = {
        userId: user.uid,
        sensorId: formData.sensorId,
        name: formData.name,
        type: formData.type,
        location: formData.location,
        buildingId: formData.buildingId || null,
        status: "pending" as const,
        currentValue: 0,
        unit: SENSOR_UNITS[formData.type][0],
        batteryLevel: 100,
        signalStrength: 0,
        lastCommunication: null,
        thresholds: {
          warning: 50,
          critical: 80,
        },
        alertMethods: ["email"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const sensorsRef = collection(db, "users", user.uid, "sensors");
      await addDoc(sensorsRef, sensorData);

      toast.success("Sensor lagt til!");
      setFormData({
        sensorId: "",
        name: "",
        type: "temp_humidity",
        location: "",
        buildingId: buildingId || "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding sensor:", error);
      toast.error("Kunne ikke legge til sensor");
    } finally {
      setLoading(false);
    }
  };

  const availableSlots = limitInfo.max - limitInfo.current;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Legg til ny sensor</DialogTitle>
          <DialogDescription>
            Registrer en ny sensor for overvåking
          </DialogDescription>
        </DialogHeader>

        {checkingLimit ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !canAddSensor ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Kan ikke legge til sensor</AlertTitle>
              <AlertDescription>
                {limitInfo.max === 0 ? (
                  <>
                    Du har ikke et aktivt abonnement. Opprett et abonnement først for å legge til sensorer.
                  </>
                ) : (
                  <>
                    Du har brukt alle {limitInfo.max} sensorplasser i ditt abonnement ({limitInfo.current}/{limitInfo.max}).
                    Oppgrader abonnementet ditt for å legge til flere sensorer.
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Avbryt
              </Button>
              <Button asChild>
                <Link href="/settings">
                  {limitInfo.max === 0 ? "Opprett abonnement" : "Oppgrader abonnement"}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert>
              <AlertDescription>
                Du har {availableSlots} ledig{availableSlots !== 1 ? 'e' : ''} sensorplass{availableSlots !== 1 ? 'er' : ''} ({limitInfo.current}/{limitInfo.max} brukt)
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="sensorId">Sensor-ID *</Label>
              <Input
                id="sensorId"
                placeholder="F.eks. SG-001"
                value={formData.sensorId}
                onChange={(e) =>
                  setFormData({ ...formData, sensorId: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Unik identifikator for sensoren (finnes på sensoren)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Sensornavn *</Label>
              <Input
                id="name"
                placeholder="F.eks. Stue sensor"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Sensortype *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: SensorType) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temp_humidity">
                    <div className="py-2">
                      <div className="font-medium">{SENSOR_TYPE_LABELS.temp_humidity}</div>
                      <div className="text-xs text-muted-foreground">
                        {SENSOR_TYPE_DESCRIPTIONS.temp_humidity}
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="water_weight">
                    <div className="py-2">
                      <div className="font-medium">{SENSOR_TYPE_LABELS.water_weight}</div>
                      <div className="text-xs text-muted-foreground">
                        {SENSOR_TYPE_DESCRIPTIONS.water_weight}
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="weight_temp">
                    <div className="py-2">
                      <div className="font-medium">{SENSOR_TYPE_LABELS.weight_temp}</div>
                      <div className="text-xs text-muted-foreground">
                        {SENSOR_TYPE_DESCRIPTIONS.weight_temp}
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Plassering (valgfritt)</Label>
              <Input
                id="location"
                placeholder="F.eks. Soverom"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Legg til sensor
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}