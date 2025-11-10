import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, TrendingUp, Zap, Bot, Star, Droplet, Thermometer, Home, Sailboat, Video } from "lucide-react";
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
            Proaktiv overvåking for dine verdier
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            SENSO kombinerer sensor- og videoovervåking for å gi deg full kontroll. Unngå vannskader, følg med på temperatur, og sikre dine eiendeler, enten det er hjemme, på hytta eller i båten.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Kom i gang</Link>
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
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Den skjulte risikoen med flate tak</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Vannansamlinger og tette sluk på flate tak er en undervurdert, men svært kostbar trussel for alle typer bygg.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatColumn value="4 av 10" title="Tak med feil" description="Har byggefeil eller mangler som øker risikoen for lekkasje over tid, ifølge Sintef Byggforsk." />
            <StatColumn value=">500.000 kr" title="Per lekkasje" description="Kan en enkelt vannlekkasje fra tak koste i reparasjoner og følgeskader på inventar og struktur." />
            <StatColumn value="Alle byggtyper" title="Er utsatt" description="Gjelder for næringsbygg, borettslag, leilighetskomplekser og private boliger med flate tak eller takterrasser." />
          </div>
        </div>
      </section>

      <section id="solution" className="py-20">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Full kontroll på 3 enkle steg</h2>
            <p className="mt-2 text-muted-foreground">Vår løsning gjør det enkelt å beskytte eiendommene dine mot skader.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <HowItWorksStep number="1" title="Koble til utstyr" description="Aktiver og plasser våre trådløse sensorer og kameraer der du trenger dem – på taket, i kjelleren eller i båten." />
            <HowItWorksStep number="2" title="Få sanntidsdata" description="Se nivåer for vann, temperatur og fuktighet, samt live video, direkte i vårt intuitive dashbord." />
            <HowItWorksStep number="3" title="Motta varsler" description="Få umiddelbar beskjed på SMS eller e-post hvis en verdi overstiger dine grenser, slik at du kan handle raskt." />
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Skapt for å gi deg trygghet</h2>
            <p className="mt-2 text-muted-foreground">Alt du trenger for proaktiv sensor- og videoovervåking.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={Droplet} title="Vannstandsmåling" description="Overvåk vannivået i takrenner, sluk og i kjølen på båten for å forhindre kostbare lekkasjer." />
            <FeatureCard icon={Thermometer} title="Temperatur & Fuktighet" description="Hold kontroll på klimaet i kjellere og båter for å unngå mugg, råte og frostskader." />
            <FeatureCard icon={Video} title="Videoovervåking" description="Integrer kameraer for visuell bekreftelse og se live videostrømmer direkte i dashbordet." />
            <FeatureCard icon={Shield} title="Egendefinerte Varsler" description="Sett dine egne terskelverdier for sensorer og få varsler når nivåene er kritiske." />
          </div>
        </div>
      </section>

      <section id="cta" className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-primary text-primary-foreground rounded-lg p-10 lg:p-16 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold font-headline">Klar til å sikre dine verdier?</h2>
                  <p className="mt-4 max-w-2xl mx-auto text-lg">
                      Ta kontroll over fukt, vann og sikkerhet med SENSO. Enkel installasjon, umiddelbar trygghet.
                  </p>
                  <div className="mt-8">
                      <Button size="lg" variant="secondary" asChild className="text-primary hover:bg-white/90">
                         <Link href="/signup">Opprett en gratis konto</Link>
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
