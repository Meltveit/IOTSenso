import ManageProductsClient from "@/components/products/ManageProductsClient";
import type { Product } from "@/lib/types";

export default function ManageProductsPage() {
  // In a real app, you would fetch this data from your API, likely filtered by user ownership
  const products: Product[] = [];

  return <ManageProductsClient products={products} />;
}
