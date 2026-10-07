"use client";

import { usePathname } from "next/navigation";
import GlobalHeader from "./GlobalHeader";

const hiddenPrefixes = [
  "/admin",
  "/login",
  "/auth",
  "/partner",
];

export default function PublicGlobalHeader() {
  const pathname = usePathname();
  const hidden = hiddenPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (hidden) return null;

  return <GlobalHeader overlay={pathname === "/"} />;
}
