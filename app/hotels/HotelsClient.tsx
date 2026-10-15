"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { storeCustomerClaim } from "@/lib/customer-request-claims";
import OfferImageCarousel from "@/app/components/OfferImageCarousel";

type HotelOffer={id:string;title:string;destination:string|null;hotelName:string|null;description:string|null;amountSar:number|null;priceUnit:string|null;bannerUrl:string|null;imageUrls:string[];startsAt:string|null;endsAt:string|null};
type Success={reference:string;trackingToken:string;customerName:string;destination:string;hotelName:string|null;checkInDate:string;checkOutDate:string;rooms:number;adults:number;children:number};
const countries=[["966","السعودية +966"],["249","السودان +249"],["20","مصر +20"],["971","الإمارات +971"],["974","قطر +974"],["968","عُمان +968"],["44","بريطانيا +44"],["1","أمريكا/كندا +1"],["other","دولة أخرى"]];
const field="w-full rounded-xl border border-[#D4AF37]/40 bg-[#FCFAF4] px-4 py-3 text-sm text-[#0D3B34] outline-[#B88B2B]";
const label="flex flex-col gap-2 text-sm font-bold";
const today=new Date().toISOString().slice(0,10);
const formatOfferPeriod=(offer:HotelOffer)=>{
  if(!offer.startsAt&&!offer.endsAt)return "فترة العرض حسب الإعلان";
  const format=(value:string|null)=>value?new Date(value).toLocaleDateString("ar-SA",{day:"numeric",month:"short",timeZone:"UTC"}):"مفتوحة";
  return `فترة العرض: ${format(offer.startsAt)} – ${format(offer.endsAt)}`;
};
const formatOfferPrice=(amount:number|null)=>amount===null?"اطلب السعر":`${amount.toLocaleString("ar-SA")} ر.س`;

