import type { Metadata } from "next";
import { elMessiri, ibmPlexArabic } from "./fonts";
import InitialSplash from "./components/InitialSplash";
import SaudiBusinessVerification from "./components/SaudiBusinessVerification";
import PublicGlobalHeader from "./components/PublicGlobalHeader";
import "./globals.css";

const SITE_URL = "https://www.areesloop.com";

const SOCIAL_IMAGE = `${SITE_URL}/Logo/arees-shiny-monogram.png`;

// Website metadata is intentionally separate from the legally contracted merchant.
const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "أريس الحلول المتكاملة المحدودة للسفر والسياحة",
  inLanguage: ["ar", "en"],
  description: "خدمات السفر والسياحة والبرامج والتجارب السياحية.",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "أريس الحلول المتكاملة المحدودة للسفر والسياحة | خدمات السفر والسياحة",
    template: "%s | أريس الحلول المتكاملة المحدودة للسفر والسياحة",
  },

  description:
    "اكتشف خدمات السفر والسياحة والبرامج والوجهات والتجارب السياحية عبر أريس الحلول المتكاملة المحدودة للسفر والسياحة.",

  applicationName: "أريس الحلول المتكاملة المحدودة للسفر والسياحة",

  authors: [
    {
      name: "أريس الحلول المتكاملة المحدودة للسفر والسياحة",
    },
  ],

  creator: "أريس الحلول المتكاملة المحدودة للسفر والسياحة",

  publisher: "أريس الحلول المتكاملة المحدودة للسفر والسياحة",

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

    siteName: "أريس الحلول المتكاملة المحدودة للسفر والسياحة",

    title: "أريس الحلول المتكاملة المحدودة للسفر والسياحة | خدمات السفر والسياحة",

    description:
      "اكتشف خدمات السفر والسياحة والبرامج والوجهات والتجارب السياحية عبر أريس الحلول المتكاملة المحدودة للسفر والسياحة.",

    images: [
      {
        url: SOCIAL_IMAGE,

        type: "image/png",

        alt: "أريس الحلول المتكاملة المحدودة للسفر والسياحة | خدمات السفر والسياحة",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "أريس الحلول المتكاملة المحدودة للسفر والسياحة | خدمات السفر والسياحة",

    description:
      "اكتشف خدمات السفر والسياحة والبرامج والوجهات والتجارب السياحية عبر أريس الحلول المتكاملة المحدودة للسفر والسياحة.",

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData).replace(/</g, "\\u003c") }}
        />
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
