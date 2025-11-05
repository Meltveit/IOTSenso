import ManageProductsClient from "@/components/products/ManageProductsClient";
import type { Product } from "@/lib/types";

export default function ManageProductsPage() {
  // In a real app, you would fetch this data from your API, likely filtered by user ownership
  const products: Product[] = [
    {
      id: "professional",
      name: "Professional",
      type: 'Professional',
      description: "Our most popular plan. Ideal for growing businesses that need comprehensive monitoring and predictive capabilities.",
      price: {
        once: 4999,
        monthly: 499
      },
      specs: [
        "Includes 10 sensors",
        "Advanced dashboard with AI insights",
        "AI-powered predictive maintenance",
        "API access for integrations",
        "Priority support",
      ],
      imageUrl: "https://picsum.photos/seed/pro/600/400",
      imageHint: "professional sensors",
      rating: 5,
    },
  ];

  return <ManageProductsClient products={products} />;
}
