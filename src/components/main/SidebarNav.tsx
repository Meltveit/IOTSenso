"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Thermometer,
  Bell,
  BarChart2,
  Settings,
  HelpCircle,
  ShoppingBag,
} from "lucide-react";
import { SensoLogo } from "../icons";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/sensors", icon: Thermometer, label: "Sensors" },
  { href: "/alerts", icon: Bell, label: "Alerts" },
  { href: "/analytics", icon: BarChart2, label: "Analytics" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline text-lg">
          <SensoLogo className="w-8 h-8 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">
            SENSO
          </span>
        </Link>
        <div className="group-data-[collapsible=icon]:hidden">
            <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <div className="flex-1 overflow-y-auto">
        <SidebarMenu className="px-4 py-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.label}
                    </span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
      
      <SidebarFooter className="p-4">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" className="justify-start">
                    <Settings className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton tooltip="Help" className="justify-start">
                    <HelpCircle className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Help</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
