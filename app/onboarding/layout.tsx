import type { Metadata } from "next";
import type { ReactNode } from "react";
import { noIndexMetadata } from "../seo-metadata";

export const metadata: Metadata = noIndexMetadata;

export default function PrivateLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
