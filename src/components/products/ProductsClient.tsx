"use client";

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
import { Star, CheckCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { useMemo } from "react";

const ProductCard = ({ product }: { product: Product }) => (
  <Card className="flex flex-col overflow-hidden group">
    <CardHeader className="p-0">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={product.imageUrl || ''}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={product.imageHint}
        />
         {!product.inStock && (
            <Badge variant="destructive" className="absolute top-2 right-2">Utsolgt</Badge>
        )}
      </div>
    </CardHeader>
    <CardContent className="flex flex-col flex-grow p-4">
      <CardTitle className="text-lg font-headline mb-1">{product.name}</CardTitle>
      <p className="text-sm text-muted-foreground mb-2">{product.subtitle}</p>
      
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < product.rating ? "text-accent fill-accent" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <CardDescription className="text-sm flex-grow line-clamp-3">{product.description}</CardDescription>
      
    </CardContent>
    <CardFooter className="flex flex-col items-start p-4 bg-secondary/50 mt-auto">
      <div className="w-full flex justify-between items-baseline mb-4">
        <div className="text-2xl font-bold font-headline">
          {product.price.toLocaleString('nb-NO')} kr
        </div>
        <div className="text-sm font-semibold text-muted-foreground">
          + {product.monthlyFee} kr/mnd
        </div>
      </div>
      <div className="w-full grid grid-cols-2 gap-2">
        <Button disabled={!product.inStock}>Kjøp nå</Button>
        <Button variant="outline" asChild>
            <Link href={`/products/${product.id}`}>
                Les mer <ArrowRight className="ml-2 h-4 w-4"/>
            </Link>
        </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {productList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {productList.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
            <p className="font-bold text-lg">Ingen produkter funnet</p>
            <p>Produkter vil bli listet her snart.</p>
        </div>
      )}
    </div>
  );
}
