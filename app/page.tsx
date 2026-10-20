import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  ...buildPageMetadata({
  title: "Arees Loop | أريس لوب للسفر والسياحة",
  description: "Arees Loop (أريس لوب)، منصة من شركة أريس للسفر والسياحة Arees Travel لحجوزات الطيران والبواخر والبرامج السياحية والتجارب في السعودية.",
  path: "/",
  image: "/Image/social/arees-loop-whatsapp-preview.png",
  imageWidth: 1734,
  imageHeight: 907,
  imageType: "image/png",
  imageAlt: "Arees Loop أريس لوب من شركة أريس للسفر والسياحة",
  }),
  title: { absolute: "Arees Loop | أريس لوب للسفر والسياحة" },
};

export default function HomePage() {
  return <HomeClient />;
}
