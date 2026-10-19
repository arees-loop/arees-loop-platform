import Image from "next/image";

/**
 * Legal tourism agency identification used on travel-service pages.
 * The AREES LOOP platform brand remains separate from the licensed agency.
 */
export default function TravelAgencyIdentity(){
  return (
    <aside aria-label="بيانات وكالة السفر والسياحة المرخصة" dir="rtl" className="mx-auto my-5 flex w-[min(96%,1100px)] flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#B9984F]/35 bg-[#FFFDF8] px-4 py-4 text-[#0D3B34] shadow-sm sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Image
          src="/Logo/arees-integrated-solutions-logo.png"
          alt="الشعار الرسمي لشركة أريس الحلول المتكاملة المحدودة"
          width={108}
          height={108}
          className="h-[76px] w-[76px] shrink-0 object-contain sm:h-[95px] sm:w-[95px]"
        />
        <div className="min-w-0 text-right">
          <p className="text-sm font-black leading-7 sm:text-base">شركة أريس الحلول المتكاملة المحدودة</p>
          <p className="text-xs font-semibold leading-6 text-[#3B695A]">ترخيص وزارة السياحة رقم <span dir="ltr">73104550</span> — فئة وكالة سفر وسياحة</p>
          <p lang="en" dir="ltr" className="mt-1 text-left text-[11px] leading-5 text-[#567368]">Ministry of Tourism License No. 73104550 · Travel and Tourism Agency</p>
        </div>
      </div>
      <p className="max-w-[200px] text-xs leading-6 text-[#65766E]">خدمات السفر والسياحة المقدمة عبر منصة أريس لوب.</p>
    </aside>
  );
}
