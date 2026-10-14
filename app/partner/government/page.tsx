import Link from "next/link";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({title:"سجّل كجهة حكومية",description:"أبرز الوجهات والفعاليات والبرامج الرسمية، ووسّع وصولها للزوار عبر أريس لوب.",path:"/partner/government",image:"/Image/social/arees-partner-share.webp",imageWidth:1254,imageHeight:1254,imageType:"image/webp",imageAlt:"الجهات الحكومية في أريس لوب"});
export default function GovernmentPartnerPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#F8F5ED] px-5 pb-24 pt-28 text-[#0D3B34]">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-[#D4AF37]/30 bg-white shadow-[0_20px_65px_rgba(13,59,52,.08)]">
        <div className="bg-[#0D3B34] px-6 py-12 text-white md:px-12">
          <p className="text-xs font-bold tracking-[.2em] text-[#D4AF37]">AREES LOOP · GOVERNMENT & NONPROFIT</p>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">انضمام الجهات الحكومية وغير الربحية</h1>
          <p className="mt-5 max-w-3xl text-base leading-9 text-white/80">
            خصصنا مساراً للجهات الحكومية وغير الربحية لإضافة فعالياتها وبرامجها والتعريف بها عبر أريس لوب
            بعد مراجعة الهوية والتأكد من صفة مقدم الطلب واعتماد إدارة المنصة.
          </p>
        </div>
        <div className="grid gap-5 px-6 py-10 md:grid-cols-3 md:px-12">
          <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#FBF8F0] p-6">
            <span className="text-xs font-extrabold text-[#A87917]">01</span>
            <h2 className="mt-2 text-lg font-bold">اسم الجهة الرسمي</h2>
            <p className="mt-2 text-sm leading-7 text-[#0D3B34]/70">أدخل الاسم المعتمد للجهة، والمدينة، وبيانات المسؤول المخوّل بالتواصل.</p>
          </div>
          <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#FBF8F0] p-6">
            <span className="text-xs font-extrabold text-[#A87917]">02</span>
            <h2 className="mt-2 text-lg font-bold">الشعار والمستند الرسمي</h2>
            <p className="mt-2 text-sm leading-7 text-[#0D3B34]/70">ارفع الشعار الأصلي بصيغة PNG أو JPG أو WEBP وأرفق إثبات الجهة.</p>
          </div>
          <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#FBF8F0] p-6">
            <span className="text-xs font-extrabold text-[#A87917]">03</span>
            <h2 className="mt-2 text-lg font-bold">إرسال طلب الانضمام</h2>
            <p className="mt-2 text-sm leading-7 text-[#0D3B34]/70">بعد التحقق من البريد، أرسل الطلب لمراجعة أريس. لا تنشر الجهة أو شعارها كمعتمدة قبل الموافقة.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 px-6 pb-12">
          <Link href="/partner/onboarding?type=government"
                className="rounded-full bg-[#0D3B34] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#14564B]">
            بدء طلب انضمام جهة حكومية
          </Link>
          <Link href="/partner/status" className="rounded-full border border-[#C5A052] px-8 py-4 text-sm font-bold">
            متابعة طلب سابق
          </Link>
        </div>
      </section>
    </main>
  );
}
