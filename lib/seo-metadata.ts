import type { Metadata } from "next";

const SITE_URL = "https://www.areesloop.com";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageType: "image/png" | "image/webp" | "image/jpeg";
  imageAlt: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  imageWidth,
  imageHeight,
  imageType,
  imageAlt,
}: PageMetadataInput): Metadata {
  const pageTitle = title.replace(/\s*\|\s*(?:Arees Loop|AREES LOOP)$/i, "").trim();
  const imageUrl = new URL(image, SITE_URL).toString();
  const pageUrl = new URL(path, SITE_URL).toString();

  return {
    title: pageTitle,
    description,
    alternates: { canonical: pageUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: pageUrl,
      siteName: "Arees Loop",
      title: `${pageTitle} | AREES LOOP`,
      description,
      images: [{ url: imageUrl, width: imageWidth, height: imageHeight, type: imageType, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | AREES LOOP`,
      description,
      images: [imageUrl],
    },
  };
}
