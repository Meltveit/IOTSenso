import ManageProductsClient from "@/components/products/ManageProductsClient";
import type { Product } from "@/lib/types";

export default function ManageProductsPage() {
  // In a real app, you would fetch this data from your API, likely filtered by user ownership
  const products: Product[] = [
    {
      id: "professional",
      name: "Profesjonell",
      type: 'Professional',
      description: "Vår mest populære plan. Ideell for voksende bedrifter som trenger omfattende overvåking og prediktive funksjoner.",
      price: {
        once: 4999,
        monthly: 499
      },
      specs: [
        "Inkluderer 10 sensorer",
        "Avansert dashbord med AI-innsikt",
        "AI-drevet prediktivt vedlikehold",
        "API-tilgang for integrasjoner",
        "Prioritert support",
      ],
      imageUrl: "https://picsum.photos/seed/pro/600/400",
      imageHint: "profesjonelle sensorer",
      rating: 5,
    },
  ];

  return <ManageProductsClient products={products} />;
}
