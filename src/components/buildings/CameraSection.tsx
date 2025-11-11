// Filsti: src/components/buildings/CameraSection.tsx

"use client";

import { useState } from "react";
import { Camera } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera as CameraIcon,
  Plus,
  Trash2,
  RefreshCw,
  Maximize2,
  X,
  AlertCircle,
} from "lucide-react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Utvid Camera type til å inkludere stream type
interface CameraWithType extends Camera {
  streamType?: 'iframe' | 'mjpeg' | 'hls' | 'image';
}

interface CameraSectionProps {
  buildingId: string;
  cameras: Camera[];
}

// Komponent for å vise kamera basert på type
function CameraStream({ camera, refreshKey }: { camera: CameraWithType; refreshKey: number }) {
  const streamType = camera.streamType || 'iframe';

  switch (streamType) {
    case 'mjpeg':
      // MJPEG stream (ofte brukt av IP-kameraer)
      return (
        <img
          key={`${camera.id}-${refreshKey}`}
          src={camera.url}
          alt={camera.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      );

    case 'hls':
      // HLS video stream
      return (
        <video
          key={`${camera.id}-${refreshKey}`}
          className="absolute inset-0 w-full h-full object-cover"
          controls
          autoPlay
          muted
        >
          <source src={camera.url} type="application/x-mpegURL" />
          Din nettleser støtter ikke video-avspilling.
        </video>
      );

    case 'image':
      // Statisk bilde eller snapshot
      return (
        <img
          key={`${camera.id}-${refreshKey}`}
          src={camera.url}
          alt={camera.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      );

    case 'iframe':
    default:
      // iframe for web-baserte kamera-interfaces
      return (
        <iframe
          key={`${camera.id}-${refreshKey}`}
          src={camera.url}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
  }
}

export default function CameraSection({
  buildingId,
  cameras,
}: CameraSectionProps) {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [fullscreenCamera, setFullscreenCamera] = useState<CameraWithType | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newCamera, setNewCamera] = useState({ 
    name: "", 
    url: "",
    streamType: 'iframe' as 'iframe' | 'mjpeg' | 'hls' | 'image'
  });
  const [loading, setLoading] = useState(false);

  const handleAddCamera = async () => {
    if (!user || !newCamera.name || !newCamera.url) {
      toast.error("Vennligst fyll ut alle feltene");
      return;
    }

    setLoading(true);
    try {
      const camera: CameraWithType = {
        id: Date.now().toString(),
        name: newCamera.name,
        url: newCamera.url,
        streamType: newCamera.streamType,
        addedAt: Timestamp.now(),
      };

      const buildingRef = doc(db, "users", user.uid, "buildings", buildingId);
      await updateDoc(buildingRef, {
        cameras: [...cameras, camera],
        updatedAt: Timestamp.now(),
      });

      toast.success("Kamera lagt til!");
      setNewCamera({ name: "", url: "", streamType: 'iframe' });
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding camera:", error);
      toast.error("Kunne ikke legge til kamera");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCamera = async (cameraId: string) => {
    if (!user) return;

    try {
      const updatedCameras = cameras.filter((c) => c.id !== cameraId);
      const buildingRef = doc(db, "users", user.uid, "buildings", buildingId);
      await updateDoc(buildingRef, {
        cameras: updatedCameras,
        updatedAt: Timestamp.now(),
      });

      toast.success("Kamera fjernet");
    } catch (error) {
      console.error("Error removing camera:", error);
      toast.error("Kunne ikke fjerne kamera");
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success("Kameraer oppdatert");
  };

  return (
    <>
      <Card className="sticky top-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CameraIcon className="h-5 w-5" />
              <CardTitle className="font-headline">Kameraer</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                title="Oppdater kameraer"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            {cameras.length}{" "}
            {cameras.length === 1 ? "kamera tilkoblet" : "kameraer tilkoblet"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cameras.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CameraIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Ingen kameraer lagt til ennå</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Legg til kamera
              </Button>
            </div>
          ) : (
            cameras.map((camera) => (
              <Card key={camera.id} className="overflow-hidden">
                <CardHeader className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium">
                        {camera.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(camera as CameraWithType).streamType || 'iframe'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setFullscreenCamera(camera as CameraWithType)}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveCamera(camera.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-black">
                    <CameraStream camera={camera as CameraWithType} refreshKey={refreshKey} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Camera Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Legg til IP-kamera</DialogTitle>
            <DialogDescription>
              Legg til et kamera ved å oppgi navn, URL og stream-type.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="camera-name">Kameranavn</Label>
              <Input
                id="camera-name"
                placeholder="F.eks. Inngangsparti, Garasje"
                value={newCamera.name}
                onChange={(e) =>
                  setNewCamera({ ...newCamera, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream-type">Stream-type</Label>
              <Select
                value={newCamera.streamType}
                onValueChange={(value: 'iframe' | 'mjpeg' | 'hls' | 'image') =>
                  setNewCamera({ ...newCamera, streamType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iframe">Iframe (Web-interface)</SelectItem>
                  <SelectItem value="mjpeg">MJPEG Stream</SelectItem>
                  <SelectItem value="hls">HLS Video Stream</SelectItem>
                  <SelectItem value="image">Statisk bilde</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Velg riktig type basert på ditt kamera
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="camera-url">Kamera URL</Label>
              <Input
                id="camera-url"
                placeholder="https://..."
                value={newCamera.url}
                onChange={(e) =>
                  setNewCamera({ ...newCamera, url: e.target.value })
                }
              />
              {newCamera.streamType === 'iframe' && (
                <p className="text-xs text-muted-foreground">
                  Eksempel: http://192.168.1.100:8080
                </p>
              )}
              {newCamera.streamType === 'mjpeg' && (
                <p className="text-xs text-muted-foreground">
                  Eksempel: http://192.168.1.100:8080/video.mjpg
                </p>
              )}
              {newCamera.streamType === 'hls' && (
                <p className="text-xs text-muted-foreground">
                  Eksempel: http://192.168.1.100:8080/stream.m3u8
                </p>
              )}
              {newCamera.streamType === 'image' && (
                <p className="text-xs text-muted-foreground">
                  Eksempel: http://192.168.1.100:8080/snapshot.jpg
                </p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">Tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Bruk <strong>iframe</strong> for web-baserte kameraer</li>
                    <li>Bruk <strong>MJPEG</strong> for de fleste IP-kameraer</li>
                    <li>Bruk <strong>HLS</strong> for moderne streaming</li>
                    <li>Bruk <strong>Image</strong> for snapshots</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setNewCamera({ name: "", url: "", streamType: 'iframe' });
              }}
            >
              Avbryt
            </Button>
            <Button onClick={handleAddCamera} disabled={loading}>
              {loading ? "Legger til..." : "Legg til kamera"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Camera Dialog */}
      {fullscreenCamera && (
        <Dialog
          open={!!fullscreenCamera}
          onOpenChange={() => setFullscreenCamera(null)}
        >
          <DialogContent className="max-w-[95vw] h-[95vh] p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>{fullscreenCamera.name}</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-full bg-black">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setFullscreenCamera(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-2 rounded text-white text-sm font-medium">
                {fullscreenCamera.name}
              </div>
              <CameraStream camera={fullscreenCamera} refreshKey={refreshKey} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}