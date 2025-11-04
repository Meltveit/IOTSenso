"use client"
import Link from "next/link";
import { SensoGuardLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function PublicMobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                 <Button size="icon" variant="outline" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs p-0">
                 <div className="flex h-16 items-center justify-center border-b">
                    <Link href="/home" className="flex items-center gap-2 font-bold font-headline" onClick={() => setIsOpen(false)}>
                        <SensoGuardLogo className="h-6 w-6 text-primary" />
                        <span className="text-lg">SensoGuard</span>
                    </Link>
                </div>
                <div className="p-4 flex flex-col gap-4">
                    <Link href="/home" className="text-foreground font-semibold hover:text-foreground/80 transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>Products</Link>
                    <Link href="/about-us" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsOpen(false)}>About Us</Link>
                    <hr/>
                    <Button variant="ghost" asChild>
                        <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup" onClick={() => setIsOpen(false)}>Get Started Here</Link>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
