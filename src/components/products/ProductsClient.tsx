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
import { Star, CheckCircle, Search, ListFilter, X } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [filters, setFilters] = useState<Record<string, boolean>>({
    'Starter Kit': true,
    'Professional': true,
    'Enterprise': true,
  });

  const productTypes = ['Starter Kit', 'Professional', 'Enterprise'];

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        filters[product.type]
    );

    const [key, order] = sortOrder.split("-");

    result.sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      if (key === "price") {
        valA = a.price.once;
        valB = b.price.once;
      } else {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }

      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchTerm, sortOrder, filters]);

  const handleFilterChange = (type: string, checked: boolean) => {
    setFilters(prev => ({...prev, [type]: checked}));
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
           {searchTerm && (
            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
                <X className="h-4 w-4" />
            </Button>
           )}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <ListFilter className="mr-2 h-4 w-4" />
                Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {productTypes.map(type => (
                <DropdownMenuCheckboxItem
                    key={type}
                    checked={filters[type]}
                    onCheckedChange={(checked) => handleFilterChange(type, !!checked)}
                >
                    {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low-High)</SelectItem>
              <SelectItem value="price-desc">Price (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
            <p className="font-bold text-lg">No products found</p>
            <p>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
