import Link from "next/link";
export default function PlatformSettingsPage(){
 return <main dir="rtl" className="mx-auto max-w-6xl px-5 py-10 text-[#0D3B34]">
 <p className="text-xs font-bold tracking-widest text-[#B38A25]">AREES LOOP ADMIN</p>
 <h1 className="mt-2 text-3xl font-black">إعدادات المنصة</h1>
 <p className="mt-3 text-sm leading-7 text-[#0D3B34]/70">مركز إدارة إعدادات أريس لوب. تُضاف أدوات التحكم الجديدة هنا حسب حاجة التشغيل.</p>
 <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
  <Link href="/admin/navigation" className="group rounded-3xl border border-[#D4AF37]/30 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-lg">
   <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8F0E2] text-2xl text-[#B38A25]">◉</span>
   <h2 className="mt-5 text-lg font-black">إظهار وإخفاء روابط الهيدر</h2>
   <p className="mt-2 text-sm leading-7 text-[#0D3B34]/65">تحكم في ظهور روابط القائمة العلوية للزوار دون حذف الصفحات.</p>
   <span className="mt-6 inline-block text-sm font-bold text-[#B38A25]">فتح الإعدادات ←</span>
  </Link>
  <div className="rounded-3xl border border-dashed border-[#D4AF37]/35 bg-white/60 p-7">
   <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8F0E2] text-2xl text-[#B38A25]">＋</span>
   <h2 className="mt-5 text-lg font-black">إعدادات إضافية</h2>
   <p className="mt-2 text-sm leading-7 text-[#0D3B34]/65">مساحة مخصصة لإضافة أدوات التحكم القادمة حسب متطلبات المنصة.</p>
   <span className="mt-6 inline-block text-xs text-[#0D3B34]/45">قريباً — لا توجد إعدادات مفعّلة هنا</span>
  </div>
 </div>
 </main>
}
