import type {Metadata} from "next";
import {buildPageMetadata} from "@/lib/seo-metadata";
export const metadata:Metadata=buildPageMetadata({
 title:"المرشدون السياحيون",
 description:"استكشف دليل المرشدين السياحيين المرخصين في السعودية عبر أريس لوب وابحث حسب المدينة والتخصص لتتعرف على الجولات والخدمات المنشورة.",
 path:"/guides",image:"/api/og/guides?type=directory",imageWidth:1200,imageHeight:630,imageType:"image/png",
 imageAlt:"المرشدون السياحيون المرخصون على أريس لوب"
});
import Image from "next/image";
import Link from "next/link";
import GuidesHeroCards from "./GuidesHeroCards";

export default function GuidesLandingPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#F8F5ED] pb-24 pt-24 text-[#0D3B34]">
      <section className="guides-hero" aria-labelledby="guides-page-title">
        <Image
          src="/Image/guides/arees-loop-guides-heritage-banner.png"
          alt="مرشد سياحي يرافق الزوار في مواقع تراثية بالمملكة"
          fill
          priority
          sizes="100vw"
          className="guides-hero-image"
        />
        <div className="guides-hero-shade" aria-hidden="true"/>
        <div className="guides-hero-title">
          <p className="text-xs font-bold tracking-widest text-[#E8C66E]">AREES LOOP GUIDES</p>
          <h1 id="guides-page-title" className="mt-2 text-3xl font-black md:text-5xl">المرشدون السياحيون</h1>
          <p className="mt-2 text-sm text-white/90 md:text-base">خبرة محلية تقودك لتجارب أصيلة في المملكة</p>
        </div>
        <GuidesHeroCards />
      </section>
      <section className="mx-auto max-w-5xl px-5 py-12 text-center">
        <h2 className="text-2xl font-black">ابحث عن مرشد مناسب لوجهتك</h2>
        <p className="mt-3 text-sm leading-8 text-[#0D3B34]/75">
          استكشف ملفات المرشدين في الدليل، وابحث حسب المدينة والتخصص وموقعك الجغرافي عندما تسمح بإذن الموقع.
          وتخضع طلبات انضمام المرشدين للمراجعة والتحقق من الترخيص قبل الاعتماد.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/guides/directory" className="rounded-full bg-[#0D3B34] px-7 py-3 text-sm font-bold text-white">دليل المرشدين</Link>
          <Link href="/guides/register" className="rounded-full border border-[#D4AF37] px-7 py-3 text-sm font-bold">التقديم كمرشد سياحي</Link>
        </div>
      </section>
    </main>
  );
}
