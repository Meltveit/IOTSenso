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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CheckCircle, AlertCircle, CreditCard, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Sensor } from "@/lib/types";
import Link from "next/link";

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
  const [sensorCount, setSensorCount] = useState(0);

  const isBusiness = userProfile.accountType === "business";
  const PRICE_PER_SENSOR = 79;

  useEffect(() => {
    if (user) {
      loadSensors();
    }
  }, [user]);

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
      setSensorCount(sensorsData.length);
      setLoading(false);
    });

    return unsubscribe;
  };

  const handleUpdateSubscription = async () => {
    if (!user) return;

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
          quantity: sensorCount,
          accountType: userProfile.accountType,
          customerId: userProfile.stripeCustomerId,
          subscriptionId: userProfile.stripeSubscriptionId,
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.success) {
        toast.success(
          isBusiness
            ? "Abonnement oppdatert! Faktura sendes til din e-post."
            : "Abonnement oppdatert!"
        );
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

  const totalMonthlyCost = sensorCount * PRICE_PER_SENSOR;
  const hasActiveSubscription = userProfile.subscriptionStatus === "active";

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Abonnementsoversikt</CardTitle>
              <CardDescription>
                {isBusiness
                  ? "Bedriftsabonnement - Faktura sendes månedlig"
                  : "Privat abonnement - Betaling via kort"}
              </CardDescription>
            </div>
            <Badge
              variant={hasActiveSubscription ? "default" : "secondary"}
            >
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Antall sensorer
              </div>
              <div className="text-2xl font-bold">{sensorCount}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground mb-1">
                Pris per sensor
              </div>
              <div className="text-2xl font-bold">{PRICE_PER_SENSOR} kr/mnd</div>
            </div>
            <div className="rounded-lg border p-4 bg-accent/10">
              <div className="text-sm text-muted-foreground mb-1">
                Total per måned
              </div>
              <div className="text-2xl font-bold text-accent">
                {totalMonthlyCost} kr
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Aktive sensorer</h3>
            {sensors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Ingen sensorer registrert ennå</p>
                <Button className="mt-4" asChild>
                  <Link href="/sensors">Legg til sensor</Link>
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sensornavn</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Pris/mnd</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sensors.map((sensor) => (
                      <TableRow key={sensor.id}>
                        <TableCell className="font-medium">
                          {sensor.name}
                        </TableCell>
                        <TableCell className="capitalize">
                          {sensor.type}
                        </TableCell>
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
                          {PRICE_PER_SENSOR} kr
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {isBusiness ? (
            <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Fakturabetaling
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    Faktura sendes til {userProfile.invoiceEmail || userProfile.email} 
                    med 30 dagers betalingsfrist.
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
                    Betalingen trekkes automatisk fra ditt kort hver måned.
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
            {sensorCount === 0
              ? "Legg til sensorer for å starte abonnement"
              : hasActiveSubscription
              ? "Abonnementet oppdateres automatisk"
              : "Aktiver abonnement for å starte overvåking"}
          </div>
          <Button
            onClick={handleUpdateSubscription}
            disabled={updating || sensorCount === 0}
          >
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hasActiveSubscription ? "Oppdater abonnement" : "Aktiver abonnement"}
          </Button>
        </CardFooter>
      </Card>

      {!isBusiness && userProfile.stripeCustomerId && (
        <Card>
          <CardHeader>
            <CardTitle>Administrer abonnement i Stripe</CardTitle>
            <CardDescription>
              Endre betalingsmetode, se fakturaer og administrer abonnement
            </CardDescription>
          </CardHeader>
          <CardFooter className="border-t px-6 py-4">
            <Button 
              variant="outline"
              onClick={() => window.open(`https://billing.stripe.com/p/login/test_${userProfile.stripeCustomerId}`, '_blank')}
            >
              Åpne Stripe-portal
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
