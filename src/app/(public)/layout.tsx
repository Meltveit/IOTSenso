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
                    <Link href="/home" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                    <Link href="/products" className="text-foreground font-semibold hover:text-foreground/80 transition-colors">Plans</Link>
                    <Link href="/about-us" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
                    <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
                </nav>
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild>
                        <Link href="/signup">Get Started Here</Link>
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
                            <p className="text-sm text-muted-foreground mt-4">Proactive sensor monitoring to protect your assets.</p>
                        </div>
                        <div>
                            <h4 className="font-headline font-semibold">Product</h4>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li><Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                                <li><Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">How it Works</Link></li>
                                <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Demo</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-headline font-semibold">Company</h4>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li><Link href="/about-us" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                                <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-headline font-semibold">Legal</h4>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} SENSO. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
