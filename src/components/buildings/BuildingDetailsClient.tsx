// Filsti: src/components/buildings/BuildingDetailsClient.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building, Sensor } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Building2,
  Factory,
  Mountain,
  MapPin,
  Calendar,
  Ruler,
  Users,
  ArrowLeft,
  Trash2,
  Loader2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import SensorCard from "@/components/dashboard/SensorCard";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const buildingIcons = {
  residential: Home,
  commercial: Building2,
  industrial: Factory,
  cabin: Mountain,
  other: Home,
};

const buildingTypeLabels = {
  residential: "Bolig",
  commercial: "Kommersiell",
  industrial: "Industriell",
  cabin: "Hytte",
  other: "Annet",
};

interface BuildingDetailsClientProps {
  building: Building;
  initialSensors: Sensor[];
}

export default function BuildingDetailsClient({
  building,
  initialSensors,
}: BuildingDetailsClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [sensors, setSensors] = useState<Sensor[]>(initialSensors);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const Icon = buildingIcons[building.type || "residential"];

  useEffect(() => {
    if (!user) return;

    const sensorsQuery = query(
      collection(db, "users", user.uid, "sensors"),
      where("buildingId", "==", building.id)
    );

    const unsubscribe = onSnapshot(sensorsQuery, (snapshot) => {
      const sensorsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sensor[];
      setSensors(sensorsData);
    });

    return () => unsubscribe();
  }, [user, building.id]);

  const handleDeleteBuilding = async () => {
    if (!user) return;

    if (sensors.length > 0) {
      toast.error(
        `Kan ikke slette bygning med ${sensors.length} sensor${sensors.length > 1 ? 'er' : ''}. Fjern sensorene først.`
      );
      setShowDeleteDialog(false);
      return;
    }

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "users", user.uid, "buildings", building.id));
      toast.success(`${building.name} er slettet`);
      router.push("/buildings");
    } catch (error) {
      console.error("Error deleting building:", error);
      toast.error("Kunne ikke slette bygning");
    } finally {
      setDeleting(false);
    }
  };

  const activeSensors = sensors.filter((s) => s.status === "ok").length;
  const warningSensors = sensors.filter((s) => s.status === "warning").length;
  const criticalSensors = sensors.filter((s) => s.status === "critical").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/buildings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Icon className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-headline">{building.name}</h1>
              <Badge variant="outline" className="mt-1">
                {buildingTypeLabels[building.type || "other"]}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/sensors?buildingId=${building.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Legg til sensor
            </Link>
          </Button>
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Slett bygning
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Slett bygning?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    Er du sikker på at du vil slette <strong>{building.name}</strong>?
                  </p>
                  {sensors.length > 0 ? (
                    <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                      <p className="text-destructive font-medium text-sm">
                        ⚠️ Denne bygningen har {sensors.length} sensor{sensors.length > 1 ? 'er' : ''}. 
                      </p>
                      <p className="text-destructive text-sm mt-1">
                        Du må fjerne alle sensorer før du kan slette bygningen.
                      </p>
                    </div>
                  ) : (
                    <p className="text-destructive font-medium text-sm">
                      ⚠️ Denne handlingen kan ikke angres.
                    </p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Avbryt</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteBuilding}
                  disabled={deleting || sensors.length > 0}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Slett bygning
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Building Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Bygningsdetaljer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {building.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Adresse</p>
                  <p className="text-sm text-muted-foreground">
                    {building.address.street}
                    <br />
                    {building.address.postalCode} {building.address.city}
                  </p>
                </div>
              </div>
            )}

            {building.yearBuilt && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Byggeår</p>
                  <p className="text-sm text-muted-foreground">{building.yearBuilt}</p>
                </div>
              </div>
            )}

            {building.size && (
              <div className="flex items-start gap-3">
                <Ruler className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Størrelse</p>
                  <p className="text-sm text-muted-foreground">{building.size} m²</p>
                </div>
              </div>
            )}

            {building.occupants && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Beboere</p>
                  <p className="text-sm text-muted-foreground">{building.occupants}</p>
                </div>
              </div>
            )}

            <Separator />

            <div className="text-xs text-muted-foreground">
              Opprettet {format(building.createdAt.toDate(), "d. MMMM yyyy", { locale: nb })}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sensor-statistikk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg">
                <span className="text-sm font-medium">Normale sensorer</span>
                <span className="text-2xl font-bold text-green-600">{activeSensors}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-lg">
                <span className="text-sm font-medium">Advarsler</span>
                <span className="text-2xl font-bold text-yellow-600">{warningSensors}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
                <span className="text-sm font-medium">Kritiske</span>
                <span className="text-2xl font-bold text-red-600">{criticalSensors}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Totalt antall sensorer</span>
                <span className="text-xl font-bold">{sensors.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensors Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Sensorer i bygningen</h2>
          <Button asChild>
            <Link href={`/sensors?buildingId=${building.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Legg til sensor
            </Link>
          </Button>
        </div>

        {sensors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                Ingen sensorer registrert i denne bygningen ennå
              </p>
              <Button asChild>
                <Link href={`/sensors?buildingId=${building.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Legg til første sensor
                </Link>
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
      </div>
    </div>
  );
}