import { notFound } from "next/navigation";
import type { SensorProduct } from "@/lib/types"; // Endret fra Product til SensorProduct
import ProductDetailClient from "@/components/products/ProductDetailClient";

const products: SensorProduct[] = [
    {
      id: "snowguard-pro",
      name: "Snøvakt Pro",
      subtitle: "Vektsensor for Snølast",
      type: 'weight',
      description: "Snøvakt Pro er en avansert vektsensor som måler snølasten på tak i sanntid. Sensoren varsler deg før snømengden blir kritisk, slik at du kan rydde taket før det oppstår skader.",
      purpose: [
        "Forebygge takras og takkollaps",
        "Beskytte mot strukturelle skader på bygninger",
        "Redusere risiko for personskader",
        "Spare kostnader på dyre takskader",
      ],
      howItWorks: "Snøvakt Pro bruker presisjonsvektceller som måler den faktiske belastningen på takstrukturen. Sensoren kalibreres ved installasjon basert på takets størrelse og bæreevne. Når snølasten når 60% av maksimal kapasitet, sendes en advarsel. Ved 80% sendes kritisk varsel.",
      specs: {
        "Måleområde": "0-200 kg",
        "Nøyaktighet": "±0.5 kg",
        "Målefrekvens": "Hver 30. minutt (økes ved snøfall)",
        "Batteritid": "2 år (utskiftbart litium-batteri)",
        "Kommunikasjon": "LTE-M (NB-IoT)",
        "Temperaturområde": "-40°C til +60°C",
        "Vanntetthet": "IP67 (fullstendig støv- og vanntett)",
        "Montering": "Skruefeste eller limmontering",
      },
      useCases: [
        "Boligeiendommer: Eneboliger, rekkehus, leilighetsbygg",
        "Næringseiendom: Varehus, butikker, kontorbygg",
        "Offentlige bygg: Skoler, barnehager, idrettshaller",
        "Industribygg: Lagerhaller, produksjonsanlegg",
      ],
      importantFor: [
          "Flate tak (høy risiko for snøakkumulering)",
          "Store takflater",
          "Eldre bygg med ukjent bæreevne",
          "Bygg i snørike områder"
      ],
      costSavings: {
          "Forebygge takkollaps": "200.000 - 1.000.000 kr",
          "Unngå vannskader": "50.000 - 300.000 kr",
          "Reduserte forsikringspremier": "5-15% rabatt",
      },
      repaymentTime: "1-2 vintre",
      uniqueBenefits: [
        "Måler faktisk last, ikke bare snødybde",
        "Tar hensyn til snøens tetthet (våt vs. tørr snø)",
        "Automatisk kalibrering for vindlast",
        "Integrert med lokale værdata for prediktiv varsling",
      ],
      price: 3490,
      monthlyFee: 99,
      imageUrl: "https://picsum.photos/seed/snowguard/1200/800",
      imageHint: "snow sensor",
      inStock: true,
      rating: 5,
    },
    {
      id: "snowlevel-ir",
      name: "Snønivå IR",
      subtitle: "Infrarød Avstandssensor",
      type: 'ir',
      description: "Snønivå IR bruker avansert infrarød teknologi for å måle snødybden på taket ditt. Sensoren gir deg eksakt oversikt over hvor mye snø som har samlet seg, og varsler når det er tid for rydding.",
      purpose: [
          "Måle snødybde med høy presisjon",
          "Overvåke snøakkumulering over tid",
          "Varsle ved kritiske snømengder",
          "Dokumentere snøforhold for forsikringsformål"
      ],
      howItWorks: "Snønivå IR sender ut infrarøde laserpulser som måler avstanden til snøoverflaten. Ved å kjenne takets høyde kan sensoren beregne eksakt snødybde. Sensoren kompenserer automatisk for temperatur og luftfuktighet for maksimal nøyaktighet.",
      specs: {
          "Måleområde": "0-300 cm",
          "Nøyaktighet": "±1 cm",
          "Målefrekvens": "Hver 15. minutt",
          "Batteritid": "3 år (utskiftbart litium-batteri)",
          "Kommunikasjon": "LTE-M (NB-IoT)",
          "Temperaturområde": "-40°C til +50°C",
          "Vanntetthet": "IP68 (kan tåle nedsenkking i vann)",
          "Lasersikkerhet": "Klasse 1 (øyesikker)",
          "Montering": "Vertikalt på takoverbygg eller skorstein"
      },
      useCases: [
          "Flate tak: Hvor snø samler seg jevnt",
          "Helletak: For å måle snødybde i takrenner",
          "Store takflater: For strategisk plassering av flere sensorer",
          "Hytter og fritidsboliger: Overvåke når du ikke er til stede",
          "Historiske bygg: Ikke-invasiv montering"
      ],
      importantFor: [
          "Tak med begrenset tilgang",
          "Fjerntliggende eiendommer",
          "Dokumentasjon av snøforhold",
          "Områder med ekstreme snømengder"
      ],
      costSavings: {
          "Optimalisere ryddetidspunkt": "5.000-15.000 kr/sesong",
          "Forebygge isskader": "30.000 - 100.000 kr",
          "Dokumentasjon for forsikring": "Kan avgjøre millionkrav",
          "Reduser unødvendige serviceturer": "2.000-5.000 kr/sesong"
      },
      repaymentTime: "1-2 sesonger",
      uniqueBenefits: [
          "Kontaktfri måling (ingen mekaniske deler som slites)",
          "Fungerer i all slags vær",
          "Kan måle gjennom lett tåke/dis",
          "Historisk data for trendanalyse",
          "Integrasjon med lokale snøprognoser"
      ],
      price: 2990,
      monthlyFee: 79,
      imageUrl: "https://picsum.photos/seed/snowlevel/1200/800",
      imageHint: "infrared sensor",
      inStock: true,
      rating: 4,
    },
    {
      id: "basementwatch",
      name: "Kjellervakten",
      subtitle: "Fuktsensor for Kjeller og Våtrom",
      type: 'moisture',
      description: "Kjellervakten er en intelligent fuktsensor som overvåker fuktighetsnivået i kjellere, våtrom og andre utsatte områder. Sensoren varsler tidlig om fuktproblemer, slik at du kan handle før det utvikler seg mugg og råte.",
      purpose: [
          "Oppdage fuktlekkasjer tidlig",
          "Forebygge mugg og råteskader",
          "Beskytte mot grunnvannsinntrenging",
          "Overvåke tørkeforløp etter vannskader",
          "Sikre sunt inneklima"
      ],
      howItWorks: "Kjellervakten bruker høypresisjonssensorer som måler både relativ luftfuktighet (RH%) og temperatur. Sensoren beregner duggpunkt og varsler når forholdene er gunstige for muggvekst. Ved plutselig økning i fuktighet sendes umiddelbar alarm.",
      specs: {
          "Måleområde": "0-100% RH (relativ luftfuktighet)",
          "Nøyaktighet": "±2% RH",
          "Temperaturmåling": "-20°C til +60°C (±0.5°C)",
          "Målefrekvens": "Hver 10. minutt (økes ved fuktøkning)",
          "Batteritid": "4 år (to AA-batterier)",
          "Kommunikasjon": "LTE-M (NB-IoT)",
          "Varsler ved": "RH > 60% (muggrisiko), RH > 70% (høy risiko), Plutselig økning (lekkasje)",
          "Vanntetthet": "IP65 (tåler sprøytevann)",
          "Montering": "Veggmontering eller frittstående"
      },
      useCases: [
          "Kjellere: Overvåke fukt fra grunnvann",
          "Våtrom: Bad, vaskerom, kjellergang",
          "Krypkjellere: Utsatte for kondensering",
          "Lagerrom: Beskytte verdifulle gjenstander",
          "Garasjer: Fukt fra bil (snø/regn)",
          "Soverom i kjeller: Sikre sunt inneklima",
          "Sommerhytter: Overvåke når ikke i bruk"
      ],
      importantFor: [
          "Boliger med drenering-problemer",
          "Eldre hus med dårlig isolering",
          "Boliger nær vassdrag",
          "Eiendommer bygget på leire"
      ],
      costSavings: {
          "Forebygge muggskader": "50.000 - 300.000 kr",
          "Unngå råteskader": "100.000 - 500.000 kr",
          "Reduserte helsekostnader": "Astma, allergier osv.",
          "Opprettholde boligverdi": "Muggsaker reduserer verdi med 10-30%"
      },
      repaymentTime: "Allerede ved første fuktlekkasje",
      uniqueBenefits: [
          "Detekterer både sakte og raske fuktøkninger",
          "Beregner muggrisiko basert på temperatur + fuktighet",
          "Historiske trender viser om problemet forverres",
          "Kan plasseres flere sensorer for full dekning",
          "Varsler også hvis sensoren flyttes (tyverialarm)"
      ],
      price: 1890,
      monthlyFee: 59,
      imageUrl: "https://picsum.photos/seed/basement/1200/800",
      imageHint: "moisture sensor",
      inStock: true,
      rating: 5,
    },
    {
      id: "gutterflow",
      name: "Rennevakten",
      subtitle: "Takrennesensor for Vannstrøm",
      type: 'flow',
      description: "Rennevakten overvåker vannstrømmen i takrennene dine og varsler når det oppstår tetting eller overbelastning. Sensoren sikrer at regnvann ledes trygt bort fra bygningen, og forhindrer vannskader på fasade, grunnmur og fundament.",
      purpose: [
          "Oppdage tette takrenner og nedløpsrør",
          "Forebygge vannskader på fasade",
          "Beskytte grunnmur og fundament",
          "Varsle om ispropper om vinteren",
          "Sikre drenering fungerer året rundt"
      ],
      howItWorks: "Rennevakten måler vannstrømmen gjennom takrennen ved hjelp av en ikke-invasiv flomsensor. Sensoren lærer det normale strømningsmønsteret for din eiendom, og varsler når vannstrømmen avviker fra normalen - enten pga. tetting, overløp eller ispropper.",
      specs: {
          "Måleområde": "0-100 liter/minutt",
          "Nøyaktighet": "±5% av måleverdi",
          "Målefrekvens": "Kontinuerlig under regn/snøsmelting, Hver time ved tørt vær",
          "Batteritid": "2 år (utskiftbart litium-batteri)",
          "Kommunikasjon": "LTE-M (NB-IoT)",
          "Temperaturmåling": "-30°C til +50°C",
          "Vanntetthet": "IP66 (tåler kraftig regn og snø)",
          "Montering": "Klips-feste til takrennekant",
          "Varsler ved": "Redusert strøm (tetting), Null strøm under regn (stopp), Uvanlig høy strøm (skade), Lav temp + vann (is)"
      },
      useCases: [
          "Alle boligtyper: Eneboliger, tomannsboliger, rekkehus",
          "Leilighetsbygg: Overvåke fellesområder",
          "Næringseiendom: Forhindre fasadeskader",
          "Historiske bygg: Beskytte sårbare fasader",
          "Hytter: Overvåke når ikke til stede"
      ],
      importantFor: [
          "Tak med mye løv/bar (tettingsrisiko)",
          "Eldre takrennesystemer",
          "Boliger med kjellervinduer under takrenner",
          "Eiendommer med dårlig drenering",
          "Bygg på skrånende tomt"
      ],
      costSavings: {
          "Forebygge fasadeskader": "100.000 - 400.000 kr",
          "Unngå fundamentskader": "200.000 - 800.000 kr",
          "Redusere mugg i kjeller": "50.000 - 150.000 kr",
          "Unngå erosjon rundt hus": "30.000 - 100.000 kr",
          "Spare på takrennerens": "Forlenge levetid med 5-10 år"
      },
      repaymentTime: "1-2 år",
      uniqueBenefits: [
          "Lærer normale strømningsmønstre for din eiendom",
          "Varsler før vannet renner over (ikke etter)",
          "Oppdager gradvis tetting før det blir totalt stopp",
          "Kan identifisere hvor i systemet problemet er",
          "Varsler om isdannelse før skade oppstår",
          "Historikk viser om rennene trenger service"
      ],
      price: 2490,
      monthlyFee: 69,
      imageUrl: "https://picsum.photos/seed/gutter/1200/800",
      imageHint: "gutter sensor",
      inStock: false,
      rating: 4,
    }
  ];

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