export default function HotelsPage(){
  const [offers,setOffers]=useState<HotelOffer[]>([]);
  const [offersUnavailable,setOffersUnavailable]=useState(false);
  const [index,setIndex]=useState(0);
  const [offersPaused,setOffersPaused]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState<Success|null>(null);
  const [savedClaim,setSavedClaim]=useState(true);
  const [form,setForm]=useState({
    customerName:"",customerEmail:"",countryCode:"966",customCountryCode:"",phone:"",
    destination:"",hotelName:"",
    checkInDate:"",checkOutDate:"",rooms:1,adults:2,children:0,notes:"",
  });
  const edit=<K extends keyof typeof form>(key:K,value:(typeof form)[K])=>
    setForm(v=>({...v,[key]:value}));
  useEffect(()=>{
    let active=true;
    fetch("/api/hotels/offers",{cache:"no-store"}).then(async r=>r.ok?r.json():null).then(d=>{
      if(active&&d?.success)setOffers(d.data||[]);else if(active)setOffersUnavailable(true);
    }).catch(()=>{if(active)setOffersUnavailable(true);});
    return()=>{active=false};
  },[]);
  useEffect(()=>{
    if(offers.length<2||offersPaused||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const timer=window.setInterval(()=>setIndex(i=>(i+1)%offers.length),3000);
    return()=>window.clearInterval(timer);
  },[offers.length,offersPaused]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;
    setBusy(true);setError("");
    try{
      const res=await fetch("/api/hotels/requests",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...form,countryCode:form.countryCode==="other"?form.customCountryCode:form.countryCode})});
      const data=await res.json().catch(()=>null);
      if(!res.ok||!data?.success){setError(data?.message||"تعذر إرسال الطلب.");return;}
      setSavedClaim(storeCustomerClaim({reference:data.data.reference,token:data.data.trackingToken}));
      setSuccess(data.data);
    }catch{setError("تعذر الاتصال بالخادم؛ حاول مجدداً.");}
    finally{setBusy(false);}
  }
  return <main dir="rtl" className="min-h-screen bg-[#F7F4ED] px-4 pb-12 pt-32 text-[#0D3B34] md:px-8">
    <div className="mx-auto max-w-[1450px]">
      <div className="mb-3 overflow-hidden bg-[#F7F4ED]">
        {/* Crop the artwork's white outer margin; preserve its designed banner and current gap below. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Image/hero/arees-hotel-banner.webp" alt="حجز الفنادق — إقامتك المميزة تبدأ هنا" className="block aspect-[4.2/1] w-full scale-[1.04] object-cover object-center" />
      </div>
      
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(290px,.9fr)_minmax(0,1.3fr)]">
        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="offer-studio relative overflow-hidden rounded-[30px] border border-[#D4AF37]/30 bg-[#0D3B34] p-4 text-white shadow-[0_22px_60px_rgba(13,59,52,.2)] sm:p-5"
            onMouseEnter={()=>setOffersPaused(true)} onMouseLeave={()=>setOffersPaused(false)} onFocusCapture={()=>setOffersPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setOffersPaused(false);}}>
            <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full border border-[#E8CC85]/20 offer-studio-orbit" />
            <div className="pointer-events-none absolute -bottom-20 -right-12 h-56 w-56 rounded-full border border-white/10 offer-studio-orbit offer-studio-orbit-slow" />
            <div className="relative z-10 flex items-start justify-between gap-3 px-1 pb-4">
              <div><p className="text-xs font-black tracking-wide text-[#E8CC85]">إعلانات وعروض الفنادق</p><h2 className="mt-1 text-xl font-black sm:text-2xl">العروض والتخفيضات</h2></div>
              <span className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white/85"><span className="h-2 w-2 animate-pulse rounded-full bg-[#E8CC85]"/> عروض محدثة</span>
            </div>
            {offersUnavailable&&<div role="status" className="relative z-10 rounded-2xl border border-amber-200/40 bg-white/10 p-5 text-sm leading-7">تعذر تحميل العروض الآن. أرسل طلبك وسنراجع الخيارات المتاحة معك.</div>}
            {offers.length>0&&<>
              <div className="relative px-1 pb-2 pt-1">
                <div className="pointer-events-none absolute inset-x-5 top-5 h-8 rounded-[28px] bg-[#D4AF37]/15 offer-studio-layer offer-studio-layer-back" />
                <div className="pointer-events-none absolute inset-x-3 top-2 h-8 rounded-[28px] bg-white/10 offer-studio-layer offer-studio-layer-mid" />
                {offers.filter((_,i)=>i===index%offers.length).map(offer=><article key={offer.id} className="offer-studio-slide relative overflow-hidden rounded-[24px] border border-white/20 bg-[#F7F4ED] text-[#0D3B34] shadow-2xl" aria-live="polite">
                  <div className="relative aspect-[2/1] overflow-hidden bg-[radial-gradient(circle_at_75%_15%,#EBD38B,#F7F4ED_48%,#D8E9E2)]">
                    {(offer.imageUrls?.length||offer.bannerUrl)?<>
                      <OfferImageCarousel images={offer.imageUrls} fallback={offer.bannerUrl} title={offer.title} imageClassName="offer-studio-art"/>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#082F2A]/80 via-[#082F2A]/10 to-transparent" />
                    </>:<div className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,#F8F2DF,#DCEAE3_48%,#C4D9D0)]">
                      <span className="offer-studio-ship absolute -bottom-5 left-8 text-[112px] leading-none drop-shadow-xl" aria-hidden="true">🏨</span>
                      <span className="absolute right-5 top-5 h-20 w-20 rounded-full bg-white/40 blur-xl" />
                      <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0D3B34]/25 to-transparent" />
                    </div>}
                    <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white">
                      <div className="min-w-0 drop-shadow-md">{offer.hotelName&&<p className="text-[11px] font-black text-[#F1D98E]">{offer.hotelName}</p>}<h3 className="mt-1 line-clamp-2 text-lg font-black sm:text-xl">{offer.title}</h3>{offer.destination&&<p className="mt-1 text-xs font-bold text-white/90">{offer.destination}</p>}</div>
                      {offer.amountSar!==null&&<div className="shrink-0 rounded-2xl border border-white/20 bg-[#0D3B34]/85 px-3 py-2 text-left shadow-lg backdrop-blur-sm"><span className="block text-[10px] text-white/75">السعر</span><strong className="text-lg font-black text-[#F1D98E]">{offer.amountSar.toLocaleString("ar-SA")} <small className="text-[10px]">ر.س</small></strong><span className="block text-[10px] text-white/75">{offer.priceUnit||"لليلة"}</span></div>}
                    </div>
                  </div>
                  {offer.description&&<p className="px-4 py-3 text-xs leading-6 text-[#0D3B34]/75">{offer.description}</p>}
                </article>)}
              </div>
              <div className="relative z-10 flex items-center justify-between gap-2 pb-1 pt-2" aria-label="التنقل بين العروض">
                <button type="button" aria-label="العرض السابق" onClick={()=>setIndex(i=>(i-1+offers.length)%offers.length)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/50 bg-white/10 text-xl font-black text-white shadow hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E8CC85]">→</button>
                <div className="flex min-w-0 items-center justify-center gap-2">
                  {offers.map((offer,i)=><button key={offer.id} type="button" onClick={()=>setIndex(i)} aria-label={`عرض ${i+1}: ${offer.title}`} aria-current={i===index%offers.length?"true":undefined} className={"h-2 rounded-full transition-all duration-300 "+(i===index%offers.length?"w-8 bg-[#E8CC85]":"w-2 bg-white/45 hover:bg-white/75")}/>)}
                  <span className="mr-1 whitespace-nowrap text-[10px] font-bold text-white/70">{index%offers.length+1} / {offers.length}</span>
                </div>
                <button type="button" aria-label="العرض التالي" onClick={()=>setIndex(i=>(i+1)%offers.length)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/50 bg-white/10 text-xl font-black text-white shadow hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E8CC85]">←</button>
              </div>
              {offers.length>1&&<p className="relative z-10 text-center text-[10px] text-white/50">يتغير العرض تلقائياً · أوقفه بالمرور أو التركيز</p>}
            </>}
            {!offersUnavailable&&offers.length===0&&<div className="relative z-10 rounded-2xl border border-dashed border-white/25 bg-white/5 p-6 text-sm leading-8 text-white/85">العروض ستظهر هنا عند نشرها من إدارة أريس.</div>}
          </div>
          {offers.length>0&&<section aria-labelledby="hotel-offer-period-heading" className="overflow-hidden rounded-[24px] border border-[#D4AF37]/35 bg-white shadow-[0_12px_38px_rgba(13,59,52,.06)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#0D3B34]/10 bg-[#FBF8EF] px-4 py-3"><div><h3 id="hotel-offer-period-heading" className="text-sm font-black">فترات عروض الفنادق</h3><p className="mt-1 text-[10px] text-[#0D3B34]/60">اختر العرض لعرض تفاصيله</p></div><span className="rounded-full bg-[#0D3B34]/5 px-2.5 py-1 text-[10px] font-bold">{offers.length} عروض</span></div>
            <div className="max-h-56 overflow-y-auto">
              {offers.map((offer,i)=><button key={offer.id} type="button" onClick={()=>setIndex(i)} className={"grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-[#0D3B34]/5 px-4 py-3 text-right transition last:border-b-0 hover:bg-[#FAF6E9] "+(i===index%offers.length?"bg-[#F8F3E2]":"bg-white")}>
                <span className="min-w-0"><span className="block truncate text-xs font-black">{offer.hotelName||offer.title} · {offer.destination||"وجهات متعددة"}</span><span className="mt-1 block text-[10px] text-[#0D3B34]/60">{formatOfferPeriod(offer)}</span></span>
                <span className="text-left"><span className="block text-xs font-black text-[#9C7922]">{formatOfferPrice(offer.amountSar)}</span><span className="mt-1 block text-[10px] font-bold text-emerald-700">متاح للاستفسار</span></span>
              </button>)}
            </div>
            <p className="border-t border-[#0D3B34]/10 px-4 py-2 text-[10px] leading-5 text-[#0D3B34]/55">السعر والتوفر النهائيان يخضعان لتأكيد الفندق عند مراجعة طلبك.</p>
          </section>}
          <div className="rounded-2xl bg-[#FFF9E8] p-5 text-xs leading-8">الإلغاء والاسترداد يخضعان لسياسة الفندق ونوع سعر الغرفة عند تأكيد الحجز. إرسال الطلب ليس حجزاً مؤكداً ولا يترتب عليه سداد.</div>
        </aside>
        <section id="hotel-request-form" className="scroll-mt-28 rounded-[28px] border border-[#D4AF37]/35 bg-white p-5 shadow-lg md:p-8">
          {success?<div role="status">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-3xl text-green-700">✓</div>
            <h2 className="mt-4 text-3xl font-black">تم إرسال الطلب بنجاح</h2>
            <p className="mt-3 text-sm font-bold">تابع الطلب من صفحة «طلباتي»</p>
            <div className="mt-5 space-y-2 rounded-xl bg-[#F7F4EC] p-5 text-sm leading-7">
              <p>رقم الطلب: <b dir="ltr">{success.reference}</b></p>
              <p>الوجهة: <b>{success.destination}</b></p>
              {success.hotelName&&<p>الفندق: <b>{success.hotelName}</b></p>}
              <p>الدخول: <b>{success.checkInDate}</b> · الخروج: <b>{success.checkOutDate}</b></p>
              <p>الغرف: <b>{success.rooms}</b> · البالغون: <b>{success.adults}</b> · الأطفال: <b>{success.children}</b></p>
            </div>
            {!savedClaim&&<p role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm">المتصفح منع حفظ رمز متابعة الطلب. احتفظ بالمرجع، وتابع من حسابك إن كنت مسجلاً عند الإرسال.</p>}
            <p className="mt-4 text-sm leading-8">طلبك محفوظ للمراجعة وسيتواصل معك فريق أريس عند إعداد العرض. لا يوجد سداد أو حجز مؤكد حتى الآن.</p>
            <Link href={`/my-requests?reference=${encodeURIComponent(success.reference)}`} className="mt-6 inline-flex rounded-full bg-[#0D3B34] px-7 py-3.5 text-sm font-black text-white">متابعة الطلب ←</Link>
          </div>:<>
            <h2 className="text-2xl font-black">إرسال طلب حجز فندق</h2>
            <p className="mt-2 text-sm leading-7 text-[#0D3B34]/65">املأ البيانات المطلوبة لنتواصل معك بعرض السعر والتوفر.</p>
            {error&&<p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">{error}</p>}
            <form id="hotel-request-form-fields" onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true"/>
              <label className={label}>الاسم الكامل *<input className={field} required minLength={2} maxLength={120} value={form.customerName} onChange={e=>edit("customerName",e.target.value)}/></label>
              <label className={label}>البريد الإلكتروني (اختياري)<input className={field} type="email" maxLength={180} value={form.customerEmail} onChange={e=>edit("customerEmail",e.target.value)}/></label>
              <div className="sm:col-span-2">
                <p className="mb-2 text-sm font-bold">رقم الجوال الأساسي * <span className="text-xs font-normal text-red-700">يجب أن يكون فعالاً</span></p>
                <div className="grid gap-2 sm:grid-cols-[190px_1fr]">
                  <select className={field} aria-label="مفتاح الدولة" value={form.countryCode} onChange={e=>edit("countryCode",e.target.value)}>{countries.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
                  <input className={field} aria-label="رقم الجوال" required inputMode="tel" value={form.phone} onChange={e=>edit("phone",e.target.value)} placeholder="رقم الجوال بدون مفتاح الدولة"/>
                </div>
                {form.countryCode==="other"&&<input className={field+" mt-2"} required placeholder="مفتاح الدولة بالأرقام" value={form.customCountryCode} onChange={e=>edit("customCountryCode",e.target.value)}/>}
              </div>
              <label className={label}>المدينة أو الوجهة *<input className={field} required maxLength={100} value={form.destination} onChange={e=>edit("destination",e.target.value)} placeholder="مثلاً مكة المكرمة"/></label>
              <label className={label}>الفندق المطلوب (اختياري)<input className={field} maxLength={160} value={form.hotelName} onChange={e=>edit("hotelName",e.target.value)} placeholder="اسم فندق أو منطقة"/></label>
              <label className={label}>تاريخ الدخول *<input className={field} type="date" min={today} required value={form.checkInDate} onChange={e=>edit("checkInDate",e.target.value)}/></label>
              <label className={label}>تاريخ الخروج *<input className={field} type="date" min={form.checkInDate||today} required value={form.checkOutDate} onChange={e=>edit("checkOutDate",e.target.value)}/></label>
              <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                {([["الغرف","rooms",1],["البالغون","adults",1],["الأطفال","children",0]] as const).map(([name,key,min])=>
                  <label key={key} className={label}>{name}<input className={field} type="number" required min={min} max={30} value={form[key]} onChange={e=>edit(key,Number(e.target.value))}/></label>)}
              </div>
              <label className={label+" sm:col-span-2"}>ملاحظات ومتطلبات خاصة<textarea className={field} maxLength={1500} rows={3} value={form.notes} onChange={e=>edit("notes",e.target.value)} placeholder="نوع الغرفة، الإطلالة، الإفطار، طلب غرف متجاورة..."/></label>
              <p className="rounded-xl bg-[#F7F1E5] px-4 py-3 text-xs leading-7 sm:col-span-2">بإرسال الطلب تسمح لأريس باستخدام بيانات التواصل للرد على الاستعلام. يخضع الحجز النهائي لتوفر الفندق وشروط الإلغاء والاسترداد.</p>
              <div className="sm:col-span-2 mt-2 flex flex-wrap justify-center gap-3">
                <a href="https://wa.me/966580091220?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AD%D8%AC%D8%B2%20%D9%81%D9%ند%D9%82."
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex min-w-[170px] justify-center rounded-full border-2 border-[#B88A30] bg-white px-6 py-3.5 text-sm font-black text-[#0D3B34] shadow-sm transition hover:bg-[#FFF9EB]">
                  تواصل عبر الواتساب
                </a>
                <button type="submit" disabled={busy} className="inline-flex min-w-[170px] justify-center rounded-full bg-[#0D3B34] px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#176154] disabled:opacity-50">{busy?"جارٍ إرسال الطلب...":"إرسال طلب"}</button>
              </div>
            </form>
          </>}
        </section>
      </div>
    </div>
  </main>;
}
