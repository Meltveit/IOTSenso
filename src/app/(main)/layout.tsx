import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import SidebarNav from "@/components/main/SidebarNav";
import UserNav from "@/components/main/UserNav";
import PageHeader from "@/components/PageHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import ClientOnly from "@/components/ClientOnly";
import MobileSidebar from "@/components/main/MobileSidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar className="bg-card border-r hidden md:flex">
            <SidebarNav />
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="bg-secondary/50 flex flex-col flex-1 w-full">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
              <ClientOnly>
                  <MobileSidebar />
              </ClientOnly>
              {/* Desktop Sidebar Trigger - Always visible */}
              <div className="hidden md:block">
                <SidebarTrigger />
              </div>
              <div className="flex-1">
                <PageHeader />
              </div>
              <UserNav />
            </header>
            <main className="flex-1 w-full p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}