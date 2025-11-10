"use client";

import type { SensorProduct } from "@/lib/types";
import {
  ShieldCheck,
  Zap,
  HardHat,
  BarChart,
  Home,
  Building,
  Landmark,
  PiggyBank,
  CheckCircle,
  Star,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";

const IconMapping: { [key: string]: React.ElementType } = {
  "Måleområde": BarChart,
  "Nøyaktighet": ShieldCheck,
  "Batteritid": Zap,
  "default": CheckCircle
};

export default function ProductDetailClient({ product }: { product: SensorProduct }) {
    const router = useRouter();
  return (
    <div className="bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Tilbake til produkter
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                <div className="lg:col-span-3">
                    <div className="relative aspect-[3/2] rounded-lg overflow-hidden shadow-lg mb-6">
                        <Image
                        src={product.imageUrl || ''}
                        alt={product.name}
                        fill
                        className="object-cover"
                        data-ai-hint={product.imageHint}
                        />
                        {!product.inStock && (
                            <Badge variant="destructive" className="absolute top-4 left-4 text-sm">Utsolgt</Badge>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-headline font-bold mb-2">Hvordan det fungerer</h2>
                            <p className="text-muted-foreground">{product.howItWorks}</p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-headline font-bold mb-2">Unike fordeler</h2>
                            <ul className="space-y-2">
                                {product.uniqueBenefits.map((benefit, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Star className="h-5 w-5 text-accent mt-1 shrink-0"/>
                                    <span className="text-muted-foreground">{benefit}</span>
                                </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="sticky top-24 space-y-6">
                        <h1 className="text-4xl font-headline font-bold">{product.name}</h1>
                        <p className="text-lg text-muted-foreground -mt-2">{product.subtitle}</p>
                        
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-5 w-5 ${
                                    i < product.rating ? "text-accent fill-accent" : "text-muted-foreground/30"
                                    }`}
                                />
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">({product.rating}.0)</span>
                        </div>

                        <p className="text-foreground">{product.description}</p>
                        
                        <Card className="bg-background">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-3xl font-bold font-headline">{product.price.toLocaleString('nb-NO')} kr</div>
                                    <div className="text-right">
                                        <p className="font-semibold text-muted-foreground">+{product.monthlyFee} kr/mnd</p>
                                        <p className="text-xs text-muted-foreground">for datatjeneste</p>
                                    </div>
                                </div>
                                <Button size="lg" className="w-full" disabled={!product.inStock}>
                                    {product.inStock ? 'Legg i handlekurv' : 'Utsolgt'}
                                </Button>
                            </CardContent>
                        </Card>

                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">Hovedformål</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {product.purpose.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm">
                                            <CheckCircle className="h-4 w-4 text-primary shrink-0"/>
                                            <span className="text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">Tekniske spesifikasjoner</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Object.entries(product.specs).map(([key, value]) => {
                                    const Icon = IconMapping[key] || IconMapping["default"];
                                    return (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="font-medium flex items-center gap-2">
                                                <Icon className="h-4 w-4 text-muted-foreground"/>
                                                {key}
                                            </span>
                                            <span className="text-muted-foreground text-right">{value}</span>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">Typiske kostnadsbesparelser</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Object.entries(product.costSavings).map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-sm">
                                        <span className="font-medium flex items-center gap-2">
                                            <PiggyBank className="h-4 w-4 text-muted-foreground"/>
                                            {key}
                                        </span>
                                        <span className="text-muted-foreground font-semibold">{value}</span>
                                    </div>
                                ))}
                                <Separator className="my-3"/>
                                 <div className="flex justify-between text-sm">
                                    <span className="font-medium flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground"/>
                                        Tilbakebetalingstid
                                    </span>
                                    <span className="text-muted-foreground font-semibold">{product.repaymentTime}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader>
                                <CardTitle className="text-lg font-headline">Bruksområder</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {product.useCases.map((useCase, index) => (
                                    <div key={index} className="flex items-start gap-3 text-sm">
                                        <Home className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0"/>
                                        <span className="text-muted-foreground">{useCase}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
