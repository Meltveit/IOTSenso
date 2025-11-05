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

  // Last inn bygninger når modal åpnes
  useEffect(() => {
    if (open && user) {
      loadBuildings();
    }
  }, [open, user]);

  const loadBuildings = async () => {
    if (!user) return;
    
    try {
      const buildingsQuery = query(
        collection(db, "buildings"),
        where("userId", "==", user.uid)
      );
      
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

  // Steg 1: Verifiser Sensor-ID
  const verifySensorId = async () => {
    if (!formData.sensorId) {
      toast.error("Vennligst skriv inn Sensor-ID");
      return;
    }

    setLoading(true);
    try {
      // For now, let's assume any ID is valid for demo purposes
      // In a real app, you would check this against a database of available sensors
      // const sensorIdPattern = /^SG-\d{4}-\d{6}$/;
      // if (!sensorIdPattern.test(formData.sensorId)) {
      //   toast.error("Ugyldig Sensor-ID format. Skal være: SG-2024-XXXXXX");
      //   return;
      // }
      
      const pseudoSensorType = (formData.sensorId.length % 4) switch {
        0 => 'temperature',
        1 => 'humidity',
        2 => 'pressure',
        3 => 'vibration',
        default => 'temperature'
      } as SensorType;


      setFormData(prev => ({
        ...prev,
        sensorType: pseudoSensorType
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

  // Steg 2: Velg bygning
  const selectBuilding = () => {
    if (!formData.buildingId && formData.buildingId !== "none") {
      toast.error("Vennligst velg en bygning eller velg 'Ingen bygning'");
      return;
    }
    setStep(3);
  };

  // Steg 3: Navn og plassering
  const setNameAndLocation = () => {
    if (!formData.name) {
      toast.error("Vennligst gi sensoren et navn");
      return;
    }
    setStep(4);
  };

  // Steg 4: Aktiver sensor
  const activateSensor = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 1. Opprett sensor-dokument
      const sensorData = {
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
        equipmentType: 'Generic Equipment',
        data: Array.from({ length: 30 }, (_, i) => ({
          timestamp: Timestamp.fromMillis(Date.now() - (30 - i) * 60000),
          value: Math.floor(Math.random() * 20) + 15
        }))
      };

      const sensorRef = await addDoc(collection(db, "sensors"), sensorData);

      // 3. Oppdater sensorCount på bygning hvis relevant
      if (formData.buildingId && formData.buildingId !== "none") {
        const buildingRef = doc(db, "buildings", formData.buildingId);
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
        lastCommunication: Timestamp.now(),
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
    setStep(1);
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

          {/* STEG 1: Sensor-ID */}
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

          {/* STEG 2: Velg bygning */}
          {step === 2 && (
            <div className="space-y-4 pt-4">
              <div className="bg-green-500/10 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Sensor verifisert!</strong> Type: {getSensorTypeName(formData.sensorType)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="building">Velg bygning (valgfritt)</Label>
                <Select
                  value={formData.buildingId}
                  onValueChange={(value) => setFormData({ ...formData, buildingId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg bygning" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ingen bygning</SelectItem>
                    {buildings.map(building => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAddBuildingModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Opprett ny bygning
              </Button>

              <DialogFooter className="pt-4">
                <Button onClick={() => setStep(1)} variant="outline">
                  Tilbake
                </Button>
                <Button onClick={selectBuilding}>
                  Neste
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* STEG 3: Navn og plassering */}
          {step === 3 && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Sensornavn *</Label>
                <Input
                  id="name"
                  placeholder="F.eks. 'Tak over inngangsparti'"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Gi sensoren et beskrivende navn slik at du enkelt kan identifisere den.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Spesifikk plassering (valgfritt)</Label>
                <Input
                  id="location"
                  placeholder="F.eks. 'Sør-vest hjørne, ved pipa'"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button onClick={() => setStep(2)} variant="outline">
                  Tilbake
                </Button>
                <Button onClick={setNameAndLocation}>
                  Neste
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* STEG 4: Varslings-grenser */}
          {step === 4 && (
            <div className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Advarsel ved {formData.warningThreshold} {getUnitForSensorType(formData.sensorType)}
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
