// Filsti: src/components/sensors/AddSensorModal.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
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
  collectionGroup
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

const sensorTypeDetails = {
  temperature: { unit: '°C', min: -40, max: 120, warning: 30, critical: 40 },
  moisture: { unit: '%', min: 0, max: 100, warning: 60, critical: 80 },
  weight: { unit: 'kg', min: 0, max: 500, warning: 200, critical: 400 },
  ir: { unit: 'cm', min: 0, max: 1000, warning: 100, critical: 50 },
  flow: { unit: 'l/min', min: 0, max: 100, warning: 50, critical: 80 },
};

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

  const loadBuildings = useCallback(async () => {
    if (!user) return;
    try {
      const buildingsQuery = query(collection(db, "users", user.uid, "buildings"));
      const snapshot = await getDocs(buildingsQuery);
      const buildingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Building[];
      setBuildings(buildingsData);
    } catch (error) {
      console.error("Feil ved lasting av bygninger:", error);
      toast.error("Kunne ikke hente bygningslisten.");
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      loadBuildings();
    }
  }, [open, user, loadBuildings]);

  useEffect(() => {
    if (formData.sensorType) {
        const details = sensorTypeDetails[formData.sensorType];
        setFormData(prev => ({
            ...prev,
            warningThreshold: details.warning,
            criticalThreshold: details.critical
        }));
    }
  }, [formData.sensorType]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => resetForm(), 300);
  }
  
  const verifySensorId = async () => {
    if (!formData.sensorId || !formData.sensorType) {
      toast.error("Sensor-ID og sensortype må fylles ut.");
      return;
    }
    setLoading(true);
    try {
      const sensorsQuery = query(
        collection(db, "users", user!.uid, "sensors"),
        where("sensorId", "==", formData.sensorId)
      );
      const existingUserSensors = await getDocs(sensorsQuery);
      if (!existingUserSensors.empty) {
        toast.error("Sensoren er allerede registrert på din konto.");
        return;
      }

      const allSensorsQuery = query(
        collectionGroup(db, "sensors"),
        where("sensorId", "==", formData.sensorId)
      );
      const allSensors = await getDocs(allSensorsQuery);
      if (!allSensors.empty) {
        toast.error("Denne sensoren er allerede registrert av en annen bruker. Kontakt support hvis du mener dette er en feil.");
        return;
      }
      
      toast.success("Sensor-ID er godkjent!");
      setStep(2);
    } catch (error) {
      console.error("Feil ved verifisering av sensor:", error);
      toast.error("En feil oppstod under verifisering.");
    } finally {
      setLoading(false);
    }
  };
  
  const selectBuilding = () => {
    if (!formData.buildingId && formData.buildingId !== "none") {
      toast.error("Vennligst velg en bygning eller \'Ingen bygning\'.");
      return;
    }
    setStep(3);
  };
  
  const setNameAndLocation = () => {
    if (!formData.name) {
      toast.error("Vennligst gi sensoren et navn.");
      return;
    }
    setStep(4);
  };

  const activateSensor = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const sensorDetails = sensorTypeDetails[formData.sensorType];
      const newSensorData = {
        sensorId: formData.sensorId,
        userId: user.uid,
        buildingId: formData.buildingId !== "none" ? formData.buildingId : undefined,
        type: formData.sensorType,
        name: formData.name,
        location: formData.location || undefined,
        thresholds: {
          warning: formData.warningThreshold,
          critical: formData.criticalThreshold,
        },
        alertMethods: ['email' as const, ...(formData.alertSms ? ['sms' as const] : [])],
        batteryLevel: 100, // Start with full battery
        status: 'pending' as const,
        currentValue: 0,
        unit: sensorDetails.unit,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastCommunication: null,
        equipmentType: 'Generic Equipment'
      };

      const sensorRef = await addDoc(collection(db, "users", user.uid, "sensors"), newSensorData);

      if (formData.buildingId && formData.buildingId !== "none") {
        const building = buildings.find(b => b.id === formData.buildingId);
        if (building) {
          await updateDoc(doc(db, "users", user.uid, "buildings", formData.buildingId), {
            sensorCount: (building.sensorCount || 0) + 1,
            updatedAt: Timestamp.now()
          });
        }
      }

      toast.success(`${formData.name} er lagt til!`, {
        description: "Sensoren venter på sin første melding. Status oppdateres automatisk.",
        duration: 5000
      });

      if (onSensorAdded) {
        const newSensor: Sensor = {
          id: sensorRef.id,
          ...newSensorData,
        };
        onSensorAdded(newSensor);
      }
      handleClose();
    } catch (error) {
      console.error("Feil ved aktivering av sensor:", error);
      toast.error("Kunne ikke aktivere sensoren.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      sensorId: "", sensorType: "" as SensorType, buildingId: "",
      name: "", location: "", warningThreshold: 50, criticalThreshold: 100,
      alertEmail: true, alertSms: false
    });
  };

  const sensorDetails = formData.sensorType ? sensorTypeDetails[formData.sensorType] : null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Legg til ny sensor</DialogTitle>
            <DialogDescription>Legg til en ny sensor i systemet ditt ved å følge disse stegene. Steg {step} av 4</DialogDescription>
            <Progress value={(step / 4) * 100} className="h-2" />
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4 pt-4">
              <div className="bg-primary/10 p-4 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-primary/90">
                  <p className="font-semibold mb-1">Finn din Sensor-ID</p>
                  <p>Du finner denne unike identifikatoren på enhetens etikett. Den kan være merket som DevEUI, MAC-adresse eller lignende.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sensorId">Sensor-ID *</Label>
                <Input id="sensorId" placeholder="F.eks. BC9740FFFE10D33A" value={formData.sensorId} onChange={(e) => setFormData({ ...formData, sensorId: e.target.value.toUpperCase().trim() })} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sensorType">Sensortype *</Label>
                <Select value={formData.sensorType} onValueChange={(value) => setFormData({ ...formData, sensorType: value as SensorType })}>
                  <SelectTrigger><SelectValue placeholder="Velg type sensor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temperature">Temperatursensor</SelectItem>
                    <SelectItem value="weight">Vektsensor</SelectItem>
                    <SelectItem value="ir">Avstandssensor (IR)</SelectItem>
                    <SelectItem value="moisture">Fuktsensor</SelectItem>
                    <SelectItem value="flow">Strømningssensor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button onClick={handleClose} variant="outline" disabled={loading}>Avbryt</Button>
                <Button onClick={verifySensorId} disabled={loading || !formData.sensorId || !formData.sensorType}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Verifiserer...</> : "Neste"}
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 pt-4">
                <div className="bg-green-500/10 p-4 rounded-lg flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-green-900 dark:text-green-100">Sensor-ID godkjent!</p>
                        <p className="text-green-800 dark:text-green-200">ID-en {formData.sensorId} er tilgjengelig.</p>
                    </div>
                </div>
              <div className="space-y-2">
                <Label htmlFor="buildingId">Knytt sensoren til en bygning for bedre organisering.</Label>
                <Select value={formData.buildingId} onValueChange={(value) => setFormData({ ...formData, buildingId: value })}>
                  <SelectTrigger><SelectValue placeholder="Velg bygning (valgfritt)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ingen bygning</SelectItem>
                    {buildings.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" className="w-full mt-2" onClick={() => setShowAddBuildingModal(true)}><Plus className="mr-2 h-4 w-4" />Opprett ny bygning</Button>
              </div>
              <DialogFooter className="pt-4">
                <Button onClick={() => setStep(1)} variant="outline">Tilbake</Button>
                <Button onClick={selectBuilding}>Neste</Button>
              </DialogFooter>
            </div>
          )}

          {step === 3 && (
             <div className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Sensornavn *</Label>
                    <Input id="name" placeholder="F.eks. Kjellerbod, Taklekkasje" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}/>
                    <p className="text-xs text-muted-foreground">Et godt navn hjelper deg å raskt identifisere sensoren, f.eks. \'Vannlekkasje bad\' eller \'Temperatur fryserom\'.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Plassering (valgfritt)</Label>
                    <Input id="location" placeholder="F.eks. Nordre hjørne" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}/>
                </div>
                <DialogFooter className="pt-4">
                    <Button onClick={() => setStep(2)} variant="outline">Tilbake</Button>
                    <Button onClick={setNameAndLocation}>Neste</Button>
                </DialogFooter>
            </div>
          )}

          {step === 4 && sensorDetails && (
            <div className="space-y-6 pt-4">
                <div className="space-y-4">
                    <p className="text-sm font-medium">Angi terskelverdier for varsler</p>
                    <div className="space-y-2">
                        <Label>Advarsel: {formData.warningThreshold} {sensorDetails.unit}</Label>
                        <Slider value={[formData.warningThreshold]} onValueChange={([v]) => setFormData({ ...formData, warningThreshold: v })} min={sensorDetails.min} max={sensorDetails.max} step={(sensorDetails.max - sensorDetails.min) / 100} />
                    </div>
                    <div className="space-y-2">
                        <Label>Kritisk: {formData.criticalThreshold} {sensorDetails.unit}</Label>
                        <Slider value={[formData.criticalThreshold]} onValueChange={([v]) => setFormData({ ...formData, criticalThreshold: v })} min={sensorDetails.min} max={sensorDetails.max} step={(sensorDetails.max - sensorDetails.min) / 100} />
                    </div>
                </div>
              <div className="space-y-3">
                <Label>Varslingsmetoder</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="alertEmail" checked={formData.alertEmail} onCheckedChange={(c) => setFormData({ ...formData, alertEmail: c as boolean })}/>
                  <label htmlFor="alertEmail" className="text-sm font-medium">E-postvarsler</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="alertSms" checked={formData.alertSms} onCheckedChange={(c) => setFormData({ ...formData, alertSms: c as boolean })}/>
                  <label htmlFor="alertSms" className="text-sm font-medium">SMS-varsler (krever abonnement)</label>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button onClick={() => setStep(3)} variant="outline" disabled={loading}>Tilbake</Button>
                <Button onClick={activateSensor} disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Aktiverer...</> : "Fullfør aktivering"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddBuildingModal open={showAddBuildingModal} onOpenChange={setShowAddBuildingModal} onBuildingAdded={(b) => { loadBuildings(); setFormData(prev => ({ ...prev, buildingId: b.id })); setShowAddBuildingModal(false); }} />
    </>
  );
}
