import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "الفعاليات والبرامج | Arees Loop",
  description: "تابع الفعاليات والبرامج المنشورة من الجهات الحكومية وغير الربحية عبر Arees Loop.",
  path: "/events",
  image: "/Image/social/arees-loop-whatsapp-preview.png",
  imageWidth: 1734,
  imageHeight: 907,
  imageType: "image/png",
  imageAlt: "الفعاليات والبرامج على Arees Loop",
});

export default function PageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
