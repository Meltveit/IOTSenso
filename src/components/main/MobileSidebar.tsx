"use client"
import Link from "next/link";
import { SensoGuardLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SidebarNav from "@/components/main/SidebarNav";
import { PanelLeft } from "lucide-react";

export default function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                 <Button size="icon" variant="outline" className="md:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs p-0">
                 <div className="flex h-16 items-center justify-center border-b">
                    <Link href="/" className="flex items-center gap-2 font-bold font-headline">
                        <SensoGuardLogo className="h-6 w-6 text-primary" />
                        <span className="text-lg">SensoGuard</span>
                    </Link>
                </div>
                <div className="overflow-y-auto">
                    <SidebarNav />
                </div>
            </SheetContent>
        </Sheet>
    )
}