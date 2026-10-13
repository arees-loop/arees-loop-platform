import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import QuotePrintButton from "./print-button";

type Props={params:Promise<{id:string}>};
const policies={
  FLIGHT:"التعديل والإلغاء والاسترداد وفق شروط الناقل الجوي وفئة الحجز والتذكرة عند إصدارها.",
  FERRY:"التعديل والإلغاء والاسترداد وفق سياسة شركة البواخر المشغلة، ودرجة الرحلة وموعد السفر.",
};
const date=(d:Date|null)=>d?new Intl.DateTimeFormat("ar-SA",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"}).format(d):"غير محدد";

export default async function QuotePage({params}:Props) {
  const session=await getCurrentSession();
  if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role)) redirect("/admin/login");
  const {id}=await params;
  const item=await prisma.transportRequest.findFirst({
    where:{id,...(session.user.role==="SUPER_ADMIN"?{}:{assignedToId:session.user.id})},
  });
  if(!item)notFound();
  const kind=item.kind==="FERRY"?"باخرة":"طيران";
  const hasQuote=item.carrierName&&item.quoteAmountSar!==null;
  return (
    <main dir="rtl" className="mx-auto max-w-[920px] bg-[#F7F4EC] px-4 pb-20 pt-8 text-[#0D3B34] print:m-0 print:max-w-none print:bg-white print:p-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/transport" className="rounded-full border border-[#D4AF37]/45 bg-white px-5 py-3 text-sm font-bold">← العودة للطلبات</Link>
        <QuotePrintButton disabled={!hasQuote}/>
      </div>
      <article className="overflow-hidden rounded-[26px] border border-[#D4AF37]/45 bg-white shadow-xl print:rounded-none print:border-0 print:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-5 bg-[#0D3B34] px-8 py-7 text-white print:bg-white print:text-[#0D3B34]">
          <div>
            <p className="text-xs font-black tracking-[.14em] text-[#E4C577]">AREES · TRAVEL SERVICES</p>
            <h1 className="mt-2 text-3xl font-black">عرض سعر {kind}</h1>
            <p className="mt-2 text-xs text-white/80 print:text-[#0D3B34]">شركة أريس الحلول المتكاملة المحدودة للسفر والسياحة</p>
            <p className="mt-1 text-xs text-white/75 print:text-[#0D3B34]">السجل التجاري: 7037003618</p>
          </div>
          <Image src="/Logo/arees-loop-logo.png" alt="Arees Loop" width={170} height={90} unoptimized className="h-auto w-[128px] rounded-xl bg-white p-2"/>
        </div>
        <div className="px-8 py-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4AF37]/30 pb-5 text-sm">
            <div><span className="font-bold">رقم المرجع:</span> <span dir="ltr">{item.reference}</span></div>
            <div><span className="font-bold">تاريخ إعداد العرض:</span> {date(item.quoteUpdatedAt || new Date())}</div>
            <div><span className="font-bold">ساري حتى:</span> {date(item.quoteValidUntil)}</div>
          </div>
          <h2 className="mt-7 text-xl font-black">بيانات العميل والرحلة</h2>
          <div className="mt-4 grid gap-4 rounded-[18px] bg-[#F8F5EF] p-6 text-sm sm:grid-cols-2 print:grid-cols-2">
            <div>العميل: <b>{item.customerName}</b></div>
            <div>الجوال: <b dir="ltr">+{item.countryCode}{item.phone}</b></div>
            <div>من: <b>{item.origin}</b></div>
            <div>إلى: <b>{item.destination}</b></div>
            <div>تاريخ السفر: <b>{date(item.travelDate)}</b></div>
            <div>المسافرون: <b>{item.adults} بالغ، {item.children} طفل، {item.infants} رضيع</b></div>
            <div className="sm:col-span-2">الناقل/الباخرة: <b>{item.carrierName || "لم يحدد بعد"}</b></div>
          </div>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-3 rounded-[20px] border border-[#D4AF37]/45 bg-[#FFFAED] p-6">
            <div><p className="text-sm font-bold">إجمالي عرض السعر</p><p className="mt-2 text-xs text-[#0D3B34]/65">بالريال السعودي — {item.adults + item.children + item.infants} مسافرين</p></div>
            <p className="text-3xl font-black text-[#947022]">{hasQuote?Number(item.quoteAmountSar).toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}):"—"} ر.س</p>
          </div>
          {item.quoteNotes && <section className="mt-7"><h2 className="font-black">ملاحظات العرض والتشغيل</h2><p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#F5F6F2] p-5 text-sm leading-8">{item.quoteNotes}</p></section>}
          <section className="mt-7 border-t border-[#D4AF37]/30 pt-6">
            <h2 className="font-black">الشروط والضوابط</h2>
            <p className="mt-2 text-sm leading-8">{policies[item.kind==="FERRY"?"FERRY":"FLIGHT"]}</p>
            <p className="mt-2 text-sm font-bold leading-8">هذا المستند عرض سعر بناءً على طلب العميل، وليس تذكرة صادرة أو حجزاً مؤكداً أو إثبات سداد. الأسعار والتوفر قابلة للتغيير حتى التأكيد النهائي.</p>
          </section>
          <div className="mt-10 flex items-center justify-between border-t border-[#D4AF37]/30 pt-5 text-xs text-[#0D3B34]/60">
            <p>AREES LOOP · عرض سعر رسمي صادر عن شركة أريس</p>
            <p>المدينة المنورة · المملكة العربية السعودية</p>
          </div>
        </div>
      </article>
    </main>
  );
}
