import type { Metadata } from "next";
import { publicPageMetadata } from "../seo-metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "المرشدون السياحيون | اكتشف مرشداً في وجهتك",
  description:
    "اكتشف مرشداً سياحياً مرخصاً في وجهتك، أو تعرّف على فرص تقديم خدمات الإرشاد السياحي عبر أريس لوب.",
  path: "/guides",
});

export default function GuidesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
