'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/user'; // Importerer den nye funksjonen
import type { User, PrivateUser, BusinessUser } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, KeyRound, CreditCard, Plus, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsClient() {
    const { user: authUser, loading: authLoading } = useAuth(); // Auth-bruker fra context
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [sensorCount, setSensorCount] = useState(0);

    useEffect(() => {
        if (authLoading) return; // Venter til auth-sjekk er ferdig

        if (authUser) {
            getUserProfile(authUser.uid).then(profile => {
                if (profile) {
                    setUserProfile(profile);
                    if (profile.accountType === 'business') {
                        setSensorCount(profile.numberOfSensors || 0);
                    }
                }
                setProfileLoading(false);
            });
        } else {
            setProfileLoading(false);
        }
    }, [authUser, authLoading]);

    if (authLoading || profileLoading) {
        return <SettingsSkeleton />;
    }

    if (!userProfile) {
        return <p>Kunne ikke laste brukerprofil. Vennligst prøv å logge inn på nytt.</p>;
    }

    const handleSensorChange = (amount: number) => {
        setSensorCount((prev: number) => Math.max(0, prev + amount));
    }

    const costPerSensor = 79;
    const totalMonthlyCost = sensorCount * costPerSensor;
    const isBusiness = userProfile.accountType === 'business';

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Kontoinnstillinger</h1>
                <p className="text-muted-foreground">Administrer din profil, sikkerhet og abonnement.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                 <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                    <TabsTrigger value="profile"><UserIcon className="mr-2 h-4 w-4"/>Profil</TabsTrigger>
                    <TabsTrigger value="security"><KeyRound className="mr-2 h-4 w-4"/>Sikkerhet</TabsTrigger>
                    <TabsTrigger value="subscription"><CreditCard className="mr-2 h-4 w-4"/>Abonnement</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profilinformasjon</CardTitle>
                            <CardDescription>Oppdater dine kontaktdetaljer her.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isBusiness ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Fornavn</Label>
                                        <Input id="firstName" defaultValue={(userProfile as PrivateUser).firstName} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Etternavn</Label>
                                        <Input id="lastName" defaultValue={(userProfile as PrivateUser).lastName} />
                                    </div>
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Firmanavn</Label>
                                        <Input id="companyName" defaultValue={(userProfile as BusinessUser).companyName} />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="contactPersonFirstName">Kontaktperson Fornavn</Label>
                                            <Input id="contactPersonFirstName" defaultValue={(userProfile as BusinessUser).contactPerson?.firstName || ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contactPersonLastName">Kontaktperson Etternavn</Label>
                                            <Input id="contactPersonLastName" defaultValue={(userProfile as BusinessUser).contactPerson?.lastName || ''} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="email">E-postadresse</Label>
                                <Input id="email" type="email" defaultValue={userProfile.email || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" type="tel" defaultValue={userProfile.phone || ''} />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button>Lagre endringer</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                 {/* Sikkerhet og Abonnement tabs gjenstår */}
            </Tabs>
        </div>
    );
}

// Skeleton-komponent forblir den samme
function SettingsSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
            <div className="w-full">
                <Skeleton className="h-10 w-[400px] mb-6" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-2/4 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                        </div>
                         <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                         <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
