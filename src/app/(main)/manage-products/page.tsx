import ManageProductsClient from "@/components/products/ManageProductsClient";
import { mockProducts } from "@/lib/data";

export default function ManageProductsPage() {
  // In a real app, you would fetch this data from your API, likely filtered by user ownership
  const products = mockProducts;

  return <ManageProductsClient products={products} />;
}
