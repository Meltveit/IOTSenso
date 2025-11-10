import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, TrendingUp, Zap, Bot, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SensoLogo } from "@/components/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const heroImage = PlaceHolderImages.find(p => p.id === "hero");

export default function HomePage() {
  return (
    <>
      <section className="relative py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-foreground">
            Proaktiv sensorovervåking
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            SENSO gir sanntidsinnsikt og prediktivt vedlikehold for å beskytte dine eiendeler før problemer oppstår.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Registrer deg nå</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">Se demo</Link>
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
              <h2 className="text-3xl md:text-4xl font-bold font-headline">De skjulte kostnadene ved nedetid</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Uforutsette utstyrsfeil stopper ikke bare produksjonen – de fører til store økonomiske tap og driftsmessige hodepiner.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatColumn value="42%" title="Økning i kostnader" description="Gjennomsnittlig økning i vedlikeholdskostnader når man reagerer på feil i stedet for å forhindre dem." />
            <StatColumn value="$260,000" title="Per time" description="Gjennomsnittlig kostnad for nedetid for en industriell produsent, ifølge Aberdeen Research." />
            <StatColumn value="20%" title="Produksjonstap" description="Typisk tap av produksjonskapasitet på grunn av uplanlagt nedetid og utstyrsfeil." />
          </div>
        </div>
      </section>
      
      <section id="solution" className="py-20">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Fra reaktiv til prediktiv på 3 steg</h2>
            <p className="mt-2 text-muted-foreground">Plattformen vår gjør det enkelt å begynne å overvåke og forutsi utstyrets tilstand.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <HowItWorksStep number="1" title="Koble til sensorene dine" description="Integrer enkelt dine eksisterende MQTT-aktiverte sensorer med plattformen vår på få minutter. Ingen komplisert oppsett kreves." />
            <HowItWorksStep number="2" title="Visualiser sanntidsdata" description="Overvåk alle sensorene dine fra ett enkelt, intuitivt dashbord. Se live datastrømmer og statusindikatorer." />
            <HowItWorksStep number="3" title="Motta prediktive varsler" description="Vår AI analyserer datamønstre for å forutsi feil, og sender deg handlingsrettede varsler før katastrofen inntreffer." />
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">En smartere måte å vedlikeholde på</h2>
            <p className="mt-2 text-muted-foreground">Alt du trenger for omfattende sensorhåndtering og prediktivt vedlikehold.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={Zap} title="Sanntidsovervåking" description="Live dashbord med grafer og statusindikatorer for umiddelbar innsikt." />
            <FeatureCard icon={Shield} title="Terskelvarsler" description="Konfigurer egendefinerte varslings- og kritiske terskler og bli varslet umiddelbart." />
            <FeatureCard icon={TrendingUp} title="Prediktivt vedlikehold" description="AI-drevet analyse for å forutsi feil og foreslå proaktive handlinger." />
            <FeatureCard icon={Bot} title="AI-anbefalinger" description="Få smarte anbefalinger for optimale sensorterskler basert på historiske data." />
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold font-headline">Stolt på av bransjeledere</h2>
                  <p className="mt-2 text-muted-foreground">Se hvordan selskaper som ditt forhindrer nedetid og sparer kostnader.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <TestimonialCard
                      quote="SENSO har forvandlet vedlikeholdsplanen vår. Vi har redusert uplanlagt nedetid med 60 % og kan endelig være proaktive i stedet for reaktive."
                      name="John Doe"
                      title="Driftssjef, Acme Inc."
                      avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                  />
                  <TestimonialCard
                      quote="De prediktive egenskapene er en 'game-changer'. Vi oppdaget en kritisk lagerfeil to uker før den skulle skje, noe som sparte oss for over 100 000 dollar."
                      name="Jane Smith"
                      title="Ledende ingeniør, Stark Industries"
                      avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704e"
                  />
                  <TestimonialCard
                      quote="Som en liten produsent har vi ikke råd til nedetid. SENSO er rimelig, enkelt å sette opp og har gitt oss trygghet."
                      name="Mike Ross"
                      title="Eier, Ross Manufacturing"
                      avatarUrl="https://i.pravatar.cc/150?u=a042581f4e29026704f"
                  />
              </div>
          </div>
      </section>

      <section id="cta" className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-primary text-primary-foreground rounded-lg p-10 lg:p-16 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold font-headline">Klar til å forhindre din neste feil?</h2>
                  <p className="mt-4 max-w-2xl mx-auto text-lg">
                      Slutt å reagere og begynn å forutsi. Kom i gang med SENSO i dag og få full kontroll over utstyrets helse.
                  </p>
                  <div className="mt-8">
                      <Button size="lg" variant="secondary" asChild className="text-primary hover:bg-white/90">
                         <Link href="/signup">Start din gratis prøveperiode</Link>
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
