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
  doc, 
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
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

    setLoading(true);
    try {
      const sensorIdPattern = /^SG-\d{4}-\d{6}$/;
      if (!sensorIdPattern.test(formData.sensorId)) {
        toast.error("Ugyldig Sensor-ID format. Skal være: SG-2024-XXXXXX");
        setLoading(false);
        return;
      }
      
      const sensorDocRef = doc(db, "available_sensors", formData.sensorId);
      const sensorDocSnap = await getDoc(sensorDocRef);

      if (!sensorDocSnap.exists()) {
        toast.error("Sensor-ID ikke funnet. Sjekk at du har skrevet riktig ID.");
        setLoading(false);
        return;
      }

      const sensorData = sensorDocSnap.data();

      if (sensorData.registeredToUser) {
        toast.error("Denne sensoren er allerede registrert til en bruker.");
        setLoading(false);
        return;
      }

      setFormData(prev => ({
        ...prev,
        sensorType: sensorData.type as SensorType
      }));
      
      toast.success("Sensor-ID verifisert!");
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
        batteryLevel: 100,
        status: 'ok' as const,
        currentValue: 22,
        unit: getUnitForSensorType(formData.sensorType),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastCommunication: Timestamp.now(),
        equipmentType: 'Generic Equipment',
        data: Array.from({ length: 30 }, (_, i) => ({
          timestamp: Timestamp.fromMillis(Date.now() - (30 - i) * 60000),
          value: Math.floor(Math.random() * 20) + 15,
          unit: getUnitForSensorType(formData.sensorType),
          batteryLevel: 100
        }))
      };

      const sensorRef = await addDoc(sensorsCollectionRef, sensorData);
      
      const availableSensorRef = doc(db, "available_sensors", formData.sensorId);
      await updateDoc(availableSensorRef, {
        registeredToUser: user.uid,
        registeredAt: Timestamp.now()
      });

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

      toast.success(`${formData.name} er aktivert og klar til bruk!`);
      
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
                    <p>Sensor-ID står på etiketten på sensoren eller på esken den kom i. Formatet er vanligvis `SG-XXXX-XXXXXX`.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sensorId">Sensor-ID *</Label>
                <Input
                  id="sensorId"
                  placeholder="F.eks. SG-2024-001234"
                  value={formData.sensorId}
                  onChange={(e) => setFormData({ ...formData, sensorId: e.target.value.toUpperCase() })}
                  disabled={loading}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  disabled={loading}
                >
                  Avbryt
                </Button>
                <Button onClick={verifySensorId} disabled={loading}>
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
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Detektert sensortype</p>
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
                  placeholder="F.eks. Underetasje, rom 103"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={loading}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button onClick={() => setStep(2)} variant="outline" disabled={loading}>
                  Tilbake
                </Button>
                <Button onClick={setNameAndLocation} disabled={loading}>
                  Neste
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Varsle ved {formData.warningThreshold} {getUnitForSensorType(formData.sensorType)}
                  </Label>
                  <Slider
                    value={[formData.warningThreshold]}
                    onValueChange={([value]) => setFormData({ ...formData, warningThreshold: value })}
                    min={0}
                    max={formData.sensorType === 'temperature' ? 100 : 500}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Kritisk ved {formData.criticalThreshold} {getUnitForSensorType(formData.sensorType)}
                  </Label>
                  <Slider
                    value={[formData.criticalThreshold]}
                    onValueChange={([value]) => setFormData({ ...formData, criticalThreshold: value })}
                    min={0}
                    max={formData.sensorType === 'temperature' ? 120 : 600}
                    step={5}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Varsle meg via:</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={formData.alertEmail}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, alertEmail: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      E-post
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms"
                      checked={formData.alertSms}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, alertSms: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="sms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      SMS
                    </label>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button onClick={() => setStep(3)} variant="outline" disabled={loading}>
                  Tilbake
                </Button>
                <Button onClick={activateSensor} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                  {loading ? "Aktiverer..." : "Fullfør og aktiver"}
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
          loadBuildings().then(() => {
            setFormData({ ...formData, buildingId: building.id }); 
            toast.success("Bygning opprettet! Den er nå valgt for sensoren din.");
          });
        }}
      />
    </>
  );
}

    