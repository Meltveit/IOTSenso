import ProductsClient from "@/components/products/ProductsClient";
import { mockProducts } from "@/lib/data";

export default function ProductsPage() {
  // In a real app, you would fetch this data from your API
  const products = mockProducts;

  return <ProductsClient products={products} />;
}
