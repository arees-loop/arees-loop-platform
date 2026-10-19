import Image from "next/image";
import Link from "next/link";
export default function LicensedTravelOperator(){
 return <section aria-label="معلومات الترخيص والسجل التجاري" dir="rtl" className="mx-auto my-8 w-full max-w-6xl rounded-2xl border border-[#D4AF37]/35 bg-white/85 p-4 text-[#0D3B34] shadow-sm md:p-6">
   <div className="flex flex-wrap items-center gap-4">
     <Image src="/Logo/arees-integrated-solutions-logo.png" alt="الشعار الأساسي لشركة أريس الحلول المتكاملة المحدودة" width={92} height={92} className="h-20 w-20 object-contain" unoptimized/>
     <div className="flex-1">
       <p className="text-sm font-black">شركة أريس الحلول المتكاملة المحدودة</p>
       <p dir="ltr" className="mt-1 text-right text-xs font-bold">AREES AL-HELLOUL AL-MUTAKAMLA CO.LTD</p>
       <p className="mt-2 text-xs leading-6">ترخيص وزارة السياحة <strong>73104550</strong> — فئة <strong>وكالة سفر وسياحة</strong></p>
       <p dir="ltr" className="text-right text-[11px] leading-5">Ministry of Tourism License No. 73104550 — Travel & Tourism Agency</p>
       <p className="text-[11px] leading-6">السجل التجاري: 7037003618 · المدينة المنورة — حي قربان</p>
     </div>
     <Link href="/privacy-policy" className="text-xs font-bold underline underline-offset-4">سياسة الخصوصية</Link>
   </div>
 </section>;
}
