import type { MetadataRoute } from "next";

const SITE_URL = "https://www.areesloop.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/auth",
        "/login",
        "/onboarding",
        "/profile/",
        "/bookings/",
        "/my-requests/",
        "/partner/",
        "/cart/",
        "/notifications/",
        "/favorites/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
