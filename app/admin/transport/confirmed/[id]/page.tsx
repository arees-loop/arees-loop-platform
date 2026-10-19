import Image from "next/image";
import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {canManageTransport} from "@/lib/transport-permissions";
import QuotePrintButton from "../../quote/[id]/print-button";

type Props={params:Promise<{id:string}>};
type Details={
 bookingReference?:string;flightNumber?:string;departureTime?:string;arrivalTime?:string;
 returnFlightNumber?:string;returnDepartureTime?:string;returnArrivalTime?:string;
 departureTerminal?:string;arrivalTerminal?:string;
 adultBaggage?:string;childBaggage?:string;infantBaggage?:string;
 hotelName?:string;hotelCheckIn?:string;hotelCheckOut?:string;hotelAddress?:string;roomType?:string;
 travelNotes?:string;hotelNotes?:string;
};
const arabicDate=(date:Date|null)=>date?new Intl.DateTimeFormat("ar-SA",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"}).format(date):"لم يُحدَّد";
function Detail({title,value}:{title:string;value:unknown}){
 if(typeof value!=="string"||!value.trim())return null;
 return <div className="min-w-0 rounded-lg border border-[#ECE2CC] bg-[#FFFEFA] px-3 py-3"><p className="text-[10px] font-bold text-[#947528]">{title}</p><p className="mt-1 break-words text-sm font-bold text-[#0D3B34]">{value}</p></div>;
}
export default async function ConfirmedBookingPdf({params}:Props){
 const session=await getCurrentSession();
 if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role))redirect("/admin/login");
 const {id}=await params;
 const request=await prisma.transportRequest.findFirst({
  where:{id,kind:{in:["FLIGHT","FERRY"]},...(session.user.role==="SUPER_ADMIN"?{}:{assignedToId:session.user.id})},
 });
 if(!request||!canManageTransport(session.user,request.kind==="FERRY"?"FERRY":"FLIGHT"))notFound();
 const [event,verified]=await Promise.all([
  prisma.transportRequestEvent.findFirst({
   where:{requestId:id,action:"BOOKING_CONFIRMATION_DETAILS_SAVED"},
   orderBy:[{createdAt:"desc"},{id:"desc"}],select:{details:true,createdAt:true}
  }),
  prisma.transportRequestEvent.findFirst({
   where:{requestId:id,action:"ADMIN_PAYMENT_VERIFIED"},select:{id:true}
  }),
 ]);
 if(!event||!verified||!["PAID","EXECUTING","DONE"].includes(request.status))notFound();
 const d=(event.details||{}) as Details;
 if(!d.bookingReference||(request.kind==="FLIGHT"&&!d.flightNumber))notFound();
 const passengers=[
  {name:"البالغون / Adults",quantity:request.adults,baggage:d.adultBaggage},
  {name:"الأطفال / Children",quantity:request.children,baggage:d.childBaggage},
  {name:"الرضّع / Infants",quantity:request.infants,baggage:d.infantBaggage}
 ];
 const ferry=request.kind==="FERRY";
 return <main dir="rtl" className="mx-auto max-w-[960px] bg-[#F8F6EF] px-4 py-8 text-[#0D3B34] print:max-w-none print:bg-white print:p-0">
  <div className="mb-4 flex flex-wrap justify-between gap-3 print:hidden"><Link href={ferry?"/admin/transport/ferries?view=requests":"/admin/transport/flights?view=requests"} className="rounded-xl border border-[#D4AF37] bg-white px-5 py-3 text-xs font-bold">← العودة لإدارة الطلبات</Link><QuotePrintButton disabled={false}/></div>
  <article id="arees-print-sheet" className="overflow-hidden rounded-[24px] border border-[#D4AF37]/45 bg-white shadow-lg print:border-0 print:rounded-none print:shadow-none">
   <header className="border-b-4 border-[#B99333] bg-white p-6 print:p-4 sm:p-8">
    <div className="flex flex-wrap items-center justify-between gap-5">
     <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold tracking-wider text-[#997522]">AREES INTEGRATED SOLUTIONS</p>
      <h1 className="mt-2 text-lg font-black">شركة أريس الحلول المتكاملة المحدودة</h1>
      <p dir="ltr" className="mt-1 text-left text-xs font-black">AREES AL-HELLOUL AL-MUTAKAMLA CO.LTD</p>
      <div className="mt-3 space-y-1 text-[10px] leading-6 text-[#42554C]">
       <p>رقم ترخيص وزارة السياحة: <b>73104550</b> · وكيل سفر وسياحة</p>
       <p>السجل التجاري: <b>7037003618</b> · الرقم الضريبي: <b>311897578200003</b></p>
       <p>المملكة العربية السعودية، المدينة المنورة — حي قربان</p>
       <p dir="ltr" className="text-left">Saudi Arabia, Medina - Qurban District · +9660148390473</p>
      </div>
     </div>
     <Image src="/Logo/arees-integrated-solutions-logo.png" alt="شعار شركة أريس" width={140} height={140} unoptimized className="h-[106px] w-[106px] shrink-0 object-contain"/>
    </div>
    <div className="mt-5 rounded-xl bg-[#0D3B34] px-5 py-4 text-white"><h2 className="text-xl font-black">{ferry?"تفاصيل حجز باخرة مؤكد":"تفاصيل حجز طيران مؤكد"}</h2><p dir="ltr" className="mt-1 text-left text-xs font-bold">{ferry?"Confirmed Ferry Booking Details":"Confirmed Flight Booking Details"}</p></div>
   </header>
   <div className="space-y-6 px-6 py-7 print:space-y-4 print:px-5 print:py-4 sm:px-8">
    <section className="grid gap-3 text-xs sm:grid-cols-3 print:grid-cols-3">
     <Detail title="مرجع طلب أريس" value={request.reference}/>
     <Detail title="رقم الحجز المؤكد لدى الناقل / PNR" value={d.bookingReference||""}/>
     <Detail title="تاريخ إصدار التفاصيل" value={arabicDate(event.createdAt)}/>
    </section>
    <section><h3 className="border-b border-[#D4AF37]/45 pb-2 text-base font-black">بيانات المسافر والرحلة</h3>
     <div className="mt-3 grid gap-3 sm:grid-cols-2 print:grid-cols-2">
      <Detail title="اسم العميل" value={request.customerName}/>
      <Detail title={ferry?"مشغل الباخرة":"شركة الطيران / الناقل"} value={request.carrierName||"غير محدد"}/>
      <Detail title="من" value={request.origin}/>
      <Detail title="إلى" value={request.destination}/>
      <Detail title="تاريخ السفر" value={arabicDate(request.travelDate)}/>
      {request.returnDate&&<Detail title="تاريخ العودة" value={arabicDate(request.returnDate)}/>}
      <Detail title={ferry?"اسم الباخرة / رقم الرحلة البحرية":"رقم رحلة الذهاب"} value={d.flightNumber||""}/>
      <Detail title={ferry?"الإبحار / الوقت المحلي":"الإقلاع / الوقت المحلي"} value={d.departureTime||""}/>
      <Detail title="الوصول / الوقت المحلي" value={d.arrivalTime||""}/>
      <Detail title="صالة المغادرة" value={d.departureTerminal||""}/>
      <Detail title="صالة الوصول" value={d.arrivalTerminal||""}/>
      <Detail title="رقم رحلة العودة" value={d.returnFlightNumber||""}/>
      <Detail title="مغادرة العودة" value={d.returnDepartureTime||""}/>
      <Detail title="وصول العودة" value={d.returnArrivalTime||""}/>
     </div>
    </section>
    <section><h3 className="border-b border-[#D4AF37]/45 pb-2 text-base font-black">المسافرون والأمتعة</h3>
     <table className="mt-3 w-full border-collapse text-right text-xs"><thead><tr className="bg-[#F5F0E4]"><th className="border border-[#E3D6B6] p-3">الفئة / Category</th><th className="border border-[#E3D6B6] p-3">العدد</th><th className="border border-[#E3D6B6] p-3">الأمتعة المسموح بها حسب التذكرة</th></tr></thead>
      <tbody>{passengers.map(p=><tr key={p.name}><td className="border border-[#E8DFC8] p-3 font-bold">{p.name}</td><td className="border border-[#E8DFC8] p-3">{p.quantity}</td><td className="border border-[#E8DFC8] p-3">{p.baggage||"راجع التذكرة المصدرة"}</td></tr>)}</tbody></table>
     <p className="mt-2 text-[10px] text-[#6E6A5C]">الأعداد مأخوذة من الطلب؛ الأمتعة المدوّنة أدخلتها الإدارة وفق التذكرة الصادرة ولا تُقدَّر تلقائياً.</p>
    </section>
    {(d.hotelName||d.hotelAddress||d.hotelNotes)&&<section><h3 className="border-b border-[#D4AF37]/45 pb-2 text-base font-black">تفاصيل السكن (إن كان مشمولاً)</h3><div className="mt-3 grid gap-3 sm:grid-cols-2 print:grid-cols-2">
      <Detail title="الفندق / السكن" value={d.hotelName||""}/>
      <Detail title="نوع الغرفة" value={d.roomType||""}/>
      <Detail title="تاريخ الدخول" value={d.hotelCheckIn||""}/>
      <Detail title="تاريخ الخروج" value={d.hotelCheckOut||""}/>
      <Detail title="العنوان" value={d.hotelAddress||""}/>
     </div>{d.hotelNotes&&<p className="mt-3 whitespace-pre-wrap rounded-xl bg-[#F6F5EE] p-4 text-xs leading-7">{d.hotelNotes}</p>}</section>}
    {d.travelNotes&&<section><h3 className="border-b border-[#D4AF37]/45 pb-2 text-base font-black">ملاحظات وتعليمات السفر</h3><p className="mt-3 whitespace-pre-wrap rounded-xl bg-[#F6F5EE] p-4 text-xs leading-7">{d.travelNotes}</p></section>}
    <section className="rounded-xl border border-[#D4AF37]/35 bg-[#FFFAEF] p-4 text-[11px] leading-7"><b>تنويه:</b> هذه تفاصيل حجز مسجلة لدى شركة أريس بعد تأكيد السداد والتحقق من بيانات الحجز المدخلة بواسطة الإدارة؛ ليست تذكرة الناقل الأصلية ولا فاتورة ضريبية. يُرجى مطابقة رقم الحجز والأسماء ومواعيد الإقلاع وشروط الأمتعة مع التذكرة الصادرة، وقد تتغير مواعيد الرحلات من الناقل.</section>
   </div>
  </article>
 </main>;
}
