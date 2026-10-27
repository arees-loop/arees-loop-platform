import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canManageTransport, type TransportKind } from "@/lib/transport-permissions";
import QuotePrintButton from "./print-button";

type Props={params:Promise<{id:string}>};
const policies={
  FLIGHT:"التعديل والإلغاء والاسترداد وفق شروط الناقل الجوي وفئة الحجز والتذكرة عند إصدارها.",
  FERRY:"التعديل والإلغاء والاسترداد وفق سياسة شركة البواخر المشغلة، ودرجة الرحلة وموعد السفر.",
  VISA:"إصدار التأشيرة وتعديلها وإلغاؤها وفق شروط الجهة المُصدِرة والمتطلبات النظامية، ولا يضمن عرض السعر الموافقة على التأشيرة.",
  DRIVING_LICENSE:"إصدار الرخصة الدولية وفق متطلبات الجهة المُصدِرة وصلاحية المستندات والشروط المعروضة قبل الإصدار.",
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
  if(session.user.role!=="SUPER_ADMIN" &&
    (item.assignedToId!==session.user.id || !canManageTransport(session.user,item.kind as TransportKind)))notFound();
  const kind=item.kind==="FERRY"?"باخرة":item.kind==="VISA"?"تأشيرة":item.kind==="DRIVING_LICENSE"?"رخصة قيادة دولية":"طيران";
  const hasQuote=item.quoteAmountSar!==null;
  return (
    <main dir="rtl" className="quote-print-root mx-auto max-w-[920px] bg-[#F7F4EC] px-4 pb-20 pt-8 text-[#0D3B34] print:m-0 print:max-w-none print:bg-white print:p-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin/transport" className="rounded-full border border-[#D4AF37]/45 bg-white px-5 py-3 text-sm font-bold">← العودة للطلبات</Link>
        <QuotePrintButton disabled={!hasQuote}/>
      </div>
      <article className="quote-print-sheet overflow-hidden rounded-[26px] border border-[#D4AF37]/45 bg-white shadow-xl print:rounded-none print:border-0 print:shadow-none">
        <header className="border-b-4 border-[#B38A25] bg-white px-8 py-7 text-[#0D3B34]">
          <div className="quote-header-brand-row flex flex-wrap items-start justify-between gap-5">
            <div className="quote-header-copy min-w-0 flex-1">
              <p className="text-[11px] font-bold text-[#997523]">الاسم التجاري / Trade Name</p>
              <h1 className="mt-1 text-xl font-black">شركة أريس الحلول المتكاملة المحدودة</h1>
              <p className="mt-3 text-sm font-black text-[#947022]">رقم ترخيص خدمات السفر والسياحة: 73104550 · فئة وكالة سفر وسياحة</p>
              <p dir="ltr" className="quote-header-license-en mt-1 text-left text-xs font-bold">Travel & Tourism License No. 73104550 · Travel Agency</p>
            </div>
            <div className="quote-header-logo flex min-w-[140px] items-center justify-center rounded-xl border border-[#D4AF37]/40 bg-white p-3"><Image src="/Logo/arees-integrated-solutions-logo.png" width={170} height={170} alt="شعار شركة أريس الحلول المتكاملة المحدودة" loading="eager" unoptimized className="h-[105px] w-[105px] object-contain"/></div>
          </div>
          <div className="quote-company-location mt-5 flex flex-wrap justify-between gap-2 border-t border-[#D4AF37]/30 pt-4 text-xs"><p>مقر الشركة: المدينة المنورة، المملكة العربية السعودية</p><p>Company location: Medina, Saudi Arabia</p></div>
          <div className="mt-5 rounded-xl bg-[#0D3B34] px-5 py-4 text-white"><h2 className="text-xl font-black">عرض سعر {kind} / Quotation</h2><p className="mt-1 text-xs text-white/80">هذا المستند عرض سعر وليس فاتورة ضريبية / This is a quotation, not a tax invoice</p></div>
        </header>
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
            {item.carrierName&&<div className="sm:col-span-2">الناقل / مشغل الخدمة: <b>{item.carrierName}</b></div>}
            {item.kind==="FLIGHT"&&<div className="sm:col-span-2">
              نوع الرحلة: <b>{item.tripType==="ROUND_TRIP"?"ذهاب وعودة":item.tripType==="MULTI_CITY"?"متعدد الوجهات":"ذهاب فقط"}</b>
              {item.returnDate&&<p className="mt-1">تاريخ العودة: <b>{date(item.returnDate)}</b></p>}
            </div>}
            {item.kind==="FLIGHT"&&item.tripType==="MULTI_CITY"&&Array.isArray(item.itinerary)&&
              <div className="sm:col-span-2 rounded-xl border border-[#D4AF37]/30 bg-white p-4">
                <h3 className="mb-2 font-black">خط سير الرحلات المتعددة</h3>
                {(item.itinerary as Array<{origin:string;destination:string;travelDate:string}>).map((leg,i)=>
                  <p key={i} className="mt-1 leading-7">المرحلة {i+1}: {leg.origin} ← {leg.destination} · {leg.travelDate}</p>)}
              </div>}
          </div>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-3 rounded-[20px] border border-[#D4AF37]/45 bg-[#FFFAED] p-6">
            <div><p className="text-sm font-bold">إجمالي عرض السعر</p><p className="mt-2 text-xs text-[#0D3B34]/65">بالريال السعودي — {item.adults + item.children + item.infants} مسافرين</p></div>
            <p className="text-3xl font-black text-[#947022]">{hasQuote?Number(item.quoteAmountSar).toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}):"—"} ر.س</p>
          </div>
          <section className="mt-4 rounded-xl border border-[#D4AF37]/35 p-4 text-xs leading-7"><p className="font-bold">تفاصيل الرسوم والضريبة / Service fees & VAT</p><p>الإجمالي أعلاه هو سعر العرض المقدم للعميل بالريال السعودي. لا يتضمن سجل الطلب حالياً تفصيلاً معتمداً لضريبة القيمة المضافة ورسوم الخدمة؛ لذلك لا يعرض المستند قيماً ضريبية أو رسوماً تقديرية غير موثقة.</p><p className="mt-1 font-bold text-amber-800">هذا عرض سعر وليس فاتورة ضريبية. أي رسوم إضافية أو ضريبة منطبقة يجب الإفصاح عنها بوضوح قبل التأكيد النهائي.</p></section>
          {item.quoteNotes && <section className="mt-7"><h2 className="font-black">ملاحظات العرض والتشغيل</h2><p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#F5F6F2] p-5 text-sm leading-8">{item.quoteNotes}</p></section>}
          <section className="mt-7 border-t border-[#D4AF37]/30 pt-6">
            <h2 className="font-black">الشروط والضوابط</h2>
            <p className="mt-2 text-sm leading-8">{policies[item.kind==="FERRY"?"FERRY":item.kind==="VISA"?"VISA":item.kind==="DRIVING_LICENSE"?"DRIVING_LICENSE":"FLIGHT"]}</p>
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
