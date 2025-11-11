// Filsti: src/components/settings/SettingsClient.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/lib/types";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  UserIcon,
  KeyRound,
  CreditCard,
  Bell,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import SubscriptionSection from "./SubscriptionSection";
import BillingHistorySection from "./BillingHistorySection";

export default function SettingsClient() {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    postalCode: "",
    city: "",
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    weeklyReport: true,
    productUpdates: false,
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
      checkStripeSession();
    }
  }, [user]);

  const checkStripeSession = async () => {
    if (!user) return;

    // Check if we're returning from Stripe Checkout
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const subscriptionSuccess = urlParams.get('subscription_success');

    if (subscriptionSuccess === 'true' && sessionId) {
      console.log('🔄 Verifying Stripe session:', sessionId);
      toast.loading('Verifiserer betaling...');

      try {
        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, userId: user.uid }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          toast.success(`Abonnement aktivert! Du har nå ${data.numberOfSensors} sensor(er).`);
          // Reload user profile to get updated subscription info
          await loadUserProfile();
        } else {
          toast.error('Kunne ikke verifisere betaling. Prøv å refresh siden.');
          console.error('Verification failed:', data);
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        toast.error('Noe gikk galt ved verifisering av betaling.');
      }

      // Clean up URL
      window.history.replaceState({}, '', '/settings');
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as User;
        setUserProfile(data);

        // Populate profile form
        if (data.accountType === "private") {
          setProfileForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
            street: data.address?.street || "",
            postalCode: data.address?.postalCode || "",
            city: data.address?.city || "",
          });
        }

        // Load notification preferences if they exist
        if (userDoc.data().notifications) {
          setNotifications(userDoc.data().notifications);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Kunne ikke laste profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !userProfile) return;

    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);

      if (userProfile.accountType === "private") {
        await updateDoc(userRef, {
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone,
          address: {
            street: profileForm.street,
            postalCode: profileForm.postalCode,
            city: profileForm.city,
          },
        });
      }

      toast.success("Profil oppdatert!");
      loadUserProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Kunne ikke oppdatere profil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passordene stemmer ikke overens");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Passordet må være minst 6 tegn");
      return;
    }

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.newPassword);

      toast.success("Passord endret!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.code === "auth/wrong-password") {
        toast.error("Feil nåværende passord");
      } else {
        toast.error("Kunne ikke endre passord");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        notifications,
      });

      toast.success("Varslingsinnstillinger lagret!");
    } catch (error) {
      console.error("Error saving notifications:", error);
      toast.error("Kunne ikke lagre innstillinger");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto p-6">
        <p>Kunne ikke laste profil</p>
      </div>
    );
  }

  const isBusiness = userProfile.accountType === "business";

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Innstillinger</h1>
        <p className="text-muted-foreground mt-1">
          Administrer din profil, sikkerhet og abonnement
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="profile">
            <UserIcon className="mr-2 h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security">
            <KeyRound className="mr-2 h-4 w-4" />
            Sikkerhet
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <CreditCard className="mr-2 h-4 w-4" />
            Abonnement
          </TabsTrigger>
          <TabsTrigger value="billing">
            <FileText className="mr-2 h-4 w-4" />
            Fakturering
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Varsler
          </TabsTrigger>
        </TabsList>

        {/* PROFIL TAB */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personlig informasjon</CardTitle>
              <CardDescription>
                Oppdater din profilinformasjon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Fornavn</Label>
                  <Input
                    id="firstName"
                    value={profileForm.firstName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, firstName: e.target.value })
                    }
                    disabled={isBusiness}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Etternavn</Label>
                  <Input
                    id="lastName"
                    value={profileForm.lastName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, lastName: e.target.value })
                    }
                    disabled={isBusiness}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input id="email" value={userProfile.email} disabled />
                <p className="text-xs text-muted-foreground">
                  E-post kan ikke endres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="street">Gateadresse</Label>
                <Input
                  id="street"
                  value={profileForm.street}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, street: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postnummer</Label>
                  <Input
                    id="postalCode"
                    value={profileForm.postalCode}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        postalCode: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Sted</Label>
                  <Input
                    id="city"
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, city: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lagre endringer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SIKKERHET TAB */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Endre passord</CardTitle>
              <CardDescription>
                Oppdater ditt passord for økt sikkerhet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Nåværende passord</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nytt passord</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bekreft nytt passord</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleChangePassword} disabled={changingPassword}>
                {changingPassword && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Endre passord
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Logg ut</CardTitle>
              <CardDescription>
                Avslutt din sesjon og logg ut av SensoGuard
              </CardDescription>
            </CardHeader>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="destructive" onClick={handleLogout}>
                Logg ut
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ABONNEMENT TAB */}
        <TabsContent value="subscription">
          <SubscriptionSection userProfile={userProfile} />
        </TabsContent>

        {/* FAKTURERING TAB */}
        <TabsContent value="billing">
          <BillingHistorySection userProfile={userProfile} />
        </TabsContent>

        {/* VARSLER TAB */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Varslingsinnstillinger</CardTitle>
              <CardDescription>
                Administrer hvordan du ønsker å motta varsler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-postvarsler</Label>
                  <p className="text-sm text-muted-foreground">
                    Motta varsler om sensorstatus via e-post
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS-varsler</Label>
                  <p className="text-sm text-muted-foreground">
                    Motta kritiske varsler via SMS
                  </p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, sms: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ukentlig rapport</Label>
                  <p className="text-sm text-muted-foreground">
                    Få en ukentlig oppsummering av sensordata
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklyReport: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Produktoppdateringer</Label>
                  <p className="text-sm text-muted-foreground">
                    Motta nyheter om nye funksjoner og oppdateringer
                  </p>
                </div>
                <Switch
                  checked={notifications.productUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      productUpdates: checked,
                    })
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSaveNotifications} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lagre preferanser
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <Skeleton className="h-12 w-full mb-8" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}