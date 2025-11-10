import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SensoLogo } from "@/components/icons";
import PublicMobileNav from "@/components/main/PublicMobileNav";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-secondary/50">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <Link href="/home" className="flex items-center gap-2">
                    <SensoLogo className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold font-headline text-foreground">
                    SENSO
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/home" className="text-muted-foreground hover:text-foreground transition-colors">Hjem</Link>
                    <Link href="/products" className="text-foreground font-semibold hover:text-foreground/80 transition-colors">Prisplaner</Link>
                    <Link href="/about-us" className="text-muted-foreground hover:text-foreground transition-colors">Om oss</Link>
                    <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">Slik fungerer det</Link>
                </nav>
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="ghost" asChild>
                        <Link href="/login">Logg inn</Link>
                        </Button>
                        <Button asChild>
                        <Link href="/signup">Kom i gang</Link>
                        </Button>
                    </div>
                    <div className="md:hidden">
                        <PublicMobileNav />
                    </div>
                </div>
                </div>
            </header>

            <main className="flex-grow">
                {children}
            </main>

            <footer className="bg-card border-t">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                        <div className="col-span-2 md:col-span-2">
                            <Link href="/home" className="flex items-center gap-2">
                                <SensoLogo className="h-8 w-8 text-primary" />
                                <span className="text-xl font-bold font-headline text-foreground">
                                    SENSO
                                </span>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-4">Proaktiv sensorovervåkning for å beskytte dine verdier.</p>
                        </div>
                        <div>
                            <h4 className="font-headline font-semibold">Produkt</h4>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li><Link href="#features" className="text-muted-foreground hover:text-foreground">Funksjoner</Link></li>
                                <li><Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">Slik fungerer det</Link></li>
                                <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Demo</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-headline font-semibold">Selskap</h4>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li><Link href="/about-us" className="text-muted-foreground hover:text-foreground">Om oss</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-headline font-semibold">Juridisk</h4>
                            <ul className="mt-4 space-y-2 text-sm">
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} SENSO. Alle rettigheter forbeholdt.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
