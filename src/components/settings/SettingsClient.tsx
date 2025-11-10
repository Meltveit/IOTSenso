'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/user';
import { auth } from '@/lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import type { User, PrivateUser, BusinessUser } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, KeyRound, CreditCard, Plus, Minus, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsClient() {
    const { user: authUser, loading: authLoading } = useAuth();
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({});
    
    const [profileLoading, setProfileLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const [sensorCount, setSensorCount] = useState(0);
    const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
    const [subscriptionMessage, setSubscriptionMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (authLoading) return;
        if (authUser) {
            setProfileLoading(true);
            getUserProfile(authUser.uid).then(profile => {
                if (profile) {
                    setUserProfile(profile);
                    setFormData(profile);
                    setSensorCount(profile.numberOfSensors || 0);
                }
                setProfileLoading(false);
            }).catch(() => {
                setProfileLoading(false);
                setSaveMessage({ type: 'error', text: 'Kunne ikke laste profil.' });
            });
        } else {
            setProfileLoading(false);
        }
    }, [authUser, authLoading]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id.startsWith('contactPerson')) {
            const key = id.split('.')[1] as 'firstName' | 'lastName';
            setFormData(prev => ({ ...prev, contactPerson: { ...((prev as BusinessUser).contactPerson || {}), [key]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleProfileSave = async (e: FormEvent) => {
        e.preventDefault();
        if (!authUser) return;
        setIsSaving(true);
        try {
            await updateUserProfile(authUser.uid, formData);
            setUserProfile(prev => ({ ...(prev || {}), ...formData } as User));
            setSaveMessage({ type: 'success', text: 'Profilen ble lagret!' });
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'En feil oppstod. Prøv igjen.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage({ type: '', text: '' }), 4000);
        }
    };

    const handlePasswordChange = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { setPasswordMessage({ type: 'error', text: 'De nye passordene er ikke like.' }); return; }
        if (!authUser?.email) return;
        setIsChangingPassword(true);
        try {
            const credential = EmailAuthProvider.credential(authUser.email, currentPassword);
            await reauthenticateWithCredential(authUser, credential);
            await updatePassword(authUser, newPassword);
            setPasswordMessage({ type: 'success', text: 'Passordet ble endret!' });
        } catch (error: any) {
            setPasswordMessage({ type: 'error', text: 'En feil oppstod.' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSubscriptionUpdate = async () => {
        if (!authUser || !userProfile) return;
        setIsUpdatingSubscription(true);
        setSubscriptionMessage({ type: '', text: '' });

        try {
            const idToken = await authUser.getIdToken();
            const res = await fetch('/api/manage-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    quantity: sensorCount,
                    accountType: userProfile.accountType,
                    customerId: userProfile.stripeCustomerId,
                    subscriptionId: userProfile.stripeSubscriptionId,
                }),
            });

            const data = await res.json();

            if (res.status === 401) throw new Error('Uautorisert');

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else if (data.success) {
                await updateUserProfile(authUser.uid, { 
                    numberOfSensors: sensorCount, 
                    stripeCustomerId: data.customerId,
                    stripeSubscriptionId: data.subscriptionId,
                    subscriptionStatus: 'active', 
                });
                setUserProfile(prev => ({
                    ...(prev!),
                    numberOfSensors: sensorCount,
                    stripeCustomerId: data.customerId,
                    stripeSubscriptionId: data.subscriptionId,
                    subscriptionStatus: 'active',
                }));
                setSubscriptionMessage({ type: 'success', text: 'Abonnementet er oppdatert!' });
            }
        } catch (error) {
            setSubscriptionMessage({ type: 'error', text: 'En feil oppstod under oppdatering.' });
        } finally {
            setIsUpdatingSubscription(false);
            setTimeout(() => setSubscriptionMessage({ type: '', text: '' }), 5000);
        }
    };

    if (authLoading || profileLoading) return <SettingsSkeleton />;
    if (!userProfile || !formData) return <p>Kunne ikke laste profil.</p>;

    const isBusiness = userProfile.accountType === 'business';
    const costPerSensor = 79;
    const totalMonthlyCost = sensorCount * costPerSensor;
    const originalSensorCount = userProfile.numberOfSensors || 0;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Kontoinnstillinger</h1>
                <p className="text-muted-foreground">Administrer din profil, sikkerhet og abonnement.</p>
            </div>

            <Tabs defaultValue="subscription" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                    <TabsTrigger value="profile"><UserIcon className="mr-2 h-4 w-4"/>Profil</TabsTrigger>
                    <TabsTrigger value="security"><KeyRound className="mr-2 h-4 w-4"/>Sikkerhet</TabsTrigger>
                    <TabsTrigger value="subscription"><CreditCard className="mr-2 h-4 w-4"/>Abonnement</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    {/* Profil-innhold her */}
                </TabsContent>

                <TabsContent value="security" className="mt-6">
                    {/* Sikkerhet-innhold her */}
                </TabsContent>

                <TabsContent value="subscription" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Abonnement og fakturering</CardTitle>
                            <CardDescription>
                                {isBusiness 
                                    ? 'Administrer ditt abonnement. Faktura sendes til din registrerte e-post.' 
                                    : 'Administrer ditt abonnement og se faktureringsdetaljer.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="rounded-lg border bg-background p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className='text-sm font-medium'>Abonnementsstatus</p>
                                    <p className='text-sm font-semibold capitalize'>{userProfile.subscriptionStatus}</p>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="sensorCount" className='font-semibold'>Antall sensorer</Label>
                                <p className="text-sm text-muted-foreground mb-2">Juster antall sensorer du vil overvåke.</p>
                                <div className="flex items-center gap-4 p-4 border rounded-md justify-between">
                                    <div className='flex items-center gap-4'>
                                        <Button variant="outline" size="icon" onClick={() => setSensorCount(p => Math.max(0, p - 1))}><Minus className="h-4 w-4" /></Button>
                                        <span className="text-xl font-bold w-12 text-center">{sensorCount}</span>
                                        <Button variant="outline" size="icon" onClick={() => setSensorCount(p => p + 1)}><Plus className="h-4 w-4" /></Button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{totalMonthlyCost.toLocaleString('nb-NO')} kr / mnd</p>
                                        <p className='text-sm text-muted-foreground'>{sensorCount} sensorer &times; {costPerSensor} kr</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter className="border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <Button onClick={handleSubscriptionUpdate} disabled={isUpdatingSubscription || sensorCount === originalSensorCount}>
                                {isUpdatingSubscription && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Oppdater abonnement
                            </Button>
                            {subscriptionMessage.text && <p className={`text-sm ${subscriptionMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{subscriptionMessage.text}</p>}
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function SettingsSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></div>
            <div className="w-full">
                <Skeleton className="h-10 w-[400px] mb-6" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/4" /><Skeleton className="h-4 w-2/4 mt-2" /></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-10 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                        </div>
                         <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                         <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4"><Skeleton className="h-10 w-24" /></CardFooter>
                </Card>
            </div>
        </div>
    );
}
