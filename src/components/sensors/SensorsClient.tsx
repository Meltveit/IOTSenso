"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Sensor } from "@/lib/types";
import { useRouter } from "next/navigation";
import AddSensorModal from "./AddSensorModal";

export default function SensorsClient({ sensors }: { sensors: Sensor[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const statusColors = {
    ok: "bg-green-500/20 text-green-700 border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    critical: "bg-red-500/20 text-red-600 border-red-500/30",
    offline: "bg-gray-500/20 text-gray-600 border-gray-500/30",
    pending: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Sensorer</CardTitle>
            <CardDescription>
              Administrer alle dine tilkoblede sensorer.
            </CardDescription>
          </div>
          <Button size="sm" className="gap-1" onClick={() => setOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Legg til sensor
          </Button>
        </CardHeader>
        <CardContent>
          {sensors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Navn</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Plassering</TableHead>
                  <TableHead>
                    <span className="sr-only">Handlinger</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sensors.map((sensor) => (
                  <TableRow key={sensor.id} className="cursor-pointer" onClick={() => router.push(`/sensors/${sensor.id}`)}>
                    <TableCell className="font-medium">{sensor.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(statusColors[sensor.status])}>
                        {sensor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{sensor.type}</TableCell>
                    <TableCell>{sensor.location || 'Ikke spesifisert'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Åpne meny</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/sensors/${sensor.id}`)}}>Vis detaljer</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Rediger</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>
                            Slett
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="font-semibold">Ingen sensorer funnet</p>
              <p>Klikk på "Legg til sensor" for å komme i gang.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <AddSensorModal open={open} onOpenChange={setOpen} />
    </>
  );
}
