"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Thermometer,
  Bell,
  BarChart2,
  Settings,
  HelpCircle,
  Building,
} from "lucide-react";
import { SensoLogo } from "../icons";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/buildings", icon: Building, label: "Bygninger" },
  { href: "/sensors", icon: Thermometer, label: "Sensorer" },
  { href: "/alerts", icon: Bell, label: "Alarmer" },
  { href: "/analytics", icon: BarChart2, label: "Analyse" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4 flex items-center justify-center">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline text-lg">
          <SensoLogo className="w-8 h-8 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">
            SENSO
          </span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu className="px-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                  className="justify-start"
                >
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.label}
                    </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/settings">
                <SidebarMenuButton tooltip="Settings" className="justify-start">
                    <Settings className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/help">
                <SidebarMenuButton tooltip="Help" className="justify-start">
                    <HelpCircle className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Help</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}