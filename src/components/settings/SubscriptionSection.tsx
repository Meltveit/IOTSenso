// Filsti: src/components/settings/SubscriptionSection.tsx

"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, CreditCard, FileText, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Sensor } from "@/lib/types";
import Link from "next/link";
import { getPriceBreakdown, formatPrice } from "@/lib/stripe-pricing";

interface SubscriptionSectionProps {
  userProfile: User;
}

export default function SubscriptionSection({
  userProfile,
}: SubscriptionSectionProps) {
  const { user } = useAuth();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [desiredSensorCount, setDesiredSensorCount] = useState(1);

  const isBusiness = userProfile.accountType === "business";
  const currentSensorCount = sensors.length;
  const subscribedSensorCount = userProfile.numberOfSensors || 0;
  const hasActiveSubscription = userProfile.subscriptionStatus === "active";

  // Bedrifter ser pris uten MVA, private ser pris med MVA
  const includeVat = !isBusiness;

  useEffect(() => {
    if (user) {
      loadSensors();
    }
  }, [user]);

  useEffect(() => {
    setDesiredSensorCount(Math.max(subscribedSensorCount, currentSensorCount, 1));
  }, [subscribedSensorCount, currentSensorCount]);

  const loadSensors = () => {
    if (!user) return;

    const sensorsQuery = query(
      collection(db, "users", user.uid, "sensors")
    );

    const unsubscribe = onSnapshot(sensorsQuery, (snapshot) => {
      const sensorsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sensor[];
      setSensors(sensorsData);
      setLoading(false);
    });

    return unsubscribe;
  };

  const handleUpdateSubscription = async () => {
    if (!user) return;

    if (desiredSensorCount < currentSensorCount) {
      toast.error(
        `Du kan ikke abonnere på færre sensorer (${desiredSensorCount}) enn du allerede har registrert (${currentSensorCount}). Fjern sensorer først.`
      );
      return;
    }

    setUpdating(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/manage-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          quantity: desiredSensorCount,
          accountType: userProfile.accountType,
          customerId: userProfile.stripeCustomerId,
          subscriptionId: userProfile.stripeSubscriptionId,
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to Stripe Checkout for new subscriptions
        window.location.href = data.checkoutUrl;
      } else if (data.success) {
        // Show the message from the API response
        toast.success(data.message || "Abonnement oppdatert!", {
          duration: 5000,
        });

        // Oppdater Firestore umiddelbart ved oppgradering
        if (desiredSensorCount > subscribedSensorCount) {
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          await updateDoc(doc(db, "users", user.uid), {
            numberOfSensors: desiredSensorCount,
          });
        }
      } else {
        throw new Error(data.error || "Kunne ikke oppdatere abonnement");
      }
    } catch (error: any) {
      console.error("Error updating subscription:", error);
      toast.error(error.message || "Kunne ikke oppdatere abonnement");
    } finally {
      setUpdating(false);
    }
  };

  const priceBreakdown = getPriceBreakdown(desiredSensorCount, includeVat);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const hasExcessSensors = currentSensorCount > subscribedSensorCount && hasActiveSubscription;

  return (
    <div className="space-y-6">
      {hasExcessSensors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Advarsel: For mange sensorer</AlertTitle>
          <AlertDescription>
            Du har {currentSensorCount} sensorer registrert, men abonnerer bare på {subscribedSensorCount}.
            Oppdater abonnementet ditt eller fjern {currentSensorCount - subscribedSensorCount} sensor(er).
          </AlertDescription>
        </Alert>
      )}

      {/* Hovedkort */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Abonnementsoversikt</CardTitle>
              <CardDescription>
                {isBusiness
                  ? "Bedriftsabonnement - Faktura sendes månedlig (ekskl. MVA)"
                  : "Privat abonnement - Betaling via kort (inkl. MVA)"}
              </CardDescription>
            </div>
            <Badge variant={hasActiveSubscription ? "default" : "secondary"}>
              {hasActiveSubscription ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Aktiv
                </>
              ) : (
                <>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Inaktiv
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status oversikt */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Registrerte sensorer
              </div>
              <div className="text-2xl font-bold">{currentSensorCount}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Abonnerte sensorer
              </div>
              <div className="text-2xl font-bold">{subscribedSensorCount}</div>
            </div>
            <div className="rounded-lg border p-4 bg-accent/10">
              <div className="text-sm text-muted-foreground mb-1">
                Ledige plasser
              </div>
              <div className="text-2xl font-bold text-accent">
                {Math.max(0, subscribedSensorCount - currentSensorCount)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Endre abonnement */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {hasActiveSubscription ? "Endre abonnement" : "Opprett abonnement"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Velg hvor mange sensorer du vil abonnere på. Du må abonnere på minst like mange som du har registrert.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sensorCount">Antall sensorer</Label>
                <Input
                  id="sensorCount"
                  type="number"
                  min={currentSensorCount || 1}
                  value={desiredSensorCount}
                  onChange={(e) => setDesiredSensorCount(parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum: {currentSensorCount || 1} (du har {currentSensorCount} sensor{currentSensorCount !== 1 ? 'er' : ''})
                </p>
                {desiredSensorCount < subscribedSensorCount && hasActiveSubscription && (
                  <Alert className="mt-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Nedgradering:</strong> Du betaler ut inneværende måned. Endringen trer i kraft ved neste fakturering.
                    </AlertDescription>
                  </Alert>
                )}
                {desiredSensorCount > subscribedSensorCount && hasActiveSubscription && (
                  <Alert className="mt-2 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-xs text-green-800 dark:text-green-200">
                      <strong>Oppgradering:</strong> Får umiddelbart flere plasser. Belastes proporsjonalt.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label>Pris per sensor</Label>
                <div className="h-10 flex items-center">
                  <span className="text-2xl font-bold">
                    {formatPrice(priceBreakdown.pricePerSensor)}/mnd
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isBusiness ? "Ekskl. MVA - " : "Inkl. 25% MVA - "}
                  Volumrabatt anvendes automatisk
                </p>
              </div>
            </div>

            {/* Prissammendrag */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {desiredSensorCount} sensor{desiredSensorCount !== 1 ? 'er' : ''} × {formatPrice(priceBreakdown.pricePerSensor)}
                </span>
                <span className="font-medium">
                  {formatPrice(priceBreakdown.subtotal)}
                </span>
              </div>
              
              {includeVat && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MVA (25%)</span>
                  <span className="font-medium">
                    {formatPrice(priceBreakdown.vat)}
                  </span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total per måned {isBusiness ? "(ekskl. MVA)" : "(inkl. MVA)"}
                  </div>
                  <div className="text-3xl font-bold text-accent">
                    {formatPrice(priceBreakdown.total)}
                  </div>
                </div>
              </div>

              {isBusiness && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    MVA (25%) vil bli lagt til på fakturaen: {formatPrice(priceBreakdown.vat)}
                    <br />
                    <strong>Total inkl. MVA: {formatPrice(priceBreakdown.total * 1.25)}</strong>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <Separator />

          {/* Aktive sensorer */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Aktive sensorer</h3>
            {currentSensorCount === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/50">
                <p className="text-muted-foreground mb-2">Ingen sensorer registrert ennå</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {hasActiveSubscription 
                    ? "Du har plass til sensorer. Legg til en nå!"
                    : "Opprett et abonnement først før du legger til sensorer."}
                </p>
                {hasActiveSubscription && (
                  <Button asChild>
                    <Link href="/sensors">Legg til sensor</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sensornavn</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">
                        Pris/mnd {isBusiness ? "(ekskl. MVA)" : "(inkl. MVA)"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensors.map((sensor, index) => {
                      const isOverLimit = index >= subscribedSensorCount;
                      return (
                        <TableRow key={sensor.id} className={isOverLimit ? "bg-destructive/10" : ""}>
                          <TableCell className="font-medium">
                            {sensor.name}
                            {isOverLimit && (
                              <Badge variant="destructive" className="ml-2">
                                Over grense
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="capitalize">{sensor.type}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                sensor.status === "ok"
                                  ? "default"
                                  : sensor.status === "critical"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {sensor.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(priceBreakdown.pricePerSensor)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Betalingsmetode info */}
          {isBusiness ? (
            <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Fakturabetaling
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    Faktura sendes til {userProfile.invoiceEmail || userProfile.email} med 30 dagers betalingsfrist.
                    Alle priser er ekskl. 25% MVA.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950">
              <div className="flex gap-3">
                <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    Kortbetaling
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                    Betalingen trekkes automatisk fra ditt kort hver måned. Alle priser inkluderer 25% MVA.
                    {userProfile.stripeCustomerId && (
                      <span> Du kan endre betalingsmetode i Stripe-portalen.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {hasActiveSubscription
              ? desiredSensorCount > subscribedSensorCount
                ? "Oppgraderinger gjelder umiddelbart"
                : desiredSensorCount < subscribedSensorCount
                ? "Nedgraderinger trer i kraft ved neste fakturering"
                : "Ingen endringer"
              : "Opprett abonnement for å starte overvåking"}
          </div>
          <Button
            onClick={handleUpdateSubscription}
            disabled={updating || (hasActiveSubscription && desiredSensorCount === subscribedSensorCount)}
          >
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hasActiveSubscription ? "Oppdater abonnement" : "Opprett abonnement"}
          </Button>
        </CardFooter>
      </Card>

      {/* Stripe portal for private */}
      {!isBusiness && userProfile.stripeCustomerId && (
        <Card>
          <CardHeader>
            <CardTitle>Administrer i Stripe</CardTitle>
            <CardDescription>
              Endre betalingsmetode, se fakturaer og administrer abonnement
            </CardDescription>
          </CardHeader>
          <CardFooter className="border-t px-6 py-4">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  if (!user) return;
                  const idToken = await user.getIdToken();
                  const response = await fetch("/api/stripe/create-portal-session", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${idToken}`,
                    },
                  });
                  const data = await response.json();
                  if (data.url) {
                    window.location.href = data.url;
                  } else {
                    throw new Error(data.error || "Kunne ikke åpne Stripe-portal");
                  }
                } catch (error: any) {
                  console.error("Error opening portal:", error);
                  toast.error("Kunne ikke åpne Stripe-portal");
                }
              }}
            >
              Åpne Stripe-portal
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}