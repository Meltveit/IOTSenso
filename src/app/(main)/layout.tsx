import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sidebar";
import SidebarNav from "@/components/main/SidebarNav";
import { SensoGuardLogo } from "@/components/icons";
import UserNav from "@/components/main/UserNav";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileSidebar from "@/components/main/MobileSidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="bg-card border-r hidden md:flex">
          <SidebarNav />
        </Sidebar>
        <SidebarInset className="bg-secondary/50 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <MobileSidebar />
            <div className="flex-1">
              <PageHeader />
            </div>
            <UserNav />
          </header>
          <main className="flex-1 flex-col p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
