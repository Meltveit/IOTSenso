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

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('private');

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
      setError('Vennligst fyll ut alle obligatoriske felt');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passordene matcher ikke');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Passordet må være minst 6 tegn');
      return false;
    }

    if (!formData.acceptTerms) {
      setError('Du må akseptere vilkårene');
      return false;
    }

    if (accountType === 'private') {
      if (!formData.firstName || !formData.lastName) {
        setError('Vennligst fyll ut fornavn og etternavn');
        return false;
      }
    } else {
      if (
        !formData.companyName ||
        !formData.organizationNumber ||
        !formData.contactPersonFirstName ||
        !formData.contactPersonLastName ||
        !formData.billingAddressStreet ||
        !formData.billingAddressPostalCode ||
        !formData.billingAddressCity
      ) {
        setError('Vennligst fyll ut alle obligatoriske felt for bedrift');
        return false;
      }

      if (formData.organizationNumber && !/^\d{9}$/.test(formData.organizationNumber)) {
        setError('Organisasjonsnummer må være 9 siffer');
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
            street: formData.billingAddressStreet!,
            postalCode: formData.billingAddressPostalCode!,
            city: formData.billingAddressCity!,
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
      let errorMessage = 'En feil oppstod ved registrering. Prøv igjen.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'E-postadressen er allerede i bruk';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Passordet er for svakt';
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
        <CardTitle className="font-headline text-2xl">Opprett konto</CardTitle>
        <CardDescription>
          Velg kontotype og fyll ut informasjonen under
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
            <TabsTrigger value="private">Privatperson</TabsTrigger>
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
                  placeholder="9 siffer"
                  value={formData.organizationNumber || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPersonFirstName">Kontaktperson fornavn *</Label>
                  <Input
                    id="contactPersonFirstName"
                    value={formData.contactPersonFirstName || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPersonLastName">Kontaktperson etternavn *</Label>
                  <Input
                    id="contactPersonLastName"
                    value={formData.contactPersonLastName || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contactPersonTitle">Stillingstittel</Label>
                <Input
                  id="contactPersonTitle"
                  value={formData.contactPersonTitle || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="billingAddressStreet">Faktureringsadresse (gate) *</Label>
                <Input
                  id="billingAddressStreet"
                  value={formData.billingAddressStreet || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billingAddressPostalCode">Postnummer *</Label>
                  <Input
                    id="billingAddressPostalCode"
                    type="text"
                    inputMode="numeric"
                    value={formData.billingAddressPostalCode || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="billingAddressCity">Poststed *</Label>
                  <Input
                    id="billingAddressCity"
                    value={formData.billingAddressCity || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="invoiceEmail">Faktura e-post (hvis annen enn hovedepost)</Label>
                <Input
                  id="invoiceEmail"
                  type="email"
                  value={formData.invoiceEmail || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfSensors">Estimert antall sensorer</Label>
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
                  <Label htmlFor="department">Avdeling</Label>
                  <Input
                    id="department"
                    value={formData.department || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="referenceNumber">Referansenummer (for fakturering)</Label>
                <Input
                  id="referenceNumber"
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
                Minst 6 tegn
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

            <div className="flex items-center space-x-2 pt-2">
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
                Jeg aksepterer{' '}
                <Link href="/terms" className="underline hover:text-primary">
                  vilkårene
                </Link>{' '}
                og{' '}
                <Link href="/privacy" className="underline hover:text-primary">
                  personvernserklæringen
                </Link>
              </Label>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full !mt-6" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              {loading ? 'Oppretter konto...' : 'Opprett konto'}
            </Button>
          </form>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="text-center text-sm">
          Har du allerede en konto?{' '}
          <Link href="/login" className="underline">
            Logg inn
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
