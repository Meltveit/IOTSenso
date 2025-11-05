// app/(main)/buildings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BuildingCard from "@/components/buildings/BuildingCard";
import AddBuildingModal from "@/components/buildings/AddBuildingModal";
import { Building, Sensor } from "@/lib/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function BuildingsPage() {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Listen to buildings subcollection
    const buildingsQuery = query(collection(db, "users", user.uid, "buildings"));
    
    const unsubscribeBuildings = onSnapshot(buildingsQuery, (snapshot) => {
      const buildingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Building[];
      setBuildings(buildingsData);
      if(loading) setLoading(false);
    }, (error) => {
        console.error("Error fetching buildings:", error);
        setLoading(false);
    });

    // Listen to sensors subcollection
    const sensorsQuery = query(collection(db, "users", user.uid, "sensors"));
    
    const unsubscribeSensors = onSnapshot(sensorsQuery, (snapshot) => {
      const sensorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sensor[];
      setSensors(sensorsData);
    }, (error) => {
        console.error("Error fetching sensors:", error);
    });

    return () => {
      unsubscribeBuildings();
      unsubscribeSensors();
    };
  }, [user]);

  const getSensorsForBuilding = (buildingId: string) => {
    return sensors.filter(s => s.buildingId === buildingId);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Mine bygninger</h1>
          <p className="text-muted-foreground mt-1">
            Administrer og overvåk sensorer gruppert per bygning
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Legg til bygning
        </Button>
      </div>

      {buildings.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Ingen bygninger ennå</h3>
          <p className="text-muted-foreground mb-4">
            Opprett din første bygning for å gruppere sensorer
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Opprett bygning
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map(building => (
            <BuildingCard
              key={building.id}
              building={building}
              sensors={getSensorsForBuilding(building.id)}
            />
          ))}
        </div>
      )}

      <AddBuildingModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onBuildingAdded={(building) => {
          // Building vil automatisk vises via onSnapshot listener
        }}
      />
    </div>
  );
}

    