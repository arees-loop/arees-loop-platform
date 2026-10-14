"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { storeCustomerClaim } from "@/lib/customer-request-claims";

type HotelOffer={id:string;title:string;destination:string|null;hotelName:string|null;description:string|null;amountSar:number|null;priceUnit:string|null;bannerUrl:string|null};
type Success={reference:string;trackingToken:string;customerName:string;destination:string;hotelName:string|null;checkInDate:string;checkOutDate:string;rooms:number;adults:number;children:number};
const countries=[["966","السعودية +966"],["249","السودان +249"],["20","مصر +20"],["971","الإمارات +971"],["974","قطر +974"],["968","عُمان +968"],["44","بريطانيا +44"],["1","أمريكا/كندا +1"],["other","دولة أخرى"]];
const field="w-full rounded-xl border border-[#D4AF37]/40 bg-[#FCFAF4] px-4 py-3 text-sm text-[#0D3B34] outline-[#B88B2B]";
const label="flex flex-col gap-2 text-sm font-bold";
const today=new Date().toISOString().slice(0,10);

export default function HotelsPage(){
  const [offers,setOffers]=useState<HotelOffer[]>([]);
  const [offersUnavailable,setOffersUnavailable]=useState(false);
  const [index,setIndex]=useState(0);
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
      <div className="mb-3">
        {/* Keep the complete supplied banner visible without a white frame or forced crop. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Image/hero/arees-hotel-banner.webp" alt="حجز الفنادق — إقامتك المميزة تبدأ هنا" className="block h-auto w-full" />
      </div>
      
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(290px,.9fr)_minmax(0,1.3fr)]">
        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="rounded-[26px] bg-[#0D3B34] p-6 text-white shadow-xl">
            <p className="text-sm font-bold text-[#EBD08C]">إعلانات وعروض الفنادق</p>
            <h2 className="mt-2 text-2xl font-black">إقامات مختارة من أريس</h2>
            <p className="mt-2 text-sm leading-7 text-white/80">الأسعار والتوفر قابلان للتغيير حتى تأكيد الحجز لدى الفندق.</p>
          </div>
          {offers.length>1&&<div className="flex items-center justify-between rounded-xl border border-[#D4AF37]/35 bg-white p-3">
            <button type="button" aria-label="العرض السابق" onClick={()=>setIndex(i=>(i+offers.length-1)%offers.length)} className="rounded-full border border-[#D4AF37]/50 px-4 py-2">→</button>
            <span className="text-xs font-bold">{index+1} من {offers.length}</span>
            <button type="button" aria-label="العرض التالي" onClick={()=>setIndex(i=>(i+1)%offers.length)} className="rounded-full border border-[#D4AF37]/50 px-4 py-2">←</button>
          </div>}
          {offers.filter((_,i)=>i===index).map(offer=><article key={offer.id} className="overflow-hidden rounded-[26px] border border-[#D4AF37]/35 bg-white shadow-md">
            {offer.bannerUrl&&<div className="h-44 overflow-hidden bg-[#F7F2E6]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={offer.bannerUrl} alt={offer.title} className="h-full w-full object-cover"/>
            </div>}
            <div className="p-5">
              {offer.hotelName&&<p className="text-xs font-bold text-[#B18C30]">{offer.hotelName}</p>}
              <h3 className="mt-2 text-xl font-black">{offer.title}</h3>
              {offer.destination&&<p className="mt-2 text-sm">{offer.destination}</p>}
              {offer.description&&<p className="mt-3 whitespace-pre-wrap text-sm leading-7">{offer.description}</p>}
              {offer.amountSar!==null&&<p className="mt-3 text-2xl font-black text-[#9C7A21]">{offer.amountSar.toLocaleString("ar-SA")} ر.س <span className="text-xs">{offer.priceUnit||""}</span></p>}
            </div>
          </article>)}
          {offersUnavailable&&<div className="rounded-2xl border border-amber-200 bg-white p-5 text-sm">تعذر تحميل العروض حالياً.</div>}
          {!offersUnavailable&&offers.length===0&&<div className="rounded-2xl border border-dashed border-[#D4AF37]/40 bg-white p-6 text-sm leading-8">العروض ستظهر هنا عند نشرها من إدارة أريس.</div>}
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
