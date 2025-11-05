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
import { useMemo } from "react";

const ProductCard = ({ product }: { product: Product }) => (
  <Card className="flex flex-col overflow-hidden group border-2 hover:border-primary transition-all">
    <CardHeader className="p-6">
      <CardTitle className="text-2xl font-headline mb-1">{product.name}</CardTitle>
      <CardDescription className="text-sm line-clamp-3 h-[60px]">{product.description}</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col flex-grow p-6">
      
      <div className="mb-6">
        {product.price.monthly > 0 ? (
            <>
                <span className="text-4xl font-bold">${product.price.monthly}</span>
                <span className="text-muted-foreground">/mo</span>
            </>
        ) : (
            <span className="text-3xl font-bold">Contact Us</span>
        )}
        {product.price.once > 0 && (
            <p className="text-sm text-muted-foreground">+ ${product.price.once} one-time fee</p>
        )}
      </div>

      <Button size="lg" className="w-full mb-6">
          {product.price.monthly > 0 ? 'Get Started' : 'Contact Sales'}
      </Button>
      
      <div className="flex-grow">
        <p className="font-semibold mb-3 text-sm">WHAT'S INCLUDED:</p>
        <ul className="space-y-3">
            {product.specs.map((spec, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">{spec}</span>
            </li>
            ))}
        </ul>
      </div>
      
    </CardContent>
  </Card>
);

export default function ProductsClient({ products }: { products: Product[] }) {

  const productList = useMemo(() => {
    return products;
  }, [products]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
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
