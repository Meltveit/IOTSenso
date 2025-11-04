"use client";

import { useMemo } from "react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star, CheckCircle } from "lucide-react";
import Image from "next/image";

const ProductCard = ({ product }: { product: Product }) => (
  <Card className="flex flex-col overflow-hidden">
    <CardHeader className="p-0">
      <div className="relative h-48 w-full">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          data-ai-hint={product.imageHint}
        />
      </div>
    </CardHeader>
    <CardContent className="flex flex-col flex-grow p-4">
      <CardTitle className="text-lg font-headline mb-1">{product.name}</CardTitle>
      <div className="flex items-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < product.rating ? "text-accent fill-accent" : "text-muted-foreground/50"
            }`}
          />
        ))}
      </div>
      <CardDescription className="text-sm flex-grow">{product.description}</CardDescription>
      <ul className="my-4 space-y-2 text-sm text-muted-foreground">
        {product.specs.map((spec, i) => (
          <li key={i} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>{spec}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter className="flex flex-col items-start p-4 bg-secondary/50 mt-auto">
      <div className="w-full flex justify-between items-baseline mb-4">
        <div className="text-2xl font-bold font-headline">
          ${product.price.once}
          <span className="text-sm font-normal text-muted-foreground"> one-time</span>
        </div>
        <div className="text-lg font-semibold">
          ${product.price.monthly}
          <span className="text-sm font-normal text-muted-foreground">/mo</span>
        </div>
      </div>
      <div className="w-full grid grid-cols-2 gap-2">
        <Button>Buy Now</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </CardFooter>
  </Card>
);

export default function ProductsClient({ products }: { products: Product[] }) {

  const productList = useMemo(() => {
    return products;
  }, [products]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {productList.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
            <p className="font-bold text-lg">No products found</p>
            <p>Products will be listed here soon.</p>
        </div>
      )}
    </div>
  );
}
