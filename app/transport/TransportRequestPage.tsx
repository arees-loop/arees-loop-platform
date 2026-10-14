"use client";
import { AirportLookup } from "@/app/components/AviationLookup";
import Link from "next/link";
import { storeCustomerClaim } from "@/lib/customer-request-claims";
import { useEffect, useState, type FormEvent } from "react";

type Kind="FLIGHT"|"FERRY";
type Offer={id:string;title:string;description:string|null;carrierName:string|null;origin:string|null;destination:string|null;travelDate:string|null;scheduleType?:string;scheduleData?:unknown;amountSar:number|null;adultPriceSar:number|null;childPriceSar:number|null;infantPriceSar:number|null;priceUnit:string|null;bannerUrl:string|null;operationStatus:string;operationNote:string|null};
type Confirmation={reference:string;trackingToken:string;kind:string;customerName:string;origin:string;destination:string;travelDate:string;adults:number;children:number;infants:number;phone:string;notice:string;tripType?:string;returnDate?:string|null;itinerary?:{origin:string;destination:string;travelDate:string}[]};
const codes=[["966","السعودية +966"],["249","السودان +249"],["20","مصر +20"],["971","الإمارات +971"],["974","قطر +974"],["965","الكويت +965"],["973","البحرين +973"],["968","عُمان +968"],["1","أمريكا/كندا +1"],["44","بريطانيا +44"],["other","دولة أخرى"]];
const field="w-full min-w-0 rounded-2xl border border-[#C5AE73]/35 bg-[#FCFBF6] px-4 py-3.5 text-sm text-[#0D3B34] outline-[#B69034]";
const label="flex flex-col gap-2 text-sm font-bold text-[#183E36]";
const today=new Date().toISOString().slice(0,10);
const policies={
  FLIGHT:"تخضع شروط التعديل والإلغاء والاسترداد لسياسة شركة الطيران الناقلة وفئة التذكرة وقت إصدارها. لا يصبح الطلب حجزاً مؤكداً إلا بعد العرض والموافقة وإتمام إجراءات الإصدار.",
  FERRY:"تخضع شروط التعديل والإلغاء والاسترداد لسياسة شركة البواخر المشغّلة ودرجة الحجز وموعد الرحلة. العرض لا يضمن توفر المقاعد حتى التأكيد النهائي.",
};

