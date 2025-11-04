import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, TrendingUp, Zap, Bot, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SensoGuardLogo } from "@/components/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const heroImage = PlaceHolderImages.find(p => p.id === "hero");

export default function HomePage() {
  return (
    <>
      <section className="relative py-20 md:py-32 bg-background">
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
           <div className="mt-16 rounded-lg overflow-hidden shadow-2xl max-w-4xl mx-auto">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={1200}
                height={675}
                className="w-full h-auto object-cover"
                data-ai-hint={heroImage.imageHint}
              />
            )}
          </div>
        </div>
      </section>
      
      <section id="problem" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">The Hidden Costs of Downtime</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Unforeseen equipment failures don't just stop production—they cascade into major financial losses and operational headaches.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatColumn value="42%" title="Increase in Costs" description="Average increase in maintenance costs when reacting to failures instead of preventing them." />
            <StatColumn value="$260,000" title="Per Hour" description="The average cost of downtime for an industrial manufacturer, according to Aberdeen Research." />
            <StatColumn value="20%" title="Production Loss" description="Typical production capacity loss due to unplanned downtime and equipment failure." />
          </div>
        </div>
      </section>
      
      <section id="solution" className="py-20">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">From Reactive to Predictive in 3 Steps</h2>
            <p className="mt-2 text-muted-foreground">Our platform makes it simple to start monitoring and predicting equipment health.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <HowItWorksStep number="1" title="Connect Your Sensors" description="Easily integrate your existing MQTT-enabled sensors with our platform in minutes. No complex setup required." />
            <HowItWorksStep number="2" title="Visualize Real-time Data" description="Monitor all your sensors from a single, intuitive dashboard. See live data streams and status indicators." />
            <HowItWorksStep number="3" title="Receive Predictive Alerts" description="Our AI analyzes data patterns to predict failures, sending you actionable alerts before disaster strikes." />
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">A Smarter Way to Maintain</h2>
            <p className="mt-2 text-muted-foreground">Everything you need for comprehensive sensor management and predictive maintenance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={Zap} title="Real-time Monitoring" description="Live dashboard with graphs and status indicators for immediate insights." />
            <FeatureCard icon={Shield} title="Threshold Alerts" description="Configure custom warning and critical thresholds and get notified instantly." />
            <FeatureCard icon={TrendingUp} title="Predictive Maintenance" description="AI-powered analysis to predict failures and suggest proactive actions." />
            <FeatureCard icon={Bot} title="AI Recommendations" description="Get smart recommendations for optimal sensor thresholds based on historical data." />
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold font-headline">Trusted by Industry Leaders</h2>
                  <p className="mt-2 text-muted-foreground">See how companies like yours are preventing downtime and saving costs.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <TestimonialCard
                      quote="SensoGuard has transformed our maintenance schedule. We've cut unplanned downtime by 60% and can finally be proactive instead of reactive."
                      name="John Doe"
                      title="Operations Manager, Acme Inc."
                      avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                  />
                  <TestimonialCard
                      quote="The predictive capabilities are a game-changer. We caught a critical bearing failure two weeks before it was due to happen, saving us over $100,000."
                      name="Jane Smith"
                      title="Lead Engineer, Stark Industries"
                      avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704e"
                  />
                  <TestimonialCard
                      quote="As a small manufacturer, we can't afford downtime. SensoGuard is affordable, easy to set up, and has given us peace of mind."
                      name="Mike Ross"
                      title="Owner, Ross Manufacturing"
                      avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704f"
                  />
              </div>
          </div>
      </section>

      <section id="cta" className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-primary text-primary-foreground rounded-lg p-10 lg:p-16 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold font-headline">Ready to Prevent Your Next Failure?</h2>
                  <p className="mt-4 max-w-2xl mx-auto text-lg">
                      Stop reacting and start predicting. Get started with SensoGuard today and gain full control over your equipment's health.
                  </p>
                  <div className="mt-8">
                      <Button size="lg" variant="secondary" asChild className="text-primary hover:bg-white/90">
                         <Link href="/signup">Start Your Free Trial</Link>
                      </Button>
                  </div>
              </div>
          </div>
      </section>
    </>
  );
}

const StatColumn = ({ value, title, description }: { value: string, title: string, description: string }) => (
    <div className="flex flex-col items-center gap-2">
        <p className="text-5xl font-bold text-primary font-headline">{value}</p>
        <h3 className="text-lg font-semibold font-headline">{title}</h3>
        <p className="text-muted-foreground max-w-xs">{description}</p>
    </div>
)

const HowItWorksStep = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <div className="flex flex-col items-center gap-4">
    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary font-bold text-2xl font-headline">
      {number}
    </div>
    <h3 className="text-xl font-semibold font-headline">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <Card className="text-center bg-card">
    <CardHeader className="items-center">
      <div className="bg-primary/10 p-3 rounded-full">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <CardTitle className="font-headline text-xl mt-4">{title}</CardTitle>
    </CardHeader>
    <CardContent className="text-muted-foreground text-sm">
      {description}
    </CardContent>
  </Card>
);

const TestimonialCard = ({ quote, name, title, avatarUrl }: { quote: string, name: string, title: string, avatarUrl: string }) => (
    <Card className="flex flex-col justify-between">
        <CardContent className="pt-6">
            <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-accent fill-accent" />)}
            </div>
            <p className="text-muted-foreground italic">&quot;{quote}&quot;</p>
        </CardContent>
        <CardHeader className="flex-row gap-4 items-center">
            <Avatar>
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-muted-foreground">{title}</p>
            </div>
        </CardHeader>
    </Card>
);
