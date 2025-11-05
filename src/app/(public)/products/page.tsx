import ProductsClient from "@/components/products/ProductsClient";
import type { Product } from "@/lib/types";

const products: Product[] = [
  {
    id: "starter-kit",
    name: "Starter Kit",
    type: 'Starter Kit',
    description: "Perfect for small businesses or homeowners looking to get started with sensor monitoring. Includes everything you need for basic oversight.",
    price: {
      once: 1999,
      monthly: 199
    },
    specs: [
      "Includes 3 sensors",
      "Real-time dashboard",
      "Email & SMS alerts",
      "Basic analytics",
    ],
    imageUrl: "https://picsum.photos/seed/starter/600/400",
    imageHint: "sensor kit",
    rating: 4,
  },
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
  {
    id: "enterprise",
    name: "Enterprise",
    type: 'Enterprise',
    description: "A complete solution for large-scale operations. Fully customizable with dedicated support and unlimited potential.",
    price: {
      once: 0, // Custom pricing
      monthly: 0 // Custom pricing
    },
    specs: [
      "Unlimited sensors",
      "Customizable dashboard and reports",
      "On-premise deployment options",
      "Dedicated account manager",
      "SLA guarantees",
    ],
    imageUrl: "https://picsum.photos/seed/enterprise/600/400",
    imageHint: "industrial sensors",
    rating: 5,
  },
];

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Flexible Plans for Every Need</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">From simple home monitoring to large-scale industrial applications, we have a plan that fits.</p>
        </div>
        <ProductsClient products={products} />
    </div>
  );
}
