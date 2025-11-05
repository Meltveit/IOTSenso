"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BuildingCard from "@/components/buildings/BuildingCard";
import AddBuildingModal from "@/components/buildings/AddBuildingModal";
import type { Building, Sensor } from "@/lib/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuildingsPage() {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    setLoading(true);
    const buildingsQuery = query(
      collection(db, "buildings"),
      where("userId", "==", user.uid)
    );
    
    const unsubscribeBuildings = onSnapshot(buildingsQuery, (snapshot) => {
      const buildingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Building[];
      
      setBuildings(buildingsData.sort((a, b) => a.name.localeCompare(b.name)));
    }, (error) => {
        console.error("Error fetching buildings:", error);
        setLoading(false);
    });

    const sensorsQuery = query(
      collection(db, "sensors"),
      where("userId", "==", user.uid)
    );
    
    const unsubscribeSensors = onSnapshot(sensorsQuery, (snapshot) => {
      const sensorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sensor[];
      
      setSensors(sensorsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching sensors:", error);
        setLoading(false);
    });

    return () => {
      unsubscribeBuildings();
      unsubscribeSensors();
    };
  }, [user]);

  const getSensorsForBuilding = (buildingId: string) => {
    return sensors.filter(s => s.buildingId === buildingId);
  };
  
  const sortedBuildings = useMemo(() => {
    return [...buildings].sort((a,b) => a.name.localeCompare(b.name));
  }, [buildings]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Mine bygninger</h1>
          <p className="text-muted-foreground mt-1">
            Administrer og overvåk sensorer gruppert per bygning.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Legg til bygning
        </Button>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
            ))}
        </div>
      ) : buildings.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg mt-8">
          <h3 className="text-xl font-semibold mb-2">Ingen bygninger funnet</h3>
          <p className="text-muted-foreground mb-4">
            Opprett din første bygning for å begynne å organisere sensorene dine.
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Opprett bygning
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBuildings.map(building => (
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
      />
    </div>
  );
}
