import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "اكتشف البرامج والتجارب | Arees Loop",
  description: "تصفّح البرامج والتجارب السياحية المتاحة، واكتشف الخيارات القريبة منك عبر Arees Loop.",
  path: "/discover",
  image: "/Image/social/arees-loop-whatsapp-preview.png",
  imageWidth: 1734,
  imageHeight: 907,
  imageType: "image/png",
  imageAlt: "اكتشف البرامج والتجارب على Arees Loop",
});

export default function PageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
