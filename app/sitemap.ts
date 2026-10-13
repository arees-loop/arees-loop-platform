import type { MetadataRoute } from "next";

const SITE_URL = "https://www.areesloop.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPaths = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/sd", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/guides", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return publicPaths.map(({ path, priority, changeFrequency }) => ({
    url: new URL(path, SITE_URL).toString(),
    priority,
    changeFrequency,
  }));
}
