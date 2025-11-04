import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SensoLogo } from "@/components/icons";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <SensoLogo className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full" asChild>
            <Link href="/dashboard">Login</Link>
        </Button>
        <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
                Sign up
            </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
