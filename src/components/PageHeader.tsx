"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

function toTitleCase(str: string) {
  return str.replace(/-/g, ' ').replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
}

export default function PageHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    return {
      label: toTitleCase(segment),
      href: href,
      isLast: isLast,
    };
  });

  const pageTitle = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : "Dashboard";

  return (
    <div>
        <h1 className="text-2xl font-bold font-headline hidden md:block">{pageTitle}</h1>
        <Breadcrumb className="md:hidden">
            <BreadcrumbList>
                 <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.length > 0 && <BreadcrumbSeparator />}
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                        <BreadcrumbItem>
                        {crumb.isLast ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink asChild>
                                <Link href={crumb.href}>{crumb.label}</Link>
                            </BreadcrumbLink>
                        )}
                        </BreadcrumbItem>
                        {!crumb.isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    </div>
  );
}
