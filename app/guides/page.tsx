import Link from "next/link";
export default function GuidesPage() {
 return <main dir="rtl" className="min-h-screen bg-[#F8F5ED] px-5 pb-24 pt-36 text-[#0D3B34]">
 <div className="mx-auto max-w-6xl">
 <p className="text-sm font-bold text-[#A87917]">AREES LOOP GUIDES</p>
 <h1 className="mt-2 text-4xl font-black">المرشدون السياحيون</h1>
 <p className="mt-4 max-w-2xl leading-8 text-[#0D3B34]/70">اكتشف المرشدين السياحيين وجولاتهم في وجهات المملكة. سيتم عرض المرشدين بعد اكتمال التسجيل ومراجعة الترخيص والاعتماد.</p>
 <div className="mt-8 rounded-3xl border border-[#D4AF37]/30 bg-white p-8 text-center shadow-sm">
 <h2 className="text-xl font-black">لا يوجد مرشدون معتمدون منشورون حالياً</h2>
 <p className="mt-3 text-sm text-[#0D3B34]/65">نعمل على إطلاق دليل المرشدين المعتمدين. لا نعرض ملفات أو حجوزات تجريبية.</p>
 <Link href="/guides/register" className="mt-6 inline-block rounded-full bg-[#0D3B34] px-7 py-3 font-bold text-white">انضم كمرشد سياحي</Link>
 </div></div></main>;
}