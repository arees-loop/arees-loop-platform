import localFont from "next/font/local";

/* ========================================
   AREES LOOP — Arabic Typography
   ======================================== */

/* العناوين الرئيسية */
export const elMessiri = localFont({
  src: [
    {
      path: "../public/fonts/ElMessiri-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/ElMessiri-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/ElMessiri-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/ElMessiri-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-el-messiri",
  display: "swap",
});

/* النصوص والأزرار والواجهة */
export const ibmPlexArabic = localFont({
  src: [
    {
      path: "../public/fonts/ibm-plex-arabic/IBMPlexSansArabic-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/ibm-plex-arabic/IBMPlexSansArabic-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/ibm-plex-arabic/IBMPlexSansArabic-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/ibm-plex-arabic/IBMPlexSansArabic-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});