export default function TransportRequestPage({kind}:{kind:Kind}) {
  const ferry=kind==="FERRY", title=ferry?"حجوزات البواخر":"حجوزات الطيران";
  const [offers,setOffers]=useState<Offer[]>([]);
  const [offersError,setOffersError]=useState(false);
  const [offerIndex,setOfferIndex]=useState(0);
  const [offersPaused,setOffersPaused]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [confirmation,setConfirmation]=useState<Confirmation|null>(null);
  const [claimSaved,setClaimSaved]=useState(true);
  const [countryCode,setCountryCode]=useState("966");
  const [customCountryCode,setCustomCountryCode]=useState("");
  const [origin,setOrigin]=useState(ferry?"سواكن":"");
  const [destination,setDestination]=useState(ferry?"جدة":"");
  const [travelDate,setTravelDate]=useState("");
  const [tripType,setTripType]=useState<"ONE_WAY"|"ROUND_TRIP"|"MULTI_CITY">("ONE_WAY");
  const [returnDate,setReturnDate]=useState("");
  const [legs,setLegs]=useState([{origin:"",destination:"",travelDate:""},{origin:"",destination:"",travelDate:""}]);
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [email,setEmail]=useState("");
  const [adults,setAdults]=useState(1);
  const [children,setChildren]=useState(0);
  const [infants,setInfants]=useState(0);
  const [notes,setNotes]=useState("");

  useEffect(()=>{
    let live=true;
    async function refreshOffers(){
      try {
        const response=await fetch("/api/transport/offers?kind="+kind,{cache:"no-store"});
        const data=response.ok?await response.json():null;
        if(!live)return;
        if(data?.success){
          setOffers(data.data||[]);
          setOffersError(false);
          setOfferIndex(i=>Math.min(i,Math.max(0,(data.data?.length||0)-1)));
        } else setOffersError(true);
      } catch{if(live)setOffersError(true);}
    }
    void refreshOffers();
    const interval=setInterval(()=>void refreshOffers(),60000);
    return()=>{live=false;clearInterval(interval);};
  },[kind]);

  useEffect(()=>{
    if(offers.length<2||offersPaused)return;
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    if(media.matches)return;
    const timer=window.setInterval(()=>setOfferIndex(index=>(index+1)%offers.length),7000);
    return()=>window.clearInterval(timer);
  },[offers.length,offersPaused]);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy)return;
    setError("");
    setBusy(true);
    try {
      const result=await fetch("/api/transport/requests",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          kind,customerName:name,customerEmail:email,
          countryCode:countryCode==="other"?customCountryCode:countryCode,phone,
          origin:kind==="FLIGHT"&&tripType==="MULTI_CITY"?legs[0].origin:origin,
          destination:kind==="FLIGHT"&&tripType==="MULTI_CITY"?legs[0].destination:destination,
          travelDate:kind==="FLIGHT"&&tripType==="MULTI_CITY"?legs[0].travelDate:travelDate,
          tripType:kind==="FERRY"?"ONE_WAY":tripType,returnDate:tripType==="ROUND_TRIP"?returnDate:"",
          itinerary:kind==="FLIGHT"&&tripType==="MULTI_CITY"?legs:[],adults,children,infants,notes,
        }),
      });
      const body=await result.json().catch(()=>null);
      if(!result.ok||!body?.success){setError(body?.message||"تعذر إرسال الطلب، حاول مجدداً.");return;}
      const saved=storeCustomerClaim({reference:body.data.reference,token:body.data.trackingToken});
      setClaimSaved(saved);
      setConfirmation(body.data);
    }catch{setError("تعذر الاتصال بالخدمة حالياً. أعد المحاولة.");}
    finally{setBusy(false);}
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#F7F4ED] px-4 pb-12 pt-32 text-[#0D3B34] md:px-8">
      <section className="mx-auto max-w-[1450px]">
        <div className="mb-3 overflow-hidden bg-[#F7F4ED]">
          {/* Crop the artwork's white outer margin; preserve its designed banner and current gap below. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ferry?"/Image/hero/arees-ferry-banner.webp":"/Image/hero/arees-flight-banner.webp"}
            alt={ferry?"حجز البواخر — رحلتك البحرية تبدأ هنا":"حجز الطيران — رحلتك الجوية تبدأ هنا"}
            className="block aspect-[4.2/1] w-full scale-[1.04] object-cover object-center" />
        </div>
        

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.3fr)]">
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-28">
            <div className="offer-studio relative overflow-hidden rounded-[30px] border border-[#D4AF37]/30 bg-[#0D3B34] p-4 text-white shadow-[0_22px_60px_rgba(13,59,52,.2)] sm:p-5"
              onMouseEnter={()=>setOffersPaused(true)} onMouseLeave={()=>setOffersPaused(false)} onFocusCapture={()=>setOffersPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setOffersPaused(false);}}>
              <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full border border-[#E8CC85]/20 offer-studio-orbit" />
              <div className="pointer-events-none absolute -bottom-20 -right-12 h-56 w-56 rounded-full border border-white/10 offer-studio-orbit offer-studio-orbit-slow" />
              <div className="relative z-10 flex items-start justify-between gap-3 px-1 pb-4">
                <div>
                  <p className="text-xs font-black tracking-wide text-[#E8CC85]">{ferry?"جداول البواخر والعروض":"عروض الطيران والوجهات"}</p>
                  <h2 className="mt-1 text-xl font-black sm:text-2xl">العروض والتخفيضات</h2>
                </div>
                <span className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white/85"><span className="h-2 w-2 animate-pulse rounded-full bg-[#E8CC85]"/> عروض محدثة</span>
              </div>
              {offersError&&<div role="status" className="relative z-10 rounded-2xl border border-amber-200/40 bg-white/10 px-5 py-4 text-sm leading-7">تعذر تحميل العروض الآن. يمكنك إرسال طلبك وسنراجع المواعيد معك.</div>}
              {offers.length>0&&<>
                <div className="relative px-1 pb-2 pt-1">
                  <div className="pointer-events-none absolute inset-x-5 top-5 h-8 rounded-[28px] bg-[#D4AF37]/15 offer-studio-layer offer-studio-layer-back" />
                  <div className="pointer-events-none absolute inset-x-3 top-2 h-8 rounded-[28px] bg-white/10 offer-studio-layer offer-studio-layer-mid" />
                  {offers.filter((_,index)=>index===offerIndex%offers.length).map(offer=>(
                    <article key={offer.id} className="offer-studio-slide relative overflow-hidden rounded-[24px] border border-white/20 bg-[#F7F4ED] text-[#0D3B34] shadow-2xl" aria-live="polite">
                      <div className="relative aspect-[2/1] overflow-hidden bg-[radial-gradient(circle_at_75%_15%,#EBD38B,#F7F4ED_48%,#D8E9E2)]">
                        {offer.bannerUrl? <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={offer.bannerUrl} alt={offer.title} className="offer-studio-art h-full w-full object-cover"/>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#082F2A]/80 via-[#082F2A]/10 to-transparent" />
                        </>:<div className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,#F8F2DF,#DCEAE3_48%,#C4D9D0)]">
                          <span className="offer-studio-ship absolute -bottom-5 left-8 text-[112px] leading-none drop-shadow-xl" aria-hidden="true">{ferry?"⛴":"✈"}</span>
                          <span className="absolute right-5 top-5 h-20 w-20 rounded-full bg-white/40 blur-xl" />
                          <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0D3B34]/25 to-transparent" />
                        </div>}
                        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white">
                          <div className="min-w-0 drop-shadow-md">
                            {offer.carrierName&&<p className="text-[11px] font-black text-[#F1D98E]">{offer.carrierName}</p>}
                            <h3 className="mt-1 line-clamp-2 text-lg font-black sm:text-xl">{offer.title}</h3>
                            {offer.origin&&offer.destination&&<p className="mt-1 text-xs font-bold text-white/90">{offer.origin} <span className="px-1 text-[#E8CC85]">←</span> {offer.destination}</p>}
                          </div>
                          {offer.amountSar!==null&&<div className="shrink-0 rounded-2xl border border-white/20 bg-[#0D3B34]/85 px-3 py-2 text-left shadow-lg backdrop-blur-sm"><span className="block text-[10px] text-white/75">يبدأ من</span><strong className="text-lg font-black text-[#F1D98E]">{offer.amountSar.toLocaleString("ar-SA")} <small className="text-[10px]">ر.س</small></strong></div>}
                        </div>
                        {offers.length>1&&<div className="absolute inset-x-3 top-1/2 z-10 flex -translate-y-1/2 justify-between">
                          <button type="button" aria-label="العرض السابق" onClick={()=>setOfferIndex(i=>(i-1+offers.length)%offers.length)} className="grid h-10 w-10 place-items-center rounded-full border border-white/55 bg-[#0D3B34]/75 text-xl font-black text-white shadow-lg backdrop-blur transition hover:scale-105 hover:bg-[#0D3B34]">→</button>
                          <button type="button" aria-label="العرض التالي" onClick={()=>setOfferIndex(i=>(i+1)%offers.length)} className="grid h-10 w-10 place-items-center rounded-full border border-white/55 bg-[#0D3B34]/75 text-xl font-black text-white shadow-lg backdrop-blur transition hover:scale-105 hover:bg-[#0D3B34]">←</button>
                        </div>}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 text-xs">
                        <p className="font-bold">{offer.travelDate?<>موعد الرحلة: <time dateTime={offer.travelDate}>{new Date(offer.travelDate).toLocaleDateString("ar-SA",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})}</time></>:"الموعد يؤكد عند إرسال الطلب"}</p>
                        <div className="flex flex-wrap gap-2">{offer.adultPriceSar!==null&&<span className="rounded-full bg-[#E8CC85]/20 px-2.5 py-1 font-black">بالغ {offer.adultPriceSar.toLocaleString("ar-SA")} ر.س</span>}{offer.childPriceSar!==null&&<span className="rounded-full bg-[#E8CC85]/20 px-2.5 py-1 font-black">طفل {offer.childPriceSar.toLocaleString("ar-SA")} ر.س</span>}{offer.infantPriceSar!==null&&<span className="rounded-full bg-[#E8CC85]/20 px-2.5 py-1 font-black">رضيع {offer.infantPriceSar.toLocaleString("ar-SA")} ر.س</span>}</div>
                        <span className={`rounded-full px-3 py-1 font-black ${offer.operationStatus==="SUSPENDED"?"bg-red-50 text-red-800":offer.operationStatus==="UNKNOWN"?"bg-amber-50 text-amber-800":"bg-emerald-50 text-emerald-800"}`}>{offer.operationStatus==="SUSPENDED"?"متوقف مؤقتاً":offer.operationStatus==="UNKNOWN"?"قيد التأكيد":"متاح للاستفسار"}</span>
                      </div>
                      {(offer.description||offer.operationNote)&&<p className="border-t border-[#0D3B34]/10 px-4 py-3 text-xs leading-6 text-[#0D3B34]/75">{offer.operationNote||offer.description}</p>}
                    </article>
                  ))}
                </div>
                <div className="relative z-10 flex items-center justify-center gap-2 pb-1 pt-2" aria-label="التنقل بين العروض">
                  {offers.map((offer,index)=><button key={offer.id} type="button" onClick={()=>setOfferIndex(index)} aria-label={`عرض ${index+1}: ${offer.title}`} aria-current={index===offerIndex%offers.length?"true":undefined} className={`h-2 rounded-full transition-all duration-300 ${index===offerIndex%offers.length?"w-8 bg-[#E8CC85]":"w-2 bg-white/45 hover:bg-white/75"}`}/>)}
                  <span className="mr-2 text-[10px] font-bold text-white/70">{offerIndex%offers.length+1} / {offers.length}</span>
                </div>
                {offers.length>1&&<p className="relative z-10 text-center text-[10px] text-white/50">يتغير العرض تلقائياً · أوقفه بالمرور أو التركيز</p>}
              </>}
              {!offersError&&offers.length===0&&<div className="relative z-10 rounded-2xl border border-dashed border-white/25 bg-white/5 p-6 text-sm leading-8 text-white/85">سيتم عرض الأسعار ومواعيد الرحلات هنا عند نشرها من إدارة أريس.</div>}
            </div>
            {offers.length>0&&<section aria-labelledby="offer-schedule-heading" className="overflow-hidden rounded-[24px] border border-[#D4AF37]/35 bg-white shadow-[0_12px_38px_rgba(13,59,52,.06)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#0D3B34]/10 bg-[#FBF8EF] px-4 py-3">
                <div><h3 id="offer-schedule-heading" className="text-sm font-black">{ferry?"مواعيد البواخر المنشورة":"مواعيد الرحلات المنشورة"}</h3><p className="mt-1 text-[10px] text-[#0D3B34]/60">اختر موعداً للاطلاع على العرض</p></div>
                <span className="rounded-full bg-[#0D3B34]/5 px-2.5 py-1 text-[10px] font-bold">{offers.filter(o=>o.travelDate).length} مواعيد</span>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {offers.filter(o=>o.travelDate).slice().sort((a,b)=>(a.travelDate||"").localeCompare(b.travelDate||"")).map(offer=>{
                  const index=offers.findIndex(item=>item.id===offer.id), selected=index===offerIndex%offers.length;
                  return <button key={offer.id} type="button" onClick={()=>setOfferIndex(index)} className={`grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-[#0D3B34]/5 px-4 py-3 text-right transition last:border-b-0 hover:bg-[#FAF6E9] ${selected?"bg-[#F8F3E2]":"bg-white"}`}>
                    <span className="min-w-0"><span className="block truncate text-xs font-black">{offer.origin&&offer.destination?`${offer.origin} ← ${offer.destination}`:offer.title}</span><time dateTime={offer.travelDate||undefined} className="mt-1 block text-[10px] text-[#0D3B34]/60">{new Date(offer.travelDate!).toLocaleDateString("ar-SA",{weekday:"short",day:"numeric",month:"short",timeZone:"UTC"})}</time></span>
                    <span className="text-left"><span className="block text-xs font-black text-[#9C7922]">{offer.adultPriceSar!==null?`بالغ ${offer.adultPriceSar.toLocaleString("ar-SA")} ر.س`:offer.amountSar!==null?`${offer.amountSar.toLocaleString("ar-SA")} ر.س`:"اطلب السعر"}</span><span className={`mt-1 block text-[10px] font-bold ${offer.operationStatus==="SUSPENDED"?"text-red-700":offer.operationStatus==="UNKNOWN"?"text-amber-700":"text-emerald-700"}`}>{offer.operationStatus==="SUSPENDED"?"متوقف":offer.operationStatus==="UNKNOWN"?"قيد التأكيد":"متاح للاستفسار"}</span></span>
                  </button>;
                })}
                {offers.every(o=>!o.travelDate)&&<p className="px-4 py-5 text-xs leading-6 text-[#0D3B34]/65">لا توجد مواعيد منشورة حالياً. أرسل طلباً وسيتأكد الفريق من أقرب موعد متاح.</p>}
              </div>
              <p className="border-t border-[#0D3B34]/10 px-4 py-2 text-[10px] leading-5 text-[#0D3B34]/55">المواعيد والأسعار إرشادية؛ تأكيد المقعد والسعر النهائي من فريق أريس بعد مراجعة الطلب.</p>
            </section>}
            <div className="rounded-[24px] border border-[#D4AF37]/35 bg-[#FFFAEE] p-5 text-sm leading-8">
              <h3 className="font-black">مهم قبل إرسال الطلب</h3>
              <p className="mt-2">{policies[kind]}</p>
              <p className="mt-2 font-bold">لا تدفع أي مبلغ في هذه الصفحة.</p>
            </div>
          </aside>

          <section id="travel-request-form" className="min-w-0 scroll-mt-28 rounded-[30px] border border-[#D4AF37]/30 bg-white p-5 shadow-[0_20px_60px_rgba(13,59,52,.08)] md:p-8">
            {confirmation?(
              <div role="status">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-700">✓</div>
                <h2 className="text-3xl font-black">تم إرسال الطلب بنجاح</h2>
                <p className="mt-3 text-base font-bold">تابع الطلب من صفحة «طلباتي»</p>
                <p className="mt-3 text-sm leading-8">رقم الطلب: <strong dir="ltr">{confirmation.reference}</strong></p>
                <div className="mt-6 grid gap-3 rounded-[22px] bg-[#F8F4E9] p-5 text-sm leading-7 sm:grid-cols-2">
                  <p>الاسم: <b>{confirmation.customerName}</b></p>
                  <p>نوع الطلب: <b>{ferry?"باخرة":"طيران"}</b></p>
                  <p>من: <b>{confirmation.origin}</b></p>
                  <p>إلى: <b>{confirmation.destination}</b></p>
                  <p>السفر: <b>{confirmation.travelDate}</b></p>
                  {!ferry&&<p>نوع الرحلة: <b>{confirmation.tripType==="ROUND_TRIP"?"ذهاب وعودة":confirmation.tripType==="MULTI_CITY"?"متعدد الوجهات":"ذهاب فقط"}</b></p>}
                  {confirmation.returnDate&&<p>العودة: <b>{confirmation.returnDate}</b></p>}
                  {confirmation.itinerary?.map((leg,index)=><p key={index} className="sm:col-span-2">المرحلة {index+1}: {leg.origin} ← {leg.destination} · {leg.travelDate}</p>)}
                  <p>المسافرون: <b>{confirmation.adults} بالغ / {confirmation.children} طفل / {confirmation.infants} رضيع</b></p>
                  <p className="sm:col-span-2">التواصل: <b dir="ltr">{confirmation.phone}</b></p>
                </div>
                <p className="mt-5 text-sm leading-8">سيراجع موظف أريس الطلب ويتواصل معك على الرقم المدخل لإرسال السعر والتوفر. <strong>لا يعتبر الطلب تذكرة أو حجزاً مؤكداً.</strong></p>
                {!claimSaved&&<p role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-7">تعذر حفظ رمز متابعة الطلب في هذا المتصفح. احتفظ برقم الطلب، وسجّل الدخول إلى حسابك لمتابعته إذا أرسلته من حساب مسجّل.</p>}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link href={`/my-requests?reference=${encodeURIComponent(confirmation.reference)}`} className="rounded-full bg-[#0D3B34] px-8 py-3 font-black text-white shadow-md">متابعة الطلب ←</Link>
                  <button type="button" onClick={()=>{setConfirmation(null);setNotes("");}} className="rounded-full border border-[#D4AF37]/50 bg-white px-8 py-3 font-bold">إرسال طلب جديد</button>
                </div>
              </div>
            ):(
              <>
                <h2 className="text-2xl font-black">بيانات طلب {title}</h2>
                <p className="mt-2 text-sm leading-7 text-[#0D3B34]/65">املأ البيانات التالية للتواصل معك بعرض السعر. لا تتطلب العملية حساباً أو دفعاً.</p>
                {error&&<p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
                <form id="transport-request-form-fields" onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
                  <input type="text" name="website" autoComplete="off" tabIndex={-1} aria-hidden="true" className="hidden"/>
                  <label className={label}>اسم المسافر / مقدم الطلب *<input className={field} required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="الاسم الكامل"/></label>
                  <label className={label}>البريد الإلكتروني (اختياري)<input className={field} type="email" value={email} maxLength={180} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com"/></label>
                  <div className="sm:col-span-2">
                    <p className="mb-2 text-sm font-bold">الجوال الأساسي * <span className="font-normal text-red-700">يجب أن يكون فعالاً وقابلاً للتواصل</span></p>
                    <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
                      <select aria-label="مفتاح الدولة" className={field} value={countryCode} onChange={e=>setCountryCode(e.target.value)}>{codes.map(([v,t])=><option value={v} key={v}>{t}</option>)}</select>
                      <input aria-label="رقم الجوال" className={field} required inputMode="tel" autoComplete="tel-national" value={phone} maxLength={18} onChange={e=>setPhone(e.target.value)} placeholder="رقم الجوال بدون مفتاح الدولة"/>
                    </div>
                    {countryCode==="other"&&<input required inputMode="numeric" aria-label="مفتاح دولة آخر" className={field+" mt-2"} placeholder="مفتاح الدولة بالأرقام" value={customCountryCode} onChange={e=>setCustomCountryCode(e.target.value)}/>}
                  </div>
                  {!ferry&&<fieldset className="sm:col-span-2 rounded-[22px] border border-[#D4AF37]/35 bg-[#F8F5EC] px-5 py-4">
                    <legend className="px-2 text-sm font-black">اتجاه رحلة الطيران *</legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {([["ONE_WAY","ذهاب فقط"],["ROUND_TRIP","ذهاب وعودة"],["MULTI_CITY","متعدد الوجهات"]] as const).map(([id,label])=>
                        <label key={id} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-bold ${tripType===id?"border-[#D4AF37] bg-[#0D3B34] text-white":"border-[#D4AF37]/25 bg-white"}`}>
                          <input type="radio" name="flight-trip-type" checked={tripType===id} onChange={()=>setTripType(id)}/>{label}
                        </label>)}
                    </div>
                  </fieldset>}
                  {kind==="FLIGHT"&&tripType==="MULTI_CITY" ? <div className="sm:col-span-2">
                    <h3 className="mb-3 font-black">خط سير الرحلة — حتى 6 رحلات</h3>
                    <div className="space-y-4">
                      {legs.map((leg,index)=><div key={index} className="grid gap-3 rounded-2xl border border-[#D4AF37]/30 bg-[#FCFAF3] p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2 flex items-center justify-between gap-2">
                          <span className="font-bold">الرحلة {index+1}</span>
                          {index>=2&&<button type="button" className="text-sm font-bold text-red-700" onClick={()=>setLegs(prev=>prev.filter((_,i)=>i!==index))}>حذف الوجهة</button>}
                        </div>
                        <label className={label}>من *<AirportLookup required ariaLabel={`مغادرة الرحلة ${index+1}`} value={leg.origin} onChange={v=>setLegs(prev=>prev.map((x,i)=>i===index?{...x,origin:v}:x))}/></label>
                        <label className={label}>إلى *<AirportLookup required ariaLabel={`وصول الرحلة ${index+1}`} value={leg.destination} onChange={v=>setLegs(prev=>prev.map((x,i)=>i===index?{...x,destination:v}:x))}/></label>
                        <label className={label+" sm:col-span-2"}>تاريخ السفر *<input required className={field} type="date" min={index?legs[index-1]?.travelDate||today:today} value={leg.travelDate} onChange={e=>setLegs(prev=>prev.map((x,i)=>i===index?{...x,travelDate:e.target.value}:x))}/></label>
                      </div>)}
                    </div>
                    {legs.length<6&&<button type="button" onClick={()=>setLegs(prev=>[...prev,{origin:prev[prev.length-1]?.destination||"",destination:"",travelDate:""}])} className="mt-4 rounded-full border border-[#D4AF37] bg-white px-5 py-2.5 text-sm font-black">＋ إضافة رحلة أخرى</button>}
                  </div> : ferry?(
                    <>
                      <label className={label}>من *<select required className={field} value={origin} onChange={e=>{const next=e.target.value;setOrigin(next);setDestination(next==="سواكن"?"جدة":"سواكن");}}><option value="سواكن">سواكن</option><option value="جدة">جدة</option></select></label>
                      <label className={label}>إلى *<select required className={field} value={destination} onChange={e=>{const next=e.target.value;setDestination(next);setOrigin(next==="سواكن"?"جدة":"سواكن");}}><option value="جدة">جدة</option><option value="سواكن">سواكن</option></select></label>
                    </>
                  ):(
                    <>
                      <label className={label}>من — مدينة / مطار المغادرة ورمز IATA *
                        <AirportLookup required value={origin} onChange={setOrigin} ariaLabel="مدينة أو مطار المغادرة" placeholder="مثلاً: جدة أو JED أو مطار الملك عبدالعزيز"/>
                      </label>
                      <label className={label}>إلى — مدينة / مطار الوصول ورمز IATA *
                        <AirportLookup required value={destination} onChange={setDestination} ariaLabel="مدينة أو مطار الوصول" placeholder="مثلاً: بورتسودان أو PZU أو الخرطوم"/>
                      </label>
                    </>
                  )}
                  {tripType!=="MULTI_CITY"||ferry ? <label className={label}>تاريخ السفر المطلوب *<input className={field} required type="date" min={today} value={travelDate} onChange={e=>setTravelDate(e.target.value)}/></label> : null}
                  {!ferry&&tripType==="ROUND_TRIP"&&<label className={label}>تاريخ العودة *<input className={field} type="date" required min={travelDate||today} value={returnDate} onChange={e=>setReturnDate(e.target.value)}/></label>}
                  <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                    {[["البالغون",adults,setAdults,1],["الأطفال",children,setChildren,0],["الرضع",infants,setInfants,0]].map(([title,value,setter,min])=>(
                      <label key={String(title)} className="flex flex-col gap-2 text-xs font-bold">{String(title)}<input type="number" className={field+" text-center"} value={Number(value)} min={Number(min)} max={30} required onChange={e=>(setter as (n:number)=>void)(Number(e.target.value))}/></label>
                    ))}
                  </div>
                  <label className={label+" sm:col-span-2"}>ملاحظات أو متطلبات خاصة<textarea className={field} value={notes} onChange={e=>setNotes(e.target.value)} rows={4} maxLength={1200} placeholder="رحلة ذهاب فقط/ملاحظات الأمتعة أو المقاعد أو غيرها..."/></label>
                  <div className="sm:col-span-2 rounded-2xl bg-[#F7F2E6] p-4 text-xs leading-7 text-[#0D3B34]/80">بإرسال الطلب، أوافق على استخدام بيانات التواصل المقدمة للرد على الاستفسار. {policies[kind]}</div>
                  <div className="sm:col-span-2 mt-2 flex flex-wrap justify-center gap-3">
                    <a href={`https://wa.me/966580091220?text=${encodeURIComponent(ferry?"السلام عليكم، أرغب في الاستفسار عن حجز باخرة.":"السلام عليكم، أرغب في الاستفسار عن حجز طيران.")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex min-w-[170px] justify-center rounded-full border-2 border-[#B88A30] bg-white px-6 py-3.5 text-sm font-black text-[#0D3B34] shadow-sm transition hover:bg-[#FFF9EB]">
                      تواصل عبر الواتساب
                    </a>
                    <button type="submit" disabled={busy} className="inline-flex min-w-[170px] justify-center rounded-full bg-[#0D3B34] px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#176154] disabled:opacity-50">{busy?"جارٍ إرسال الطلب...":"إرسال طلب"}</button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
