import type { Metadata } from "next";
import { elMessiri, ibmPlexArabic } from "./fonts";
import InitialSplash from "./components/InitialSplash";
import SaudiBusinessVerification from "./components/SaudiBusinessVerification";
import PublicGlobalHeader from "./components/PublicGlobalHeader";
import "./globals.css";

const SITE_URL = "https://www.areesloop.com";

const SOCIAL_IMAGE =
  `${SITE_URL}/Logo/arees-company-logo.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "أريس للحلول المتكاملة للسفر والسياحة | خدمات السفر والسياحة",
    template: "%s | أريس للحلول المتكاملة للسفر والسياحة",
  },

  description:
    "اكتشف خدمات السفر والسياحة والبرامج والوجهات والتجارب السياحية عبر أريس للحلول المتكاملة للسفر والسياحة.",

  applicationName: "أريس للحلول المتكاملة للسفر والسياحة",

  authors: [
    {
      name: "شركة أريس للحلول المتكاملة المحدودة",
    },
  ],

  creator: "أريس للحلول المتكاملة للسفر والسياحة",

  publisher: "شركة أريس للحلول المتكاملة المحدودة",

  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],

    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },

  robots: {
    index: false,
    follow: false,

    googleBot: {
      index: false,
      follow: false,
      noimageindex: false,
    },
  },

  openGraph: {
    type: "website",

    locale: "ar_SA",

    url: SITE_URL,

    siteName: "أريس للحلول المتكاملة للسفر والسياحة",

    title: "أريس للحلول المتكاملة للسفر والسياحة | خدمات السفر والسياحة",

    description:
      "اكتشف خدمات السفر والسياحة والبرامج والوجهات والتجارب السياحية عبر أريس للحلول المتكاملة للسفر والسياحة.",

    images: [
      {
        url: SOCIAL_IMAGE,

        type: "image/png",

        alt: "أريس للحلول المتكاملة للسفر والسياحة | خدمات السفر والسياحة",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "أريس للحلول المتكاملة للسفر والسياحة | خدمات السفر والسياحة",

    description:
      "اكتشف خدمات السفر والسياحة والبرامج والوجهات والتجارب السياحية عبر أريس للحلول المتكاملة للسفر والسياحة.",

    images: [SOCIAL_IMAGE],
  },

  other: {
    "theme-color": "#0D3B34",
    "msapplication-TileColor": "#0D3B34",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${elMessiri.variable} ${ibmPlexArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <InitialSplash />
        <PublicGlobalHeader />

        {children}

      
        {/* Verification stays accessible without overlaying customer controls on mobile. */}
        <SaudiBusinessVerification />

        {/* Always-visible floating status badge, positioned below the sticky header on every route. */}
        <div className="pointer-events-none fixed left-5 top-[112px] z-[120] md:left-10 md:top-[128px]">
          <div className="flex items-center gap-1.5 rounded-full border border-[#D4AF37]/30 bg-[#073F37]/90 px-2 py-1 shadow-sm backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
            <span className="whitespace-nowrap text-[9px] font-semibold text-white md:text-[10px]">تحت التطوير</span>
          </div>
        </div>
      </body>
    </html>
  );
}
