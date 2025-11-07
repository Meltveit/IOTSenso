'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Building } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function BuildingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const fetchBuilding = async () => {
      setLoading(true);
      const docRef = doc(db, 'users', user.uid, 'buildings', id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setBuilding({ id: docSnap.id, ...docSnap.data() } as Building);
      } else {
        // Handle not found
      }
      setLoading(false);
    };

    fetchBuilding();
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

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{building.name}</CardTitle>
          <CardDescription>
            Detaljer og sensorstatus for {building.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Dette er detaljsiden for bygningen. Her vil du se grafer, sensorlister og annen relevant informasjon for denne spesifikke bygningen.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Bygnings-ID: {building.id}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}