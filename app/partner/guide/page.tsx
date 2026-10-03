"use client";

import Link from "next/link";

const steps = [
  ["01", "الدخول إلى لوحة الشريك", "بعد اعتماد الحساب، تدخل مباشرة إلى لوحة الشريك لمتابعة الخدمات والحجوزات والتسويات."],
  ["02", "إضافة تجربة أو برنامج", "أدخل الاسم والوصف والموقع والمدة والمواعيد والسعة والصور وما يشمله السعر وما لا يشمله."],
  ["03", "الجهة المنظمة أو المنفذة", "أدخل اسم الجهة المنظمة أو المنفذة وبيانات الترخيص ذات الصلة. تظهر هذه البيانات للعميل بوضوح في صفحة التجربة أو البرنامج."],
  ["04", "اختيار طريقة السعر", "لكل خدمة تختار هل السعر المدخل شامل المقابل التجاري لأريس أو يضاف إليه. ستشاهد السعر النهائي وصافي المستحق المتوقع قبل الإرسال."],
  ["05", "الإلغاء والاسترداد والضمان", "حدد سياسة الإلغاء والاسترداد، وأي ضمان أو تأمين مسترد وشروط استرداده إن وجد."],
  ["06", "الإرسال للمراجعة", "بعد اكتمال البيانات أرسل الخدمة للمراجعة. لا يتم نشر أي تجربة أو برنامج تلقائياً قبل الاعتماد."],
  ["07", "الحجوزات والتنفيذ", "تابع الحجوزات ونفذ الخدمة حسب الوصف والمواعيد والسياسات المعتمدة، وأبلغ أريس فوراً عند تعذر التنفيذ."],
  ["08", "التسويات", "تابع كشفاً واضحاً للمبيعات والاستردادات والتعديلات والمقابل التجاري ورسوم الدفع والتحويل وصافي مستحقاتك."],
];

export default function PartnerGuidePage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#F6F2E8] text-[#0D3B34]">
      <header className="border-b border-[#0D3B34]/8 bg-[#FBF9F3]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 md:px-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#B99124]">AREES LOOP PARTNER GUIDE</p>
            <h1 className="mt-1 text-lg font-bold">دليل الشريك</h1>
          </div>
          <Link href="/partner/dashboard" className="rounded-full border border-[#0D3B34]/10 bg-white px-4 py-2 text-xs font-bold">لوحة الشريك</Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <section className="overflow-hidden rounded-[34px] bg-[#0D3B34] p-7 text-white md:p-10">
          <p className="text-xs font-bold text-[#E7C75E]">مرحباً بك شريكاً في Arees Loop</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-[1.5] md:text-[42px]">من إضافة تجربتك إلى أول حجز، بخطوات واضحة وبسيطة.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/65">هذا الدليل يلخص أهم ما تحتاجه لإدارة خدماتك عبر المنصة. كل تجربة أو برنامج يظل باسم الجهة المنظمة أو المنفذة الفعلية، ويخضع للمراجعة قبل النشر.</p>
        </section>

        <section className="mt-7 grid gap-4 md:grid-cols-2">
          {steps.map(([number, title, description]) => (
            <article key={number} className="rounded-[26px] border border-[#0D3B34]/8 bg-white p-6 shadow-[0_12px_35px_rgba(13,59,52,0.04)]">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F4EAC8] text-xs font-black text-[#9A741B]">{number}</span>
                <div>
                  <h3 className="text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#647A74]">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-7 rounded-[30px] border border-[#D4AF37]/25 bg-[#FFF9E9] p-6 md:p-8">
          <p className="text-[10px] font-bold tracking-[0.18em] text-[#B99124]">قبل إرسال أي خدمة</p>
          <h3 className="mt-2 text-xl font-bold">مراجعة سريعة</h3>
          <div className="mt-5 grid gap-3 text-sm leading-7 text-[#526B65] md:grid-cols-2">
            <p>✓ الترخيص والتصاريح المطلوبة سارية.</p>
            <p>✓ الجهة المنظمة أو المنفذة محددة بوضوح.</p>
            <p>✓ السعر النهائي وسياسة الإلغاء واضحان.</p>
            <p>✓ الصور والوصف يعكسان الخدمة الفعلية.</p>
            <p>✓ السعة والمواعيد والتوفر محدثة.</p>
            <p>✓ شروط الضمان المسترد مدخلة إن وجد.</p>
          </div>
        </section>

        <section className="mt-7 rounded-[30px] bg-white p-6 text-center md:p-8">
          <p className="text-xs font-bold text-[#B99124]">الدعم الفني</p>
          <h3 className="mt-2 text-xl font-bold">نحن معك عند الحاجة</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#647A74]">راسل فريق Arees Loop عبر البريد الإلكتروني، وسيتواصل معك الفريق عند الحاجة.</p>
          <a href="mailto:info@areesloop.com" className="mt-5 inline-flex rounded-2xl bg-[#0D3B34] px-6 py-3.5 text-sm font-bold text-white" dir="ltr">info@areesloop.com</a>
        </section>
      </div>
    </main>
  );
}
