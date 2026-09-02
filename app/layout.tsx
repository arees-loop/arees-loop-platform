import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arees Loop | اكتشف التجربة",
  description:
    "Arees Loop منصة ذكية لاكتشاف وحجز التجارب والوجهات والمكافآت.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        {/* AREES LOOP — BETA STATUS */}
        <div className="pointer-events-none fixed left-1/2 top-3 z-[9999] -translate-x-1/2">
          <div
            className="
              flex items-center gap-2
              rounded-full
              border border-[#d8b33f]/30
              bg-[#073f37]/90
              px-4 py-2
              shadow-[0_8px_30px_rgba(0,0,0,0.12)]
              backdrop-blur-xl
            "
          >
            {/* Status dot */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d8b33f] opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d8b33f]" />
            </span>

            {/* Label */}
            <span className="whitespace-nowrap text-[12px] font-semibold tracking-wide text-white md:text-[13px]">
              إصدار تجريبي
            </span>

            {/* Divider */}
            <span className="h-3 w-px bg-white/20" />

            {/* Brand */}
            <span className="whitespace-nowrap text-[9px] font-semibold tracking-[0.16em] text-[#e2bd45] md:text-[10px]">
              AREES LOOP
            </span>
          </div>
        </div>
      </body>
    </html>
  );
}