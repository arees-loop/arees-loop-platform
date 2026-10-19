import type { Metadata } from "next";
import Script from "next/script";
import { elMessiri, ibmPlexArabic } from "./fonts";
import InitialSplash from "./components/InitialSplash";
import RouteTabTitle from "./components/RouteTabTitle";
import PublicGlobalHeader from "./components/PublicGlobalHeader";
import "./globals.css";

const SITE_URL = "https://www.areesloop.com";

const SOCIAL_IMAGE =
  `${SITE_URL}/Image/social/arees-loop-whatsapp-preview.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "الرئيسية | AREES LOOP",
    template: "%s | AREES LOOP",
  },

  description:
    "اكتشف واحجز التجارب والوجهات السياحية، واكسب المكافآت في تجربة واحدة ذكية.",

  applicationName: "Arees Loop",

  authors: [
    {
      name: "Arees Loop",
    },
  ],

  creator: "Arees Loop",

  publisher: "Arees Loop",

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
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },

  openGraph: {
    type: "website",

    locale: "ar_SA",

    url: SITE_URL,

    siteName: "Arees Loop",

    title: "الرئيسية | AREES LOOP",

    description:
      "اكتشف واحجز التجارب والوجهات السياحية، واكسب المكافآت في تجربة واحدة ذكية.",

    images: [
      {
        url: SOCIAL_IMAGE,

        width: 1734,

        height: 907,

        type: "image/png",

        alt: "Arees Loop | منصة تجربة الزائر الذكية",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "الرئيسية | AREES LOOP",

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
        <RouteTabTitle />
        <InitialSplash />
        <PublicGlobalHeader />

        {children}

      
        {/* ختم التوثيق الرسمي — المركز السعودي للأعمال. يُحمّل من المصدر الرسمي فقط. */}
        <div className="sbc-verify-seal" data-token="bHNZMFR6VHFRQ095M3RmMzcwbU02QT09" data-position="bottom-left" />
        <Script src="https://eauthenticate.saudibusiness.gov.sa/EAuthSealApi/seal.js" strategy="afterInteractive" />

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
