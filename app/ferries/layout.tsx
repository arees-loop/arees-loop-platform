import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "حجز تذاكر البواخر جدة سواكن | Arees Loop",
  description: "وكيل حجز لباخرة تاركو وعمان ودليلة وجودي ومونتي حسب التوفر. اطلب تذاكر جدة–سواكن أو سواكن–جدة وتابع العروض مع أريس لوب.",
  path: "/ferries",
  image: "/Image/hero/arees-ferry-banner.webp",
  imageWidth: 2048,
  imageHeight: 682,
  imageType: "image/webp",
  imageAlt: "حجز باخرة جدة سواكن عبر Arees Loop",
});

export default function PageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
