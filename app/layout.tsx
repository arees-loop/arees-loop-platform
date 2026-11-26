import type { Metadata } from "next";
import { elMessiri, ibmPlexArabic } from "./fonts";
import InitialSplash from "./components/InitialSplash";
import SaudiBusinessVerification from "./components/SaudiBusinessVerification";
import PublicGlobalHeader from "./components/PublicGlobalHeader";
import "./globals.css";

const SITE_URL = "https://areestravel-ksa.com"; // Dedicated domain for this branch only

const SOCIAL_IMAGE =
  `${SITE_URL}/Logo/arees-header-horizontal.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "أريس الحلول المتكاملة المحدودة للسفر والسياحة | منصة تجربة الزائر الذكية",
    template: "%s | أريس الحلول المتكاملة المحدودة للسفر والسياحة",
  },

  description:
    "اكتشف واحجز التجارب والوجهات السياحية، واكسب المكافآت في تجربة واحدة ذكية.",

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
        url: "/Logo/arees-shiny-monogram.png",
        type: "image/png",
        sizes: "any",
      },
    ],

    apple: [
      {
        url: "/Logo/arees-shiny-monogram.png",
        type: "image/png",
        sizes: "any",
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

    title: "أريس الحلول المتكاملة المحدودة للسفر والسياحة | منصة تجربة الزائر الذكية",

    description:
      "اكتشف واحجز التجارب والوجهات السياحية، واكسب المكافآت في تجربة واحدة ذكية.",

    images: [
      {
        url: SOCIAL_IMAGE,

        type: "image/png",

        alt: "أريس الحلول المتكاملة المحدودة للسفر والسياحة | منصة تجربة الزائر الذكية",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "أريس الحلول المتكاملة المحدودة للسفر والسياحة | منصة تجربة الزائر الذكية",

    description:
      "اكتشف واحجز التجارب والوجهات السياحية، واكسب المكافآت في تجربة واحدة ذكية.",

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
