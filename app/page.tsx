import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "اكتشف تجارب ووجهات السعودية",
  description: "اكتشف واحجز التجارب والوجهات السياحية في السعودية، واكسب المكافآت في تجربة واحدة ذكية.",
  path: "/",
  image: "/Image/social/arees-loop-whatsapp-preview.png",
  imageWidth: 1734,
  imageHeight: 907,
  imageType: "image/png",
  imageAlt: "Arees Loop — اكتشف تجارب ووجهات السعودية",
});

export default function HomePage() {
  return <HomeClient />;
}
