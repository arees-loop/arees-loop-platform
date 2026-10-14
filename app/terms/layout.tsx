import type { Metadata } from "next";
import { publicPageMetadata } from "../seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "الشروط والأحكام | أريس لوب",
  description:
    "اطّلع على شروط استخدام منصة أريس لوب وحجز التجارب والخدمات وأحكام الإلغاء والاسترداد والضمان.",
  path: "/terms",
});

export default function TermsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
