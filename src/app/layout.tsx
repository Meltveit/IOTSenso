import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientOnly from "@/components/ClientOnly";
import { Inter, Space_Grotesk } from "next/font/google";
import { validateEnv } from "@/lib/env";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ['500', '600', '700'] });

// Validate environment variables at build time
if (typeof window === 'undefined') {
  validateEnv();
}

export const metadata: Metadata = {
  title: "SENSO",
  description: "Real-time sensor monitoring and predictive maintenance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          inter.variable,
          spaceGrotesk.variable
        )}
        suppressHydrationWarning
      >
        <ClientOnly>
          <AuthProvider>
              {children}
          </AuthProvider>
        </ClientOnly>
        <SonnerToaster />
      </body>
    </html>
  );
}
