import type { Metadata } from "next";
import { publicPageMetadata } from "../seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "سياسة الخصوصية وحماية البيانات",
  description:
    "اقرأ سياسة الخصوصية في أريس لوب، بما يشمل جمع البيانات الشخصية واستخدامها وحمايتها والحقوق المرتبطة بها.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
