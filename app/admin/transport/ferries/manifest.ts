import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/admin/transport/ferries",
    name: "AREES Loop | لوحة البواخر",
    short_name: "لوحة البواخر",
    description: "اختصار مباشر لإدارة عروض وطلبات البواخر في أريس لوب.",
    start_url: "/admin/transport/ferries",
    scope: "/admin/",
    display: "standalone",
    background_color: "#F7F5EF",
    theme_color: "#0D3B34",
    orientation: "portrait",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/icons/arees-loop-app-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/arees-loop-app-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
