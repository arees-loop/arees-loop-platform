import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "حجوزات الفنادق والعروض | Arees Loop",
  description: "استكشف عروض الفنادق واطلب حجز إقامتك عبر Arees Loop بسهولة.",
  path: "/hotels",
  image: "/Image/hero/arees-hotel-banner.webp",
  imageWidth: 2048,
  imageHeight: 682,
  imageType: "image/webp",
  imageAlt: "عروض وحجوزات الفنادق عبر Arees Loop",
});

export default function PageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
