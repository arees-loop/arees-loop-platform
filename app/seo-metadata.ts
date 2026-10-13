import type { Metadata } from "next";

const SITE_URL = "https://www.areesloop.com";
const SOCIAL_IMAGE = "/Image/social/arees-loop-whatsapp-preview.png";

export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export function publicPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = new URL(path, SITE_URL).toString();

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url,
      siteName: "Arees Loop",
      title,
      description,
      images: [
        {
          url: SOCIAL_IMAGE,
          width: 1734,
          height: 907,
          type: "image/png",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}
