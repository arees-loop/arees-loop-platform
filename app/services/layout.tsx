import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "البرامج السياحية والخدمات | Arees Loop",
  description: "تصفّح البرامج السياحية والخدمات والتجارب المنشورة في السعودية عبر أريس لوب، وتحقق من تفاصيل كل عرض وتوفره قبل الحجز.",
  path: "/services",
  image: "/Image/social/arees-loop-whatsapp-preview.png",
  imageWidth: 1734,
  imageHeight: 907,
  imageType: "image/png",
  imageAlt: "البرامج السياحية والخدمات على Arees Loop",
});

export default function PageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
