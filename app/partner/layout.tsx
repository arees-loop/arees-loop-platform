"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import PartnerShell from "./_components/PartnerShell";

const portalRoots = ["/partner/dashboard","/partner/bookings","/partner/services","/partner/settlements","/partner/invoices","/partner/reports","/partner/team","/partner/business","/partner/contracts"];

export default function PartnerLayout({children}:{children:ReactNode}) {
  const pathname=usePathname();
  const inPortal=portalRoots.some(p=>pathname===p||pathname.startsWith(p+"/"));
  return inPortal ? <PartnerShell>{children}</PartnerShell> : <>{children}</>;
}
