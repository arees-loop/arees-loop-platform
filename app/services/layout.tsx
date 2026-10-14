import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "الخدمات والتجارب السياحية | Arees Loop",
  description: "اكتشف الخدمات والتجارب السياحية المعتمدة والمنشورة عبر Arees Loop.",
  path: "/services",
  image: "/Image/social/arees-loop-whatsapp-preview.png",
  imageWidth: 1734,
  imageHeight: 907,
  imageType: "image/png",
  imageAlt: "الخدمات والتجارب السياحية على Arees Loop",
});

export default function PageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
