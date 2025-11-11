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
  getDocs,
  where,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
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
  const [checkingSensorId, setCheckingSensorId] = useState(false);
  const [canAddSensor, setCanAddSensor] = useState(false);
  const [limitInfo, setLimitInfo] = useState({ current: 0, max: 0 });
  const [sensorIdStatus, setSensorIdStatus] = useState<{
    valid: boolean;
    message: string;
    type: 'idle' | 'checking' | 'available' | 'unavailable' | 'owned';
  }>({ valid: false, message: '', type: 'idle' });

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

  // Debounced sensor ID validation
  useEffect(() => {
    if (!formData.sensorId || formData.sensorId.length < 3) {
      setSensorIdStatus({ valid: false, message: '', type: 'idle' });
      return;
    }

    const timer = setTimeout(() => {
      validateSensorId(formData.sensorId);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.sensorId]);

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

  const validateSensorId = async (sensorId: string) => {
    if (!user) return;

    setCheckingSensorId(true);
    setSensorIdStatus({ valid: false, message: 'Validerer...', type: 'checking' });

    try {
      // 1. Sjekk om brukeren allerede har denne sensoren
      const userSensorsQuery = query(
        collection(db, "users", user.uid, "sensors"),
        where("sensorId", "==", sensorId)
      );
      const userSensorsSnapshot = await getDocs(userSensorsQuery);

      if (!userSensorsSnapshot.empty) {
        setSensorIdStatus({
          valid: false,
          message: 'Du har allerede registrert denne sensoren',
          type: 'owned'
        });
        setCheckingSensorId(false);
        return;
      }

      // 2. Sjekk available_sensors collection
      const availableSensorRef = doc(db, "available_sensors", sensorId);
      const availableSensorDoc = await getDoc(availableSensorRef);

      if (availableSensorDoc.exists()) {
        const sensorData = availableSensorDoc.data();
        
        if (sensorData.status === 'registered' && sensorData.registeredToUser) {
          // Sensoren er registrert til noen andre
          setSensorIdStatus({
            valid: false,
            message: 'Denne sensoren er allerede registrert til en annen bruker',
            type: 'unavailable'
          });
        } else {
          // Sensoren er tilgjengelig
          setSensorIdStatus({
            valid: true,
            message: 'Sensor-ID er tilgjengelig og kan registreres',
            type: 'available'
          });
        }
      } else {
        // Sensoren finnes ikke i systemet - opprette ny
        setSensorIdStatus({
          valid: true,
          message: 'Ny sensor - vil bli opprettet i systemet',
          type: 'available'
        });
      }
    } catch (error) {
      console.error("Error validating sensor ID:", error);
      setSensorIdStatus({
        valid: false,
        message: 'Kunne ikke validere sensor-ID',
        type: 'idle'
      });
    } finally {
      setCheckingSensorId(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!canAddSensor) {
      toast.error("Du har nådd grensen for antall sensorer i ditt abonnement");
      return;
    }

    if (!sensorIdStatus.valid) {
      toast.error("Vennligst vent til sensor-ID er validert");
      return;
    }

    setLoading(true);
    try {
      // 1. Opprett/oppdater i available_sensors
      const availableSensorRef = doc(db, "available_sensors", formData.sensorId);
      const availableSensorDoc = await getDoc(availableSensorRef);

      if (availableSensorDoc.exists()) {
        // Oppdater eksisterende sensor
        await updateDoc(availableSensorRef, {
          status: "registered",
          registeredToUser: user.uid,
          registeredAt: Timestamp.now(),
          type: formData.type,
          updatedAt: Timestamp.now(),
        });
      } else {
        // Opprett ny sensor i available_sensors
        await setDoc(availableSensorRef, {
          sensorId: formData.sensorId,
          type: formData.type,
          status: "registered",
          registeredToUser: user.uid,
          registeredAt: Timestamp.now(),
          previousOwners: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      // 2. Legg til i brukerens sensor collection
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

      toast.success("Sensor lagt til og registrert!");
      setFormData({
        sensorId: "",
        name: "",
        type: "temp_humidity",
        location: "",
        buildingId: buildingId || "",
      });
      setSensorIdStatus({ valid: false, message: '', type: 'idle' });
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
              
              {/* Sensor ID Validation Status */}
              {sensorIdStatus.type !== 'idle' && (
                <div className="flex items-center gap-2 text-sm">
                  {sensorIdStatus.type === 'checking' && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">{sensorIdStatus.message}</span>
                    </>
                  )}
                  {sensorIdStatus.type === 'available' && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">{sensorIdStatus.message}</span>
                    </>
                  )}
                  {(sensorIdStatus.type === 'unavailable' || sensorIdStatus.type === 'owned') && (
                    <>
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">{sensorIdStatus.message}</span>
                    </>
                  )}
                </div>
              )}
              
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
              <Button 
                type="submit" 
                disabled={loading || !sensorIdStatus.valid || checkingSensorId}
              >
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