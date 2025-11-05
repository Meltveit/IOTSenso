"use client";

import { useState, useMemo } from "react";
import type { Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star, CheckCircle, Search, ListFilter, X, PlusCircle } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProductCard = ({ product }: { product: Product }) => (
  <Card className="flex flex-col overflow-hidden">
    <CardHeader className="p-0">
      <div className="relative h-48 w-full">
        {product.imageUrl && 
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={product.imageHint}
          />
        }
      </div>
    </CardHeader>
    <CardContent className="flex flex-col flex-grow p-4">
      <Badge className="w-fit mb-2">{product.type}</Badge>
      <CardTitle className="text-lg font-headline mb-1">{product.name}</CardTitle>
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
       <Button className="w-full">Manage Subscription</Button>
    </CardFooter>
  </Card>
);

export default function ManageProductsClient({ products }: { products: Product[] }) {
  
  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Manage Your Subscription</CardTitle>
          <CardDescription>
            View your current plan, add more sensors, or change your subscription.
          </CardDescription>
        </CardHeader>
       </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <Card className="text-center py-16 text-muted-foreground">
            <CardContent>
                <h3 className="font-bold text-lg">No active subscription</h3>
                <p className="mb-4">You do not have an active subscription yet. Choose a plan to get started.</p>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    View Plans
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
