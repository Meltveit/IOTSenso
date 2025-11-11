'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Sensor } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import SensorDetailsClient from "@/components/sensors/SensorDetailsClient";

export default function SensorDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Real-time listener for sensor document
    const sensorDocRef = doc(db, 'users', user.uid, 'sensors', id as string);
    
    const unsubscribeSensor = onSnapshot(sensorDocRef, async (sensorDoc) => {
      if (!sensorDoc.exists()) {
        setLoading(false);
        return;
      }

      const sensorData = sensorDoc.data();
      
      // Fetch last 50 readings for the chart
      const readingsRef = collection(db, 'users', user.uid, 'sensors', id as string, 'readings');
      const readingsQuery = query(readingsRef, orderBy('timestamp', 'desc'), limit(50));
      
      // Listen to readings in real-time
      const unsubscribeReadings = onSnapshot(readingsQuery, (readingsSnapshot) => {
        const readings = readingsSnapshot.docs.map(readingDoc => {
          const data = readingDoc.data();
          return {
            value: data.value,
            humidityValue: data.humidityValue,
            timestamp: data.timestamp?.toDate?.() || new Date(),
          };
        }).reverse(); // Reverse to show oldest first in chart

        setSensor({
          id: sensorDoc.id,
          ...sensorData,
          data: readings,
        } as Sensor);
        
        setLoading(false);
      }, (error) => {
        console.error('Error fetching readings:', error);
        // Still set the sensor even if readings fail
        setSensor({
          id: sensorDoc.id,
          ...sensorData,
          data: [],
        } as unknown as Sensor);
        setLoading(false);
      });

      return unsubscribeReadings;
    }, (error) => {
      console.error('Error fetching sensor:', error);
      setLoading(false);
    });

    return () => {
      unsubscribeSensor();
    };
  }, [user, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!sensor) {
    notFound();
  }

  return <SensorDetailsClient initialSensor={sensor} />;
}