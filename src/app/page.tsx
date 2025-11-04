import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, TrendingUp, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SensoGuardLogo } from "@/components/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const heroImage = PlaceHolderImages.find(p => p.id === "hero");

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <SensoGuardLogo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground">
            SensoGuard
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-foreground">
              Proactive Sensor Monitoring
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              SensoGuard provides real-time insights and predictive maintenance to protect your assets before issues arise.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Sign Up Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">View Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold font-headline">Smart, Simple, Secure.</h2>
              <p className="mt-4 text-muted-foreground">
                Our platform is designed for ease of use without compromising on power. Get set up in minutes and gain peace of mind.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Real-time Data</h3>
                    <p className="text-sm text-muted-foreground">Instantly visualize sensor readings from anywhere.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Predictive Alerts</h3>
                    <p className="text-sm text-muted-foreground">Leverage AI to anticipate failures before they happen.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Easy Integration</h3>
                    <p className="text-sm text-muted-foreground">Connect your MQTT-enabled sensors seamlessly.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-secondary py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Core Features</h2>
              <p className="mt-2 text-muted-foreground">Everything you need for comprehensive sensor management.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard icon={Zap} title="Real-time Monitoring" description="Live dashboard with graphs and status indicators for immediate insights." />
              <FeatureCard icon={Shield} title="Threshold Alerts" description="Configure custom warning and critical thresholds and get notified instantly." />
              <FeatureCard icon={TrendingUp} title="Predictive Maintenance" description="AI-powered analysis to predict failures and suggest proactive actions." />
              <FeatureCard icon={CheckCircle} title="Automated Reporting" description="Receive summarized weekly reports to track trends and performance." />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SensoGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <Card>
    <CardHeader className="items-center">
      <div className="bg-primary/10 p-3 rounded-full">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <CardTitle className="font-headline text-xl mt-4">{title}</CardTitle>
    </CardHeader>
    <CardContent className="text-center text-muted-foreground text-sm">
      {description}
    </CardContent>
  </Card>
);
