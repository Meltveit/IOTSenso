// Filsti: src/app/(main)/buildings/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Building, Sensor } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import BuildingDetailsClient from '@/components/buildings/BuildingDetailsClient';

export default function BuildingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [building, setBuilding] = useState<Building | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Real-time listener for building
    const buildingRef = doc(db, 'users', user.uid, 'buildings', id as string);
    
    const unsubscribeBuilding = onSnapshot(buildingRef, (docSnap) => {
      if (docSnap.exists()) {
        setBuilding({ id: docSnap.id, ...docSnap.data() } as Building);
      } else {
        setBuilding(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching building:', error);
      setLoading(false);
    });

    // Real-time listener for sensors in this building
    const sensorsQuery = query(
      collection(db, 'users', user.uid, 'sensors'),
      where('buildingId', '==', id)
    );

    const unsubscribeSensors = onSnapshot(sensorsQuery, (snapshot) => {
      const sensorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sensor[];
      setSensors(sensorsData);
    }, (error) => {
      console.error('Error fetching sensors:', error);
    });

    return () => {
      unsubscribeBuilding();
      unsubscribeSensors();
    };
  }, [user, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!building) {
    notFound();
  }

  return <BuildingDetailsClient building={building} sensors={sensors} />;
}