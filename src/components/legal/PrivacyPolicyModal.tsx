"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PrivacyPolicyModal({ open, onOpenChange }: PrivacyPolicyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Personvernerklæring</DialogTitle>
          <DialogDescription>
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Innledning</h3>
              <p className="text-muted-foreground">
                SENSO AS (&quot;vi&quot;, &quot;oss&quot; eller &quot;vår&quot;) respekterer ditt personvern og er forpliktet til å beskytte dine personopplysninger. Denne personvernerklæringen vil informere deg om hvordan vi behandler dine personopplysninger når du bruker vår tjeneste for overvåking av IoT-sensorer.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Behandlingsansvarlig</h3>
              <p className="text-muted-foreground mb-2">
                SENSO AS er behandlingsansvarlig for behandling av dine personopplysninger.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                <p><strong>Organisasjonsnummer:</strong> [Ditt org.nr]</p>
                <p><strong>Adresse:</strong> [Din adresse]</p>
                <p><strong>E-post:</strong> personvern@senso.no</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Hvilke personopplysninger samler vi inn?</h3>
              <p className="text-muted-foreground mb-3">Vi kan samle inn, bruke, lagre og overføre forskjellige typer personopplysninger om deg:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Identitetsdata:</strong> fornavn, etternavn, brukernavn eller lignende identifikator</li>
                <li><strong>Kontaktdata:</strong> e-postadresse og telefonnummer</li>
                <li><strong>Bedriftsdata:</strong> bedriftsnavn, organisasjonsnummer, fakturaadresse, kontaktperson (kun for bedriftskontoer)</li>
                <li><strong>Tekniske data:</strong> IP-adresse, nettlesertype og -versjon, tidssonesetting og plassering, operativsystem og annen teknologi på enhetene du bruker for å få tilgang til tjenesten</li>
                <li><strong>Profildata:</strong> brukernavn og passord, kjøp eller bestillinger gjort av deg, dine interesser, preferanser, tilbakemeldinger og svarunders</li>
                <li><strong>Sensordata:</strong> målinger fra dine IoT-sensorer, inkludert temperatur, fuktighet, vekt, batteri- nivå og tidsstempler</li>
                <li><strong>Bruks data:</strong> informasjon om hvordan du bruker vårt nettsted og tjenester</li>
                <li><strong>Betalingsdata:</strong> fakturainformasjon og transaksjonsdetaljer (behandles av vår betalingspartner Stripe)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Hvordan samler vi inn dine personopplysninger?</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Direkte interaksjon:</strong> Du gir oss identitets-, kontakt- og betalingsdata ved å registrere deg for tjenesten vår</li>
                <li><strong>Automatiserte teknologier:</strong> Når du samhandler med tjenesten vår, kan vi automatisk samle inn tekniske data om utstyret ditt, nettleserhandlinger og mønstre</li>
                <li><strong>IoT-sensorer:</strong> Sensordata samles inn automatisk fra de registrerte IoT-sensorene dine via MQTT-protokollen</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Hvordan bruker vi dine personopplysninger?</h3>
              <p className="text-muted-foreground mb-3">Vi bruker dine personopplysninger til følgende formål:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Å registrere deg som ny kunde og administrere din konto</li>
                <li>Å levere våre tjenester, inkludert sanntidsovervåking av sensorer og varslingssystemer</li>
                <li>Å behandle og levere dine bestillinger og abonnementer</li>
                <li>Å administrere vårt forhold til deg, inkludert å varsle deg om endringer i våre vilkår eller personvernerklæring</li>
                <li>Å gi deg muligheten til å delta i konkurranser eller fullføre undersøkelser</li>
                <li>Å forbedre tjenesten vår, produkter, markedsføring og kundeerfaringer</li>
                <li>Å analysere bruken av tjenesten for å gjøre anbefalinger til deg om varer eller tjenester som kan være av interesse</li>
                <li>Å beskytte, undersøke og avskrekke uredelige, uautoriserte eller ulovlige aktiviteter</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Rettslig grunnlag for behandling</h3>
              <p className="text-muted-foreground mb-3">Vi behandler dine personopplysninger basert på følgende rettslige grunnlag:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Samtykke:</strong> Du har gitt samtykke til behandlingen for spesifikke formål</li>
                <li><strong>Kontraktsoppfyllelse:</strong> Behandlingen er nødvendig for å oppfylle en kontrakt vi har med deg</li>
                <li><strong>Rettslige forpliktelser:</strong> Behandlingen er nødvendig for å overholde en rettslig forpliktelse</li>
                <li><strong>Berettigede interesser:</strong> Behandlingen er nødvendig for våre berettigede interesser eller en tredjeparts berettigede interesser</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Deling av personopplysninger</h3>
              <p className="text-muted-foreground mb-3">
                Vi kan dele dine personopplysninger med følgende parter:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Tjenesteleverandører:</strong> Vi bruker tredjeparts tjenesteleverandører for å støtte våre forretningsaktiviteter:
                  <ul className="list-circle pl-6 mt-2 space-y-1">
                    <li>Firebase (Google Cloud) - for database og autentisering</li>
                    <li>Stripe - for betalingsbehandling</li>
                    <li>HiveMQ - for MQTT-meldingsbroker</li>
                    <li>Vercel - for hosting av webapplikasjon</li>
                  </ul>
                </li>
                <li><strong>Profesjonelle rådgivere:</strong> Advokater, revisorer og forsikringsselskaper som yter rådgivning, revisjon, forsikring og regnskapstjenester</li>
                <li><strong>Offentlige myndigheter:</strong> Når vi er pålagt ved lov å gjøre dette</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Vi krever at alle tredjeparts tjenesteleverandører respekterer sikkerheten til dine personopplysninger og behandler dem i samsvar med loven. Vi tillater ikke våre tredjeparts tjenesteleverandører å bruke dine personopplysninger til sine egne formål.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Overføring til tredjeland</h3>
              <p className="text-muted-foreground">
                Noen av våre tjenesteleverandører kan være lokalisert utenfor EU/EØS. Når vi overfører dine personopplysninger utenfor EU/EØS, sørger vi for at det er etablert passende sikkerhetstiltak, som EUs standardkontraktsklausuler eller at mottakeren er sertifisert under EU-U.S. Data Privacy Framework.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. Datasikkerhet</h3>
              <p className="text-muted-foreground">
                Vi har implementert passende sikkerhetstiltak for å forhindre at dine personopplysninger ved et uhell går tapt, brukes eller får tilgang til på en uautorisert måte, endres eller avsløres. Vi begrenser tilgangen til dine personopplysninger til de ansatte, agenter, kontraktører og andre tredjeparter som har et forretningsbehov for å kjenne dem. De vil kun behandle dine personopplysninger på våre instruksjoner og de er underlagt en taushetsplikt.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">10. Lagringstid</h3>
              <p className="text-muted-foreground mb-3">
                Vi vil kun oppbevare dine personopplysninger så lenge som nødvendig for å oppfylle formålene vi samlet dem inn for, inkludert for å oppfylle eventuelle juridiske, regnskapsmessige eller rapporteringskrav.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Kontodata:</strong> Oppbevares så lenge kontoen din er aktiv og i inntil 5 år etter avslutning</li>
                <li><strong>Sensordata:</strong> Oppbevares så lenge kontoen din er aktiv</li>
                <li><strong>Betalingsdata:</strong> Oppbevares i samsvar med regnskapsloven (5 år)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">11. Dine rettigheter</h3>
              <p className="text-muted-foreground mb-3">Under visse omstendigheter har du følgende rettigheter i henhold til personvernlovgivningen:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Rett til innsyn:</strong> Du har rett til å be om kopier av dine personopplysninger</li>
                <li><strong>Rett til retting:</strong> Du har rett til å be oss rette opplysninger du mener er unøyaktige eller fullføre opplysninger du mener er ufullstendige</li>
                <li><strong>Rett til sletting:</strong> Du har rett til å be oss slette dine personopplysninger under visse omstendigheter</li>
                <li><strong>Rett til begrensning:</strong> Du har rett til å be oss begrense behandlingen av dine personopplysninger under visse omstendigheter</li>
                <li><strong>Rett til å protestere:</strong> Du har rett til å protestere mot vår behandling av dine personopplysninger under visse omstendigheter</li>
                <li><strong>Rett til dataportabilitet:</strong> Du har rett til å be om at vi overfører dataene vi har samlet inn til en annen organisasjon, eller direkte til deg, under visse omstendigheter</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                For å utøve noen av disse rettighetene, vennligst kontakt oss på <a href="mailto:personvern@senso.no" className="underline">personvern@senso.no</a>
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">12. Endringer i personvernerklæringen</h3>
              <p className="text-muted-foreground">
                Vi kan oppdatere denne personvernerklæringen fra tid til annen. Vi vil varsle deg om eventuelle endringer ved å publisere den nye personvernerklæringen på denne siden og oppdatere &quot;Sist oppdatert&quot;-datoen øverst. Vi anbefaler deg å gjennomgå denne personvernerklæringen med jevne mellomrom for eventuelle endringer.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">13. Klage til tilsynsmyndighet</h3>
              <p className="text-muted-foreground">
                Du har rett til å klage til Datatilsynet dersom du mener vi behandler dine personopplysninger i strid med personvernregelverket.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-1 mt-2">
                <p><strong>Datatilsynet</strong></p>
                <p>Postboks 458 Sentrum</p>
                <p>0105 Oslo</p>
                <p>E-post: postkasse@datatilsynet.no</p>
                <p>Tlf: 22 39 69 00</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">14. Kontakt oss</h3>
              <p className="text-muted-foreground mb-2">
                Hvis du har spørsmål om denne personvernerklæringen eller våre personvernpraksis, vennligst kontakt oss:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                <p><strong>E-post:</strong> personvern@senso.no</p>
                <p><strong>Telefon:</strong> [Ditt telefonnummer]</p>
                <p><strong>Adresse:</strong> [Din adresse]</p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
