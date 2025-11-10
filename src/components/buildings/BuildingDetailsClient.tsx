// Filsti: src/components/buildings/BuildingDetailsClient.tsx

"use client";

import { useState } from "react";
import { Building, Sensor } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Building2,
  Factory,
  Mountain,
  MapPin,
  ArrowLeft,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SensorCard from "@/components/dashboard/SensorCard";
import CameraSection from "./CameraSection";
import { useRouter } from "next/navigation";

const buildingIcons = {
  residential: Home,
  commercial: Building2,
  industrial: Factory,
  cabin: Mountain,
  other: Home,
};

export default function BuildingDetailsClient({
  building,
  sensors,
}: {
  building: Building;
  sensors: Sensor[];
}) {
  const router = useRouter();
  const Icon = buildingIcons[building.type || "residential"];

  const activeCount = sensors.filter((s) => s.status === "ok").length;
  const warningCount = sensors.filter((s) => s.status === "warning").length;
  const criticalCount = sensors.filter((s) => s.status === "critical").length;
  const offlineCount = sensors.filter((s) => s.status === "offline" || s.status === "pending").length;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/buildings")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake til bygninger
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Icon className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-headline">{building.name}</h1>
              {building.address && (
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {building.address.street}, {building.address.postalCode}{" "}
                    {building.address.city}
                  </span>
                </div>
              )}
              {building.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  {building.notes}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Innstillinger
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Sensors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {activeCount}
                </div>
                <div className="text-sm text-muted-foreground">OK</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {warningCount}
                </div>
                <div className="text-sm text-muted-foreground">Advarsel</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-red-600">
                  {criticalCount}
                </div>
                <div className="text-sm text-muted-foreground">Kritisk</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {offlineCount}
                </div>
                <div className="text-sm text-muted-foreground">Offline</div>
              </CardContent>
            </Card>
          </div>

          {/* Sensors List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Sensorer</CardTitle>
                  <CardDescription>
                    {sensors.length} {sensors.length === 1 ? "sensor" : "sensorer"}{" "}
                    i denne bygningen
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/sensors?buildingId=${building.id}`}>
                    Administrer sensorer
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sensors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Ingen sensorer er lagt til i denne bygningen ennå.</p>
                  <Button className="mt-4" asChild>
                    <Link href="/sensors">Legg til sensor</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {sensors.map((sensor) => (
                    <SensorCard key={sensor.id} sensor={sensor} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Cameras */}
        <div className="lg:col-span-1">
          <CameraSection buildingId={building.id} cameras={building.cameras || []} />
        </div>
      </div>
    </div>
  );
}