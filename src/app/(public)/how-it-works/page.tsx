import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Zap, Cloud, LayoutDashboard, Settings, HardHat, Bell } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="bg-background">
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-foreground">
            Slik Fungerer SENSO
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            Fra sensor til innsikt – se hvordan vår plattform transformerer data til proaktivt vedlikehold.
          </p>
        </div>
      </section>

      <section id="technology" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Teknologien Bak</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">En forenklet oversikt over hvordan vi samler inn, behandler og presenterer dataene dine.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <InfoCard
              icon={Zap}
              title="1. Datainnsamling (MQTT)"
              description="Dine eksisterende sensorer sender data trygt og effektivt via MQTT, en lettvektsprotokoll designet for IoT-enheter. Dette sikrer minimalt ressursbruk og pålitelig dataoverføring, selv på nettverk med lav båndbredde."
            />
            <InfoCard
              icon={Cloud}
              title="2. Skybehandling"
              description="Dataene mottas av våre skytjenester, hvor de blir prosessert, analysert og lagret sikkert. Vår skalerbare arkitektur håndterer store datamengder i sanntid og kjører AI-modeller for å avdekke mønstre."
            />
            <InfoCard
              icon={LayoutDashboard}
              title="3. Visualisering og Varsling"
              description="Du får umiddelbar tilgang til all data gjennom et intuitivt web-dashboard. Se grafer, status og motta prediktive varsler på e-post eller SMS når systemet oppdager avvik som krever din oppmerksomhet."
            />
          </div>
        </div>
      </section>
      
      <section id="installation" className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Installasjonsveiledning</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Kom i gang på få minutter med vår enkle tre-stegs prosess.</p>
          </div>
          <div className="max-w-3xl mx-auto grid gap-8">
            <StepCard
              icon={Settings}
              title="Steg 1: Konfigurer din MQTT Broker"
              description="Pek sensorene dine mot vår plattform ved å konfigurere din MQTT-megler til å videresende data til endepunktet du får tildelt i SENSO-dashboardet. Dette er en engangsprosess som tar få minutter."
            />
            <StepCard
              icon={HardHat}
              title="Steg 2: Legg til og Konfigurer Sensorer"
              description="Registrer hver sensor i dashboardet. Gi den et navn, angi lokasjon og sett opp dine egne terskelverdier for varsler. Bruk vår AI-assistent for å få anbefalte terskler basert på industristandarder."
            />
            <StepCard
              icon={Bell}
              title="Steg 3: Motta Sanntidsdata og Varsler"
              description="Så snart konfigurasjonen er fullført, vil du se data strømme inn i sanntid. Systemet er nå aktivt og vil varsle deg proaktivt om potensielle problemer. Len deg tilbake og la SENSO holde vakt."
            />
          </div>
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Ofte Stilte Spørsmål</h2>
            <p className="mt-2 text-muted-foreground">Få svar på de vanligste spørsmålene.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Hvilke typer sensorer er kompatible med SENSO?</AccordionTrigger>
              <AccordionContent>
                SENSO er kompatibel med alle sensorer som kan sende data via MQTT-protokollen. Dette inkluderer de fleste moderne industrielle sensorer for temperatur, trykk, fuktighet, vibrasjon og mer.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Hvor sikre er dataene mine?</AccordionTrigger>
              <AccordionContent>
                Vi tar sikkerhet på alvor. All datakommunikasjon er kryptert (TLS), og dataene lagres i et sikkert skymiljø med strenge tilgangskontroller. Vi overholder GDPR og andre relevante personvernregler.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Trenger jeg teknisk ekspertise for å installere systemet?</AccordionTrigger>
              <AccordionContent>
                Nei, plattformen er designet for å være så brukervennlig som mulig. Installasjonen krever kun grunnleggende konfigurasjon av din MQTT-megler, og vårt dashboard guider deg gjennom resten av prosessen steg-for-steg. Vår support er også tilgjengelig for å hjelpe deg.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
              <AccordionTrigger>Kan jeg integrere SENSO med andre systemer?</AccordionTrigger>
              <AccordionContent>
                Ja, vi tilbyr API-er som lar deg integrere data og varsler fra SENSO med dine eksisterende forretningssystemer, som for eksempel vedlikeholdssystemer (CMMS) eller ERP-systemer.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}

const InfoCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <Card className="bg-card">
    <CardHeader className="items-center">
      <div className="bg-primary/10 p-4 rounded-full">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <CardTitle className="font-headline text-xl mt-4">{title}</CardTitle>
    </CardHeader>
    <CardContent className="text-muted-foreground text-sm">
      {description}
    </CardContent>
  </Card>
);


const StepCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <Card className="p-6">
      <div className="flex items-start gap-6">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-headline mb-1">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
);