import ProductsClient from "@/components/products/ProductsClient";
import { mockProducts } from "@/lib/data";

export default function ProductsPage() {
  // In a real app, you would fetch this data from your API
  const products = mockProducts;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Our Product Lineup</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Find the perfect SensoGuard package to fit your operational needs, from small-scale monitoring to enterprise-level predictive maintenance.</p>
        </div>
        <ProductsClient products={products} />
    </div>
  );
}
