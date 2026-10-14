import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "حجوزات البواخر والعروض | Arees Loop",
  description: "اطّلع على عروض البواخر المتاحة وأرسل طلب الحجز عبر Arees Loop.",
  path: "/ferries",
  image: "/Image/hero/arees-ferry-banner.webp",
  imageWidth: 2048,
  imageHeight: 682,
  imageType: "image/webp",
  imageAlt: "حجوزات وعروض البواخر عبر Arees Loop",
});

export default function PageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
