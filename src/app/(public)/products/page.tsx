import ProductsClient from "@/components/products/ProductsClient";
import type { Product } from "@/lib/types";

const products: Product[] = [
  {
    id: "starter-kit",
    name: "Startpakke",
    type: 'Starter Kit',
    description: "Perfekt for små bedrifter eller huseiere som ønsker å komme i gang med sensorovervåking. Inkluderer alt du trenger for grunnleggende tilsyn.",
    price: {
      once: 1999,
      monthly: 199
    },
    specs: [
      "Inkluderer 3 sensorer",
      "Sanntids-dashbord",
      "E-post- og SMS-varsler",
      "Grunnleggende analyser",
    ],
    imageUrl: "https://picsum.photos/seed/starter/600/400",
    imageHint: "sensorpakke",
    rating: 4,
  },
  {
    id: "professional",
    name: "Profesjonell",
    type: 'Professional',
    description: "Vår mest populære pakke. Ideell for voksende bedrifter som trenger omfattende overvåking og prediktive evner.",
    price: {
      once: 4999,
      monthly: 499
    },
    specs: [
      "Inkluderer 10 sensorer",
      "Avansert dashbord med AI-innsikt",
      "AI-drevet prediktivt vedlikehold",
      "API-tilgang for integrasjoner",
      "Prioritert støtte",
    ],
    imageUrl: "https://picsum.photos/seed/pro/600/400",
    imageHint: "profesjonelle sensorer",
    rating: 5,
  },
  {
    id: "enterprise",
    name: "Bedrift",
    type: 'Enterprise',
    description: "En komplett løsning for storskala operasjoner. Fullt tilpassbar med dedikert støtte og ubegrenset potensial.",
    price: {
      once: 0, // Custom pricing
      monthly: 0 // Custom pricing
    },
    specs: [
      "Ubegrenset antall sensorer",
      "Tilpassbart dashbord og rapporter",
      "Alternativer for lokal distribusjon",
      "Dedikert kundeansvarlig",
      "SLA-garantier",
    ],
    imageUrl: "https://picsum.photos/seed/enterprise/600/400",
    imageHint: "industrielle sensorer",
    rating: 5,
  },
];

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Fleksible planer for ethvert behov</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Fra enkel hjemmeovervåking til storskala industrielle applikasjoner, har vi en plan som passer.</p>
        </div>
        <ProductsClient products={products} />
    </div>
  );
}
