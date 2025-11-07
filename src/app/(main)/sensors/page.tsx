// app/(main)/sensors/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import SensorCard from "@/components/dashboard/SensorCard";
import AddSensorModal from "@/components/sensors/AddSensorModal";
import type { Sensor } from "@/lib/types";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function SensorsPage() {
  const { user } = useAuth();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Real-time listener for sensors
    const sensorsQuery = query(
      collection(db, "users", user.uid, "sensors")
    );

    const unsubscribe = onSnapshot(sensorsQuery, (snapshot) => {
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

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Vennligst logg inn for å se sensorer</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Mine sensorer</h1>
          <p className="text-muted-foreground mt-1">
            Administrer og overvåk alle dine sensorer
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Legg til sensor
        </Button>
      </div>

      {sensors.length === 0 ? (
        <Card className="flex items-center justify-center h-64">
          <CardContent className="text-center text-muted-foreground p-6">
            <p className="font-semibold">Ingen sensorer funnet.</p>
            <p className="text-sm mb-4">Legg til din første sensor for å begynne overvåking.</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Legg til sensor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sensors.map((sensor) => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
      )}

      <AddSensorModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSensorAdded={(sensor) => {
          // Sensor will be automatically added via onSnapshot listener
          setShowAddModal(false);
        }}
      />
    </div>
  );
}