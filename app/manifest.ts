import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "شركة أريس الحلول المتكاملة المحدودة للسفر والسياحة",
    short_name: "أريس للسفر",
    description:
      "خدمات السفر والسياحة والتجارب والحجوزات من شركة أريس الحلول المتكاملة المحدودة للسفر والسياحة.",

    scope: "/",
    display: "standalone",

    background_color: "#F7F5EF",
    theme_color: "#0D3B34",

    orientation: "portrait",
    lang: "ar",
    dir: "rtl",

    icons: [
      {
        src: "/icons/arees-company-app-icon.png",
        sizes: "160x160",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/arees-company-app-icon.png",
        sizes: "160x160",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}