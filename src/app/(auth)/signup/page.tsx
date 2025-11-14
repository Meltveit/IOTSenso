'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { SensoLogo } from '@/components/icons';
import Link from 'next/link';
import { AccountType, SignupFormData, PrivateUser, BusinessUser } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PrivacyPolicyModal from '@/components/legal/PrivacyPolicyModal';
import TermsOfServiceModal from '@/components/legal/TermsOfServiceModal';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('private');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [formData, setFormData] = useState<Partial<SignupFormData>>({
    accountType: 'private',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.phone) {
      setError('Vennligst fyll ut alle obligatoriske felt (*).');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passordene er ikke like.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Passordet må bestå av minst 6 tegn.');
      return false;
    }

    if (!formData.acceptTerms) {
      setError('Du må godta vilkårene for å fortsette.');
      return false;
    }

    if (accountType === 'private') {
      if (!formData.firstName || !formData.lastName) {
        setError('Vennligst fyll ut fornavn og etternavn.');
        return false;
      }
    } else {
      if (
        !formData.companyName ||
        !formData.organizationNumber ||
        !formData.contactPersonFirstName ||
        !formData.contactPersonLastName ||
        !formData.billingStreet ||
        !formData.billingPostalCode ||
        !formData.billingCity
      ) {
        setError('Vennligst fyll ut alle obligatoriske felt for bedrifter (*).');
        return false;
      }

      if (formData.organizationNumber && !/^\d{9}$/.test(formData.organizationNumber)) {
        setError('Organisasjonsnummer må bestå av 9 siffer.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const commonData = {
        accountType,
        email: formData.email!,
        phone: formData.phone!,
      };

      let userData: Partial<PrivateUser | BusinessUser>;

      if (accountType === 'private') {
        userData = {
          ...commonData,
          accountType: 'private',
          firstName: formData.firstName!,
          lastName: formData.lastName!,
        };
      } else {
        userData = {
          ...commonData,
          accountType: 'business',
          companyName: formData.companyName!,
          organizationNumber: formData.organizationNumber!,
          contactPerson: {
            firstName: formData.contactPersonFirstName!,
            lastName: formData.contactPersonLastName!,
            title: formData.contactPersonTitle,
          },
          billingAddress: {
            street: formData.billingStreet!,
            postalCode: formData.billingPostalCode!,
            city: formData.billingCity!,
          },
          invoiceEmail: formData.invoiceEmail,
          numberOfSensors: formData.numberOfSensors,
          department: formData.department,
          referenceNumber: formData.referenceNumber,
        };
      }

      await signup(formData.email!, formData.password!, userData);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage = 'Noe gikk galt under registreringen. Vennligst prøv igjen.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'En konto med denne e-postadressen finnes allerede.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Passordet er for svakt. Bruk minst 6 tegn.';
      }
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Registrering feilet',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl my-8">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <SensoLogo className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="font-headline text-2xl">Opprett en ny konto</CardTitle>
        <CardDescription>
          Velg kontotype og fyll ut informasjonen nedenfor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={accountType}
          onValueChange={(value) => {
            const newAccountType = value as AccountType;
            setAccountType(newAccountType);
            setFormData((prev) => ({ ...prev, accountType: newAccountType }));
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="private">Privat</TabsTrigger>
            <TabsTrigger value="business">Bedrift</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TabsContent value="private" className="m-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Fornavn *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Etternavn *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="business" className="m-0 space-y-4">
              <div>
                <Label htmlFor="companyName">Bedriftsnavn *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="organizationNumber">Organisasjonsnummer *</Label>
                <Input
                  id="organizationNumber"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{9}"
                  placeholder="9-sifret nummer"
                  value={formData.organizationNumber || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPersonFirstName">Kontaktperson: Fornavn *</Label>
                  <Input
                    id="contactPersonFirstName"
                    value={formData.contactPersonFirstName || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPersonLastName">Kontaktperson: Etternavn *</Label>
                  <Input
                    id="contactPersonLastName"
                    value={formData.contactPersonLastName || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contactPersonTitle">Stilling/tittel</Label>
                <Input
                  id="contactPersonTitle"
                  value={formData.contactPersonTitle || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="billingStreet">Fakturaadresse *</Label>
                <Input
                  id="billingStreet"
                  value={formData.billingStreet || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billingPostalCode">Postnummer *</Label>
                  <Input
                    id="billingPostalCode"
                    type="text"
                    inputMode="numeric"
                    value={formData.billingPostalCode || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="billingCity">Poststed *</Label>
                  <Input
                    id="billingCity"
                    value={formData.billingCity || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="invoiceEmail">Faktura-e-post (om annen)</Label>
                <Input
                  id="invoiceEmail"
                  type="email"
                  value={formData.invoiceEmail || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfSensors">Antall sensorer (estimat)</Label>
                  <Input
                    id="numberOfSensors"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={formData.numberOfSensors?.toString() || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Avdeling/prosjekt</Label>
                  <Input
                    id="department"
                    value={formData.department || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="referenceNumber">Referanse/PO-nummer</Label>
                <Input
                  id="referenceNumber"
                  placeholder="For fakturering"
                  value={formData.referenceNumber || ''}
                  onChange={handleChange}
                />
              </div>
            </TabsContent>

            <div>
              <Label htmlFor="email">E-post *</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@epost.no"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+47 123 45 678"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Passord *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Må bestå av minst 6 tegn.
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Bekreft passord *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, acceptTerms: checked as boolean })
                }
              />
              <Label
                htmlFor="acceptTerms"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Jeg godtar SENSO sine{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTermsModal(true);
                  }}
                  className="underline hover:text-primary"
                >
                  brukervilkår
                </button>{' '}
                og{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPrivacyModal(true);
                  }}
                  className="underline hover:text-primary"
                >
                  personvernerklæring
                </button>
                .
              </Label>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full !mt-6" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              {loading ? 'Oppretter konto...' : 'Fullfør registrering'}
            </Button>
          </form>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="text-center text-sm">
          Har du allerede en konto?{' '}
          <Link href="/login" className="underline">
            Logg inn her
          </Link>
        </div>
      </CardFooter>

      {/* Legal modals */}
      <PrivacyPolicyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
      <TermsOfServiceModal open={showTermsModal} onOpenChange={setShowTermsModal} />
    </Card>
  );
}
