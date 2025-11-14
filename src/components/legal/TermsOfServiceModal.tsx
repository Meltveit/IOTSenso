"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsOfServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TermsOfServiceModal({ open, onOpenChange }: TermsOfServiceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Brukervilkår</DialogTitle>
          <DialogDescription>
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Innledning</h3>
              <p className="text-muted-foreground">
                Velkommen til SENSO! Disse brukervilkårene (&quot;Vilkårene&quot;) regulerer din tilgang til og bruk av SENSO sine tjenester for overvåking av IoT-sensorer (&quot;Tjenesten&quot;). Ved å registrere deg for og bruke Tjenesten, godtar du å være bundet av disse Vilkårene.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Definisjoner</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>&quot;Tjenesten&quot;</strong> betyr SENSO sin plattform for overvåking, analyse og varsling av IoT-sensorer</li>
                <li><strong>&quot;Bruker&quot;</strong>, &quot;du&quot; eller &quot;deg&quot; betyr personen eller enheten som registrerer seg for eller bruker Tjenesten</li>
                <li><strong>&quot;Konto&quot;</strong> betyr din brukerkonto for tilgang til Tjenesten</li>
                <li><strong>&quot;Innhold&quot;</strong> betyr all informasjon, data, tekst, software, musikk, lyd, fotografier, grafikk, video, meldinger eller andre materialer</li>
                <li><strong>&quot;Sensordata&quot;</strong> betyr alle data og målinger samlet inn fra dine IoT-sensorer via Tjenesten</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Godtakelse av vilkår</h3>
              <p className="text-muted-foreground mb-3">
                Ved å opprette en Konto eller bruke Tjenesten, bekrefter og godtar du at:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Du har lest, forstått og godtar å være bundet av disse Vilkårene</li>
                <li>Du er minst 18 år gammel eller har foresattes/verges samtykke</li>
                <li>Du har myndighet til å inngå denne avtalen</li>
                <li>All informasjon du gir til oss er nøyaktig og sann</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Kontoregistrering og sikkerhet</h3>
              <p className="text-muted-foreground mb-3">
                For å bruke Tjenesten må du opprette en Konto:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Du må oppgi nøyaktig og fullstendig informasjon ved registrering</li>
                <li>Du er ansvarlig for å opprettholde konfidensialiteten til ditt passord og Konto</li>
                <li>Du er ansvarlig for all aktivitet som skjer under din Konto</li>
                <li>Du må umiddelbart varsle oss om enhver uautorisert bruk av din Konto</li>
                <li>Vi forbeholder oss retten til å deaktivere enhver Konto dersom vi mener vilkårene er brutt</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Tjenestens omfang</h3>
              <p className="text-muted-foreground mb-3">SENSO tilbyr følgende funksjoner:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Sanntidsovervåking av registrerte IoT-sensorer</li>
                <li>Historisk datalagring og analyse av sensormålinger</li>
                <li>Konfigurerbare varsler og terskelverdier</li>
                <li>Dashboard og rapporteringsfunksjoner</li>
                <li>Administrasjon av bygninger og sensorlokasjoner</li>
                <li>AI-drevet prediktiv analyse og vedlikeholdsanbefalinger</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Tjenestens tilgjengelighet og funksjonalitet kan variere basert på ditt abonnementsnivå.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Abonnement og betaling</h3>
              <h4 className="font-semibold text-sm mb-2 mt-3">6.1 Abonnementstyper</h4>
              <p className="text-muted-foreground mb-2">
                Vi tilbyr forskjellige abonnementsnivåer med varierende funksjoner og priser. Detaljert prisinformasjon finner du på vår nettside.
              </p>

              <h4 className="font-semibold text-sm mb-2 mt-3">6.2 Fakturering</h4>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Abonnementer faktureres månedlig eller årlig i henhold til din valgte plan</li>
                <li>Alle priser er oppgitt i norske kroner (NOK) eksklusiv MVA, med mindre annet er angitt</li>
                <li>Betaling behandles av vår betalingspartner Stripe</li>
                <li>Du må oppgi gyldige betalingsopplysninger for å bruke Tjenesten</li>
              </ul>

              <h4 className="font-semibold text-sm mb-2 mt-3">6.3 Fornyelse og kansellering</h4>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Abonnementer fornyes automatisk med mindre du kansellerer før fornyelsesdatoen</li>
                <li>Du kan kansellere abonnementet ditt når som helst fra din kontoside</li>
                <li>Ved kansellering vil du fortsatt ha tilgang til Tjenesten frem til slutten av den betalte perioden</li>
                <li>Refusjon gis ikke for delvise abonnementsperioder</li>
              </ul>

              <h4 className="font-semibold text-sm mb-2 mt-3">6.4 Prisendringer</h4>
              <p className="text-muted-foreground">
                Vi forbeholder oss retten til å endre priser. Du vil bli varslet minst 30 dager i forveien om eventuelle prisendringer. Fortsatt bruk av Tjenesten etter prisendringen trer i kraft utgjør aksept av den nye prisen.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Brukeransvar og akseptabel bruk</h3>
              <p className="text-muted-foreground mb-3">Ved å bruke Tjenesten forplikter du deg til å:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Bruke Tjenesten kun til lovlige formål</li>
                <li>Ikke forsøke å få uautorisert tilgang til andre brukeres kontoer eller data</li>
                <li>Ikke forstyrre eller avbryte Tjenestens funksjon eller servere</li>
                <li>Ikke overføre virus, malware eller annen ondsinnet kode</li>
                <li>Ikke bruke Tjenesten til å sende spam eller uønsket kommunikasjon</li>
                <li>Ikke kopiere, modifisere, distribuere eller reverse engineere noen del av Tjenesten</li>
                <li>Overholde alle gjeldende lover og forskrifter</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Sensordata og eierskap</h3>
              <h4 className="font-semibold text-sm mb-2 mt-3">8.1 Ditt eierskap</h4>
              <p className="text-muted-foreground">
                Du beholder alle rettigheter til dine Sensordata. Ved å bruke Tjenesten gir du oss en begrenset lisens til å lagre, behandle og vise dine Sensordata for å levere Tjenesten til deg.
              </p>

              <h4 className="font-semibold text-sm mb-2 mt-3">8.2 Vår bruk av data</h4>
              <p className="text-muted-foreground">
                Vi kan bruke aggregerte og anonymiserte data fra Tjenesten til å forbedre våre produkter og tjenester, og til analyse- og forskningsformål. Slike data vil ikke identifisere deg personlig.
              </p>

              <h4 className="font-semibold text-sm mb-2 mt-3">8.3 Dataeksport og sletting</h4>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Du kan når som helst eksportere dine Sensordata fra Tjenesten</li>
                <li>Ved kansellering av Kontoen vil dine data bli slettet innen 30 dager, med mindre annet kreves av lov</li>
                <li>Du kan be om sletting av spesifikke data ved å kontakte oss</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. Immaterielle rettigheter</h3>
              <p className="text-muted-foreground mb-3">
                Tjenesten og alt relatert Innhold, funksjoner og funksjonalitet (inkludert men ikke begrenset til all informasjon, software, tekst, skjermer, bilder, video og lyd, og design, utvalg og arrangement av disse) eies av SENSO AS, dets lisensgivere eller andre leverandører av slikt materiale og er beskyttet av norsk og internasjonal opphavsrett, varemerke, patent, forretningshemmelighet og andre immaterielle rettigheter eller eiendomsrettslover.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">10. Garantifraskrivelse</h3>
              <p className="text-muted-foreground mb-3">
                TJENESTEN LEVERES &quot;SOM DEN ER&quot; OG &quot;SOM TILGJENGELIG&quot; UTEN GARANTIER AV NOE SLAG, VERKEN UTTRYKKELIGE ELLER UNDERFORSTÅTTE.
              </p>
              <p className="text-muted-foreground mb-3">VI GARANTERER IKKE AT:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Tjenesten vil være uavbrutt, sikker eller feilfri</li>
                <li>Resultater eller data vil være nøyaktige eller pålitelige</li>
                <li>Kvaliteten på produkter, tjenester, informasjon eller annet materiale vil møte dine forventninger</li>
                <li>Eventuelle feil i Tjenesten vil bli rettet</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">11. Ansvarsbegrensning</h3>
              <p className="text-muted-foreground mb-3">
                I den utstrekning loven tillater det, skal SENSO AS ikke under noen omstendigheter være ansvarlig for noen indirekte, tilfeldige, spesielle, eksemplariske eller følgeskader, inkludert men ikke begrenset til tap av fortjeneste, data, bruk, goodwill eller andre immaterielle tap som følge av:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Din bruk eller manglende evne til å bruke Tjenesten</li>
                <li>Uautorisert tilgang til eller endring av dine overføringer eller data</li>
                <li>Uttalelser eller oppførsel fra tredjeparter på Tjenesten</li>
                <li>Feil, unøyaktigheter eller utelatelser i Sensordata</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Vårt samlede ansvar overfor deg for alle krav relatert til Tjenesten skal ikke overstige beløpet du har betalt oss i de siste 12 månedene.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">12. Skadesløsholdelse</h3>
              <p className="text-muted-foreground">
                Du samtykker i å skadesløsholde, forsvare og holde SENSO AS og dets tilknyttede selskaper, partnere, tjenestemenn, direktører, agenter, kontraktører, lisensgivere, tjenesteleverandører, underleverandører, leverandører, praktikanter og ansatte skadesløse fra ethvert krav eller krav, inkludert rimelige advokatsalærer, fremsatt av en tredjepart på grunn av eller som følge av din overtredelse av disse Vilkårene eller dokumentene de inkorporerer ved referanse, eller din krenkelse av enhver lov eller en tredjeparts rettigheter.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">13. Endringer i tjenesten og vilkårene</h3>
              <p className="text-muted-foreground mb-3">
                Vi forbeholder oss retten til, etter eget skjønn, å:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Endre, suspendere eller avslutte Tjenesten eller en del av den når som helst</li>
                <li>Endre disse Vilkårene når som helst</li>
                <li>Pålegge begrensninger på visse funksjoner eller begrense tilgangen til deler av eller hele Tjenesten</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Vi vil varsle deg om vesentlige endringer minst 30 dager i forveien via e-post eller via Tjenesten. Fortsatt bruk av Tjenesten etter at endringene trer i kraft utgjør aksept av de nye Vilkårene.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">14. Oppsigelse</h3>
              <h4 className="font-semibold text-sm mb-2 mt-3">14.1 Oppsigelse fra din side</h4>
              <p className="text-muted-foreground">
                Du kan når som helst avslutte din Konto ved å følge instruksjonene på kontoinnstillingssiden.
              </p>

              <h4 className="font-semibold text-sm mb-2 mt-3">14.2 Oppsigelse fra vår side</h4>
              <p className="text-muted-foreground mb-2">
                Vi kan suspendere eller avslutte din Konto umiddelbart, uten forvarsel, dersom:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Du bryter disse Vilkårene</li>
                <li>Vi er pålagt å gjøre det ved lov</li>
                <li>Vi avslutter Tjenesten</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">15. Tvisteløsning</h3>
              <h4 className="font-semibold text-sm mb-2 mt-3">15.1 Gjeldende lov</h4>
              <p className="text-muted-foreground">
                Disse Vilkårene skal styres av og tolkes i samsvar med norsk lov, uten hensyn til dens prinsipper om lovkonflikt.
              </p>

              <h4 className="font-semibold text-sm mb-2 mt-3">15.2 Verneting</h4>
              <p className="text-muted-foreground">
                Eventuelle tvister som oppstår ut av eller i forbindelse med disse Vilkårene skal løses av de norske domstolene, med [Ditt lokale tingrett] som eksklusivt verneting.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">16. Diverse bestemmelser</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Hele avtalen:</strong> Disse Vilkårene utgjør hele avtalen mellom deg og SENSO AS angående Tjenesten</li>
                <li><strong>Fraskrivelse av rettigheter:</strong> Vår manglende håndhevelse av noen rett eller bestemmelse i disse Vilkårene vil ikke utgjøre en fraskrivelse av slik rett eller bestemmelse</li>
                <li><strong>Delbarhet:</strong> Hvis en bestemmelse i disse Vilkårene holdes ugyldig eller ikke kan håndheves, vil slik bestemmelse fjernes i minimal utstrekning slik at de resterende bestemmelsene vil fortsette å gjelde</li>
                <li><strong>Overdragelse:</strong> Du kan ikke overdra eller overføre disse Vilkårene uten vårt skriftlige samtykke. Vi kan overdra våre rettigheter og forpliktelser under disse Vilkårene til enhver tredjepart</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">17. Kontakt oss</h3>
              <p className="text-muted-foreground mb-2">
                Hvis du har spørsmål om disse Vilkårene, vennligst kontakt oss:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                <p><strong>E-post:</strong> support@senso.no</p>
                <p><strong>Telefon:</strong> [Ditt telefonnummer]</p>
                <p><strong>Adresse:</strong> [Din adresse]</p>
              </div>
            </section>

            <p className="text-muted-foreground text-xs mt-6 pt-6 border-t">
              Ved å bruke SENSO bekrefter du at du har lest, forstått og godtar disse brukervilkårene.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
