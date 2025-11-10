// components/buildings/AddBuildingModal.tsx
"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Building, BuildingType } from "@/lib/types";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddBuildingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuildingAdded?: (building: Building) => void;
}

export default function AddBuildingModal({
  open,
  onOpenChange,
  onBuildingAdded
}: AddBuildingModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "residential" as BuildingType,
    street: "",
    postalCode: "",
    city: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const buildingData: any = {
        userId: user.uid,
        name: formData.name,
        type: formData.type,
        sensorCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      if (formData.street || formData.city) {
        buildingData.address = {
          street: formData.street,
          postalCode: formData.postalCode,
          city: formData.city
        };
      }

      if (formData.notes) {
        buildingData.notes = formData.notes;
      }

      const buildingsCollectionRef = collection(db, "users", user.uid, "buildings");
      const docRef = await addDoc(buildingsCollectionRef, buildingData);
      
      const newBuilding: Building = {
        id: docRef.id,
        ...buildingData
      };

      toast.success(`${formData.name} er opprettet!`);
      
      if (onBuildingAdded) {
        onBuildingAdded(newBuilding);
      }
      
      // Reset form
      setFormData({
        name: "",
        type: "residential",
        street: "",
        postalCode: "",
        city: "",
        notes: ""
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding building:", error);
      toast.error("Kunne ikke opprette bygning. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Legg til ny bygning</DialogTitle>
          <DialogDescription>
            Fyll ut detaljene under for å opprette en ny bygning. Dette hjelper deg med å organisere sensorene dine.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bygningsnavn *</Label>
            <Input
              id="name"
              placeholder="F.eks. Hovedbygning, Garasje, Hytte"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type bygning</Label>
            <Select
              value={formData.type}
              onValueChange={(value: BuildingType) => 
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Bolig</SelectItem>
                <SelectItem value="commercial">Næring</SelectItem>
                <SelectItem value="industrial">Industri</SelectItem>
                <SelectItem value="cabin">Hytte/Fritidsbolig</SelectItem>
                <SelectItem value="other">Annet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Gateadresse (valgfritt)</Label>
            <Input
              id="street"
              placeholder="F.eks. Storgata 123"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postnummer</Label>
              <Input
                id="postalCode"
                placeholder="0000"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Poststed</Label>
              <Input
                id="city"
                placeholder="F.eks. Oslo"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notater (valgfritt)</Label>
            <Textarea
              id="notes"
              placeholder="Ekstra informasjon om bygningen..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              {loading ? "Oppretter..." : "Opprett bygning"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
