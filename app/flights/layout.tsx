import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "حجز تذاكر تاركو وبدر للطيران | Arees Loop",
  description: "وكيل حجز لتذاكر تاركو للطيران وبدر للطيران حسب التوفر، مع طلبات رحلات الخرطوم–جدة وجدة–الخرطوم ومسارات أخرى عبر أريس لوب.",
  path: "/flights",
  image: "/Image/hero/arees-flight-banner.webp",
  imageWidth: 2048,
  imageHeight: 682,
  imageType: "image/webp",
  imageAlt: "حجز تذاكر تاركو وبدر للطيران عبر Arees Loop",
});

export default function PageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
