import type { Metadata } from "next";
import { elMessiri, ibmPlexArabic } from "./fonts";
import InitialSplash from "./components/InitialSplash";
import "./globals.css";

/*
  مؤقتًا نستخدم رابط Vercel العام لأن الدومين areesloop.com
  لم يتم ربطه بالمشروع بعد.

  بعد ربط الدومين نغير هذا السطر فقط إلى:
  https://www.areesloop.com
*/
const SITE_URL = "https://arees-loop-platform.vercel.app";

const SOCIAL_IMAGE =
  `${SITE_URL}/Image/social/arees-loop-social-preview-v2.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Arees Loop | منصة تجربة الزائر الذكية",
    template: "%s | Arees Loop",
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

  /*
    الأيقونات الجديدة الموجودة داخل app:
    app/icon.png
    app/apple-icon.png
  */
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

  /*
    أثناء النسخة التجريبية نخلي الموقع غير مفهرس.
    لاحقًا عند الإطلاق الرسمي نحولها إلى true.
  */
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

    siteName: "Arees Loop",

    title: "Arees Loop | منصة تجربة الزائر الذكية",

    description:
      "اكتشف واحجز التجارب والوجهات السياحية، واكسب المكافآت في تجربة واحدة ذكية.",

    images: [
      {
        url: SOCIAL_IMAGE,

        width: 1200,

        height: 630,

        type: "image/png",

        alt: "Arees Loop | منصة تجربة الزائر الذكية",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Arees Loop | منصة تجربة الزائر الذكية",

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

        {children}

        {/* AREES LOOP — BETA STATUS */}
        <div className="pointer-events-none fixed left-1/2 top-3 z-[9999] -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#073F37]/90 px-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4AF37] opacity-40" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D4AF37]" />
            </span>

            <span className="whitespace-nowrap text-[12px] font-semibold tracking-wide text-white md:text-[13px]">
              إصدار تجريبي
            </span>

            <span className="h-3 w-px bg-white/20" />

            <span className="whitespace-nowrap text-[9px] font-semibold tracking-[0.16em] text-[#E2BD45] md:text-[10px]">
              AREES LOOP
            </span>
          </div>
        </div>
      </body>
    </html>
  );
}