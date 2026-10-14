import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "حجوزات الطيران والعروض | Arees Loop",
  description: "تعرّف على عروض الطيران المتاحة وأرسل طلب حجزك عبر Arees Loop.",
  path: "/flights",
  image: "/Image/hero/arees-flight-banner.webp",
  imageWidth: 2048,
  imageHeight: 682,
  imageType: "image/webp",
  imageAlt: "حجوزات وعروض الطيران عبر Arees Loop",
});

export default function PageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
