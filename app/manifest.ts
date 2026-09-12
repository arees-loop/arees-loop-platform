import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AREES Loop",
    short_name: "AREES Loop",
    description:
      "منصة تجربة الزائر الذكية لاكتشاف التجارب والفعاليات والمرشدين والمكافآت.",

    start_url: "/",
    scope: "/",
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