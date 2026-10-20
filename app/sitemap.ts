import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.areesloop.com";

const publicRoutes = [
  "",
  "/ferries",
  "/flights",
  "/hotels",
  "/visas",
  "/international-driving-license",
  "/services",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = publicRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "" ? 1 : path === "/services" ? 0.8 : 0.9,
  }));

  try {
    const services = await prisma.service.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    routes.push(
      ...services.map((service) => ({
        url: `${SITE_URL}/services/${encodeURIComponent(service.id)}`,
        lastModified: service.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    );
  } catch {
    // Keep the stable public pages in the sitemap if the optional listing is unavailable.
  }

  return routes;
}
