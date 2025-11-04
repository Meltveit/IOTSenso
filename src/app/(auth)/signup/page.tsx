'use client';

import { useState } from 'react';
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
import { SensoLogo } from '@/components/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { PrivateUser } from '@/lib/types';


export default function SignupPage() {
  const router = useRouter();
  const { signup, user, loading } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        const userData: Partial<PrivateUser> = {
            accountType: 'private',
            firstName,
            lastName,
            email,
        };

        await signup(email, password, userData);
        router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign-up Failed',
        description: error.message,
      });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return <Loader2 className="animate-spin" />;
  }

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <SensoLogo className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="font-headline text-2xl">
          Create an Account
        </CardTitle>
        <CardDescription>
          Enter your information to get started with SENSO.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                placeholder="Max"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                placeholder="Robinson"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
