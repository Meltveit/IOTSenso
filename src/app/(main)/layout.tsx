import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SidebarNav from "@/components/main/SidebarNav";
import { SensoGuardLogo } from "@/components/icons";
import UserNav from "@/components/main/UserNav";
import PageHeader from "@/components/PageHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="bg-card border-r">
          <SidebarNav />
        </Sidebar>
        <SidebarInset className="bg-secondary/50 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <SidebarTrigger />
              <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline">
                <SensoGuardLogo className="h-6 w-6 text-primary" />
                <span>SensoGuard</span>
              </Link>
            </div>
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
