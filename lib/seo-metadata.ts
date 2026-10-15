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
  const pageTitle = title.replace(/\s*\|\s*Arees Loop$/, "");
  const imageUrl = new URL(image, SITE_URL).toString();
  const pageUrl = new URL(path, SITE_URL).toString();
  const indexable=process.env.VERCEL_ENV==="production";

  return {
    title: pageTitle,
    description,
    alternates: { canonical: pageUrl },
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: { index: indexable, follow: indexable },
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: pageUrl,
      siteName: "Arees Loop",
      title: pageTitle,
      description,
      images: [{ url: imageUrl, width: imageWidth, height: imageHeight, type: imageType, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [imageUrl],
    },
  };
}
