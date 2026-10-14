import Link from "next/link";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = buildPageMetadata({title:"سجّل كمرشد سياحي",description:"عرّف الزوار بخبرتك المحلية، واعرض جولاتك السياحية واستقبل طلبات الإرشاد عبر أريس لوب.",path:"/guides/register",image:"/Image/social/arees-guide-share.webp",imageWidth:1254,imageHeight:1254,imageType:"image/webp",imageAlt:"سجّل كمرشد سياحي في أريس لوب"});
export default function GuideRegisterPage() {
  return <main dir="rtl" className="min-h-screen bg-[#F8F5ED] px-5 pb-24 pt-32 text-[#0D3B34]">
    <section className="mx-auto max-w-4xl overflow-hidden rounded-[30px] border border-[#D4AF37]/30 bg-white shadow-xl">
      <div className="bg-[#0D3B34] px-7 py-10 text-white md:px-12">
        <p className="text-xs font-bold tracking-widest text-[#D4AF37]">AREES LOOP · TOUR GUIDES</p>
        <h1 className="mt-3 text-3xl font-black md:text-4xl">سجّل كمرشد سياحي</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-white/80">تبدأ إجراءات التسجيل بإنشاء حساب والتحقق من البريد الإلكتروني برمز يُرسل إليه. بعد التحقق تُستكمل بيانات المرشد المهنية ويراجع فريق أريس لوب الترخيص قبل نشر الملف.</p>
      </div>
      <div className="grid gap-8 p-7 md:grid-cols-[1fr_0.8fr] md:p-12">
        <div>
          <h2 className="text-xl font-black">الخطوة الأولى: التحقق من البريد</h2>
          <p className="mt-3 text-sm leading-8 text-[#0D3B34]/70">لمنع إنشاء نموذج منفصل لا يحفظ الطلبات، نستخدم مسار تسجيل الشركاء الموجود بالفعل، وهو يتضمن إرسال رمز تحقق للبريد وإثبات التراخيص والموافقة على الإقرارات.</p>
          <Link href="/partner/onboarding" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#0D3B34] px-8 py-3 text-sm font-bold text-white">ابدأ التسجيل والتحقق من البريد ←</Link>
          <p className="mt-4 text-xs leading-6 text-[#0D3B34]/55">اختر صفة مقدم الخدمة «فرد» وفئة النشاط «مرشدون» في خطوات التسجيل. لن يظهر ملفك في الدليل إلا بعد الاعتماد والتحقق من سريان الترخيص.</p>
        </div>
        <aside className="rounded-3xl bg-[#F8F5ED] p-6">
          <h2 className="text-lg font-black">جهّز هذه المعلومات</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[#0D3B34]/80">
            <li>✓ الاسم المهني والصورة الشخصية</li>
            <li>✓ رقم الجوال والبريد الإلكتروني</li>
            <li>✓ مدينة ممارسة الإرشاد والتخصص</li>
            <li>✓ اللغات التي تتحدث بها</li>
            <li>✓ رقم رخصة الإرشاد وصورتها وتاريخ انتهائها</li>
            <li>✓ إقرار بصحة البيانات والتقيد بنطاق الترخيص</li>
          </ul>
          <p className="mt-4 text-xs leading-6 text-[#0D3B34]/55">الحقول الخاصة باللغات والصورة المهنية العامة تحتاج استكمالاً في نموذج الشريك قبل تفعيل نشر الملفات.</p>
        </aside>
      </div>
      <div className="border-t border-[#D4AF37]/20 p-5 text-center"><Link href="/guides/directory" className="text-sm font-bold underline">العودة للبحث عن مرشد</Link></div>
    </section>
  </main>;
}
