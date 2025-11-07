// components/sensors/AddSensorModal.tsx
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
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Building, Sensor, SensorType } from "@/lib/types";
import { 
  addDoc, 
  collection, 
  Timestamp, 
  query, 
  where, 
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, AlertCircle, Loader2, CheckCircle2, Clock } from "lucide-react";
import AddBuildingModal from "@/components/buildings/AddBuildingModal";

interface AddSensorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSensorAdded?: (sensor: Sensor) => void;
}

export default function AddSensorModal({
  open,
  onOpenChange,
  onSensorAdded
}: AddSensorModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  
  const [formData, setFormData] = useState({
    sensorId: "",
    sensorType: "" as SensorType,
    buildingId: "",
    name: "",
    location: "",
    warningThreshold: 50,
    criticalThreshold: 100,
    alertEmail: true,
    alertSms: false
  });

  useEffect(() => {
    if (open && user) {
      loadBuildings();
    }
  }, [open, user]);

  const loadBuildings = async () => {
    if (!user) return;
    
    try {
      const buildingsQuery = query(collection(db, "users", user.uid, "buildings"));
      const snapshot = await getDocs(buildingsQuery);
      const buildingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Building[];
      setBuildings(buildingsData);
    } catch (error) {
      console.error("Error loading buildings:", error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
        resetForm();
    }, 300);
  }
  
  const verifySensorId = async () => {
    if (!formData.sensorId) {
      toast.error("Vennligst skriv inn Sensor-ID");
      return;
    }

    if (!formData.sensorType) {
      toast.error("Vennligst velg sensortype");
      return;
    }

    setLoading(true);
    try {
      // Check if sensor is already registered to this user
      const sensorsQuery = query(
        collection(db, "users", user?.uid || "", "sensors"),
        where("sensorId", "==", formData.sensorId)
      );
      const existingSensors = await getDocs(sensorsQuery);

      if (!existingSensors.empty) {
        toast.error("Denne sensoren er allerede registrert på din konto.");
        setLoading(false);
        return;
      }

      // Check if sensor is registered to another user
      const allSensorsQuery = query(
        collection(db, "sensors"),
        where("sensorId", "==", formData.sensorId)
      );
      const allSensors = await getDocs(allSensorsQuery);

      if (!allSensors.empty) {
        toast.error("Denne sensor-ID er allerede i bruk av en annen bruker.");
        setLoading(false);
        return;
      }
      
      toast.success("Sensor-ID godkjent!");
      setStep(2);
      
    } catch (error) {
      console.error("Error verifying sensor:", error);
      toast.error("Feil ved verifisering av sensor. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };
  
  const selectBuilding = () => {
    if (!formData.buildingId && formData.buildingId !== "none") {
      toast.error("Vennligst velg en bygning eller velg 'Ingen bygning'");
      return;
    }
    setStep(3);
  };
  
  const setNameAndLocation = () => {
    if (!formData.name) {
      toast.error("Vennligst gi sensoren et navn");
      return;
    }
    setStep(4);
  };

  const activateSensor = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const sensorsCollectionRef = collection(db, "users", user.uid, "sensors");
      const sensorData = {
        sensorId: formData.sensorId,
        userId: user.uid,
        buildingId: formData.buildingId !== "none" ? formData.buildingId : undefined,
        type: formData.sensorType,
        name: formData.name,
        location: formData.location || undefined,
        thresholds: {
          warning: formData.warningThreshold,
          critical: formData.criticalThreshold
        },
        alertMethods: [
          ...(formData.alertEmail ? ['email' as const] : []),
          ...(formData.alertSms ? ['sms' as const] : [])
        ],
        batteryLevel: 0,
        status: 'pending' as const, // NEW: Start as pending
        currentValue: 0,
        unit: getUnitForSensorType(formData.sensorType),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastCommunication: null,
        equipmentType: 'Generic Equipment'
      };

      const sensorRef = await addDoc(sensorsCollectionRef, sensorData);

      // Also add to global sensors collection for cross-user duplicate checking
      await addDoc(collection(db, "sensors"), {
        sensorId: formData.sensorId,
        userId: user.uid,
        registeredAt: Timestamp.now()
      });

      // Update building sensor count if applicable
      if (formData.buildingId && formData.buildingId !== "none") {
        const buildingRef = doc(db, "users", user.uid, "buildings", formData.buildingId);
        const building = buildings.find(b => b.id === formData.buildingId);
        if (building) {
          await updateDoc(buildingRef, {
            sensorCount: building.sensorCount + 1,
            updatedAt: Timestamp.now()
          });
        }
      }

      toast.success(
        `${formData.name} er lagt til!`, 
        {
          description: "Sensoren venter på første melding fra enheten. Status vil oppdateres automatisk når data mottas.",
          duration: 5000
        }
      );
      
      const newSensor: Sensor = {
        id: sensorRef.id,
        ...sensorData,
      };

      if (onSensorAdded) {
        onSensorAdded(newSensor);
      }

      handleClose();
      
    } catch (error) {
      console.error("Error activating sensor:", error);
      toast.error("Kunne ikke aktivere sensor. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      sensorId: "",
      sensorType: "" as SensorType,
      buildingId: "",
      name: "",
      location: "",
      warningThreshold: 50,
      criticalThreshold: 100,
      alertEmail: true,
      alertSms: false
    });
  };

  const getUnitForSensorType = (type: SensorType): string => {
    switch (type) {
      case 'weight': return 'kg';
      case 'ir': return 'cm';
      case 'moisture': return '%';
      case 'flow': return 'l/min';
      case 'temperature': return '°C';
      default: return '';
    }
  };

  const getSensorTypeName = (type: SensorType): string => {
    switch (type) {
      case 'weight': return 'Vektsensor';
      case 'ir': return 'Avstandssensor (IR)';
      case 'moisture': return 'Fuktsensor';
      case 'flow': return 'Flowsensor';
      case 'temperature': return 'Temperatursensor';
      default: return 'Ukjent type';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Legg til ny sensor</DialogTitle>
            <DialogDescription>
              Steg {step} av 4
            </DialogDescription>
            <Progress value={(step / 4) * 100} className="h-2" />
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4 pt-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-sm text-primary/90">
                    <p className="font-semibold mb-1">Finn Sensor-ID</p>
                    <p>Sensor-ID står på etiketten på sensoren eller i dokumentasjonen. Dette kan være DevEUI, MAC-adresse eller annen unik identifikator.</p>
                    <p className="mt-2 text-xs">Eksempel: BC9740FFFE10D33A eller SG-2024-001234</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sensorId">Sensor-ID *</Label>
                <Input
                  id="sensorId"
                  placeholder="F.eks. BC9740FFFE10D33A"
                  value={formData.sensorId}
                  onChange={(e) => setFormData({ ...formData, sensorId: e.target.value.toUpperCase().trim() })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sensorType">Sensortype *</Label>
                <Select
                  value={formData.sensorType}
                  onValueChange={(value) => setFormData({ ...formData, sensorType: value as SensorType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg sensortype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temperature">Temperatursensor</SelectItem>
                    <SelectItem value="weight">Vektsensor</SelectItem>
                    <SelectItem value="ir">Avstandssensor (IR)</SelectItem>
                    <SelectItem value="moisture">Fuktsensor</SelectItem>
                    <SelectItem value="flow">Flowsensor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  disabled={loading}
                >
                  Avbryt
                </Button>
                <Button onClick={verifySensorId} disabled={loading || !formData.sensorId || !formData.sensorType}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                  {loading ? "Verifiserer..." : "Neste"}
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Valgt sensortype</p>
                      <p>{getSensorTypeName(formData.sensorType)}</p>
                    </div>
                  </div>
                </div>

                <Label htmlFor="building">Velg bygning *</Label>
                <Select
                  value={formData.buildingId}
                  onValueChange={(value) => setFormData({ ...formData, buildingId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg en bygning" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ingen bygning (sensor uten bygning)</SelectItem>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setShowAddBuildingModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Legg til ny bygning
                </Button>
              </div>

              <DialogFooter className="pt-4">
                <Button onClick={() => setStep(1)} variant="outline" disabled={loading}>
                  Tilbake
                </Button>
                <Button onClick={selectBuilding} disabled={loading}>
                  Neste
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Sensornavn *</Label>
                <Input
                  id="name"
                  placeholder="F.eks. Kjølerom 1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Plassering (valgfritt)</Label>
                <Input
                  id="location"
                  placeholder="F.eks. Kjeller"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={loading}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button onClick={() => setStep(2)} variant="outline" disabled={loading}>
                  Tilbake
                </Button>
                <Button onClick={setNameAndLocation} disabled={loading || !formData.name}>
                  Neste
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 pt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="warning-threshold">
                    Advarselsgrense: {formData.warningThreshold} {getUnitForSensorType(formData.sensorType)}
                  </Label>
                  <Slider
                    id="warning-threshold"
                    min={0}
                    max={200}
                    step={1}
                    value={[formData.warningThreshold]}
                    onValueChange={(value) => setFormData({ ...formData, warningThreshold: value[0] })}
                    className="mt-2"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="critical-threshold">
                    Kritisk grense: {formData.criticalThreshold} {getUnitForSensorType(formData.sensorType)}
                  </Label>
                  <Slider
                    id="critical-threshold"
                    min={0}
                    max={200}
                    step={1}
                    value={[formData.criticalThreshold]}
                    onValueChange={(value) => setFormData({ ...formData, criticalThreshold: value[0] })}
                    className="mt-2"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Varslingsmetoder</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="alert-email"
                      checked={formData.alertEmail}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, alertEmail: checked as boolean })
                      }
                      disabled={loading}
                    />
                    <Label htmlFor="alert-email" className="font-normal cursor-pointer">
                      E-post
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="alert-sms"
                      checked={formData.alertSms}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, alertSms: checked as boolean })
                      }
                      disabled={loading}
                    />
                    <Label htmlFor="alert-sms" className="font-normal cursor-pointer">
                      SMS
                    </Label>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <Clock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-900">
                      <p className="font-semibold mb-1">Venter på første melding</p>
                      <p>Sensoren vil starte med status "Pending" og aktiveres automatisk når første data mottas fra enheten.</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button onClick={() => setStep(3)} variant="outline" disabled={loading}>
                  Tilbake
                </Button>
                <Button onClick={activateSensor} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                  {loading ? "Legger til..." : "Legg til sensor"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddBuildingModal
        open={showAddBuildingModal}
        onOpenChange={setShowAddBuildingModal}
        onBuildingAdded={(building) => {
          setBuildings([...buildings, building]);
          setFormData({ ...formData, buildingId: building.id });
          setShowAddBuildingModal(false);
        }}
      />
    </>
  );
}