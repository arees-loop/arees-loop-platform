import Link from "next/link";
import { GUIDE_LICENSE_CATEGORIES, SAUDI_CITY_SUGGESTIONS } from "@/lib/guides/reference-data";
export default function GuideRegisterPage() {
 return <main dir="rtl" className="min-h-screen bg-[#F8F5ED] px-5 pb-24 pt-36 text-[#0D3B34]"><section className="mx-auto max-w-4xl rounded-3xl border border-[#D4AF37]/30 bg-white p-6 shadow-sm md:p-10">
 <p className="font-bold text-[#A87917]">AREES LOOP GUIDES</p><h1 className="mt-3 text-3xl font-black">انضم كمرشد سياحي</h1><p className="mt-4 leading-8 text-[#0D3B34]/70">نجهز مسار تسجيل المرشدين وربط ترخيص وزارة السياحة والموقع الجغرافي ولوحة الخدمات. هذه الحقول توضح البيانات المطلوبة، ولا تُرسل أو تحفظ طلب تسجيل حالياً.</p>
 <div className="mt-7 grid gap-5 md:grid-cols-2">
 <label className="flex flex-col gap-2 text-sm font-bold">مدينة ممارسة الإرشاد<input disabled placeholder="ابحث عن مدينتك" list="registration-cities" className="rounded-xl border border-[#0D3B34]/20 bg-[#F8F5ED] p-3 text-[#0D3B34]/70"/></label>
 <label className="flex flex-col gap-2 text-sm font-bold">فئة الترخيص<select disabled className="rounded-xl border border-[#0D3B34]/20 bg-[#F8F5ED] p-3"><option>اختر فئة الترخيص</option>{GUIDE_LICENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>
 <label className="flex flex-col gap-2 text-sm font-bold">المسار أو الموقع أو التخصص المعتمد<input disabled placeholder="حسب البيانات المسجلة في الترخيص" className="rounded-xl border border-[#0D3B34]/20 bg-[#F8F5ED] p-3"/></label>
 <label className="flex flex-col gap-2 text-sm font-bold">موقع نقطة الانطلاق<input disabled placeholder="يُحدد على الخريطة بعد تفعيل التسجيل" className="rounded-xl border border-[#0D3B34]/20 bg-[#F8F5ED] p-3"/></label>
 </div><datalist id="registration-cities">{SAUDI_CITY_SUGGESTIONS.map(c=><option key={c} value={c}/>)}</datalist>
 <div className="mt-7 rounded-2xl bg-[#F8F5ED] p-5 text-sm leading-8"><strong>سيُطلب عند تفعيل التسجيل:</strong> الاسم والصورة الشخصية، رقم ترخيص الإرشاد السياحي وصورته، تاريخ الانتهاء، الفئات والنطاقات المعتمدة، المدينة ونقطة الانطلاق، اللغات، وبيانات التواصل. لا يُنشر الملف إلا بعد مراجعة الترخيص.</div>
 <Link href="/guides" className="mt-7 inline-block rounded-full bg-[#0D3B34] px-7 py-3 font-bold text-white">العودة إلى دليل المرشدين</Link>
 </section></main>;
}