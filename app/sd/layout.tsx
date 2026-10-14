import type { Metadata } from "next";
import { publicPageMetadata } from "../seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "السياحة في السودان | وجهات وتجارب محلية",
  description:
    "اكتشف وجهات السودان وتجارب السفر المحلية، من آثار مروي إلى البحر الأحمر والطبيعة السودانية، عبر أريس لوب.",
  path: "/sd",
});

export default function SudanLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
