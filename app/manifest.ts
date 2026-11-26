import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "أريس الحلول المتكاملة المحدودة للسفر والسياحة",
    short_name: "أريس",
    description:
      "خدمات السفر والسياحة والبرامج والتجارب السياحية.",

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
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/arees-company-app-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}