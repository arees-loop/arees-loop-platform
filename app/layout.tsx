import type { Metadata } from "next";
import { elMessiri, ibmPlexArabic } from "./fonts";
import InitialSplash from "./components/InitialSplash";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.areesloop.com"),

  title: "Arees Loop | منصة تجربة الزائر الذكية",

  description:
    "اكتشف واحجز التجارب والوجهات السياحية، واكسب المكافآت في تجربة واحدة ذكية.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },

  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: "https://www.areesloop.com",
    siteName: "Arees Loop",

    title: "Arees Loop | منصة تجربة الزائر الذكية",

    description:
      "اكتشف واحجز التجارب والوجهات السياحية، واكسب المكافآت في تجربة واحدة ذكية.",

    images: [
      {
        url: "/Image/social/arees-loop-social-preview.png",
        width: 1200,
        height: 630,
        alt: "Arees Loop | منصة تجربة الزائر الذكية",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Arees Loop | منصة تجربة الزائر الذكية",

    description:
      "اكتشف واحجز التجارب والوجهات السياحية، واكسب المكافآت في تجربة واحدة ذكية.",

    images: ["/Image/social/arees-loop-social-preview.png"],
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