"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type Kind="FLIGHT"|"FERRY";
type Offer={id:string;title:string;description:string|null;carrierName:string|null;origin:string|null;destination:string|null;travelDate:string|null;amountSar:number|null;priceUnit:string|null;bannerUrl:string|null};
type Confirmation={reference:string;kind:string;customerName:string;origin:string;destination:string;travelDate:string;adults:number;children:number;infants:number;phone:string;notice:string};
const codes=[["966","السعودية +966"],["249","السودان +249"],["20","مصر +20"],["971","الإمارات +971"],["974","قطر +974"],["965","الكويت +965"],["973","البحرين +973"],["968","عُمان +968"],["1","أمريكا/كندا +1"],["44","بريطانيا +44"],["other","دولة أخرى"]];
const field="w-full min-w-0 rounded-2xl border border-[#C5AE73]/35 bg-[#FCFBF6] px-4 py-3.5 text-sm text-[#0D3B34] outline-[#B69034]";
const label="flex flex-col gap-2 text-sm font-bold text-[#183E36]";
const today=new Date().toISOString().slice(0,10);
const policies={
  FLIGHT:"تخضع شروط التعديل والإلغاء والاسترداد لسياسة شركة الطيران الناقلة وفئة التذكرة وقت إصدارها. لا يصبح الطلب حجزاً مؤكداً إلا بعد العرض والموافقة وإتمام إجراءات الإصدار.",
  FERRY:"تخضع شروط التعديل والإلغاء والاسترداد لسياسة شركة البواخر المشغّلة ودرجة الحجز وموعد الرحلة. العرض لا يضمن توفر المقاعد حتى التأكيد النهائي.",
};

export default function TransportRequestPage({kind}:{kind:Kind}) {
  const ferry=kind==="FERRY", title=ferry?"حجز البواخر":"حجز الطيران";
  const [offers,setOffers]=useState<Offer[]>([]);
  const [offersError,setOffersError]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [confirmation,setConfirmation]=useState<Confirmation|null>(null);
  const [countryCode,setCountryCode]=useState("966");
  const [customCountryCode,setCustomCountryCode]=useState("");
  const [altCountryCode,setAltCountryCode]=useState("966");
  const [altCustomCountryCode,setAltCustomCountryCode]=useState("");
  const [origin,setOrigin]=useState(ferry?"سواكن":"");
  const [destination,setDestination]=useState(ferry?"جدة":"");
  const [travelDate,setTravelDate]=useState("");
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [whatsappPhone,setWhatsappPhone]=useState("");
  const [email,setEmail]=useState("");
  const [adults,setAdults]=useState(1);
  const [children,setChildren]=useState(0);
  const [infants,setInfants]=useState(0);
  const [notes,setNotes]=useState("");

  useEffect(()=>{
    let live=true;
    fetch("/api/transport/offers?kind="+kind,{cache:"no-store"})
      .then(async r=>r.ok?await r.json():null)
      .then(data=>{if(!live)return;if(data?.success)setOffers(data.data||[]);else setOffersError(true);})
      .catch(()=>{if(live)setOffersError(true);});
    return()=>{live=false};
  },[kind]);

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
          whatsappCountryCode:whatsappPhone?(altCountryCode==="other"?altCustomCountryCode:altCountryCode):"",
          whatsappPhone,origin,destination,travelDate,adults,children,infants,notes,
        }),
      });
      const body=await result.json().catch(()=>null);
      if(!result.ok||!body?.success){setError(body?.message||"تعذر إرسال الطلب، حاول مجدداً.");return;}
      setConfirmation(body.data);
    }catch{setError("تعذر الاتصال بالخدمة حالياً. أعد المحاولة.");}
    finally{setBusy(false);}
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#F7F4ED] px-4 pb-24 pt-32 text-[#0D3B34] md:px-8">
      <section className="mx-auto max-w-[1260px]">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[.18em] text-[#AA822A]">AREES LOOP · AREES TRAVEL</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-[#0D3B34]/72">قدّم طلبك، ثم يتواصل معك فريق أريس لتحديد التوفر والسعر وإرسال عرض رسمي. <strong>لا يوجد سداد أو إصدار تذاكر في هذه الصفحة.</strong></p>
          </div>
          <div className="flex gap-2">
            <Link href="/flights" className={`rounded-full px-5 py-3 text-sm font-bold ${!ferry?"bg-[#0D3B34] text-white":"border border-[#D4AF37]/50 bg-white"}`}>✈ حجز طيران</Link>
            <Link href="/ferries" className={`rounded-full px-5 py-3 text-sm font-bold ${ferry?"bg-[#0D3B34] text-white":"border border-[#D4AF37]/50 bg-white"}`}>⚓ حجز باخرة</Link>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.3fr)]">
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[28px] bg-[#0D3B34] px-6 py-7 text-white shadow-xl">
              <p className="text-sm font-bold text-[#E8CC85]">{ferry?"جداول البواخر والعروض":"عروض الطيران والوجهات"}</p>
              <h2 className="mt-2 text-2xl font-black">عروض أريس المختارة</h2>
              <p className="mt-2 text-sm leading-7 text-white/80">الأسعار استرشادية حسب الإعلان، والتوفر والسعر النهائي يخضعان للتأكيد عند مراجعة الطلب.</p>
            </div>
            {offersError&&<div role="status" className="rounded-2xl border border-amber-200 bg-white px-5 py-4 text-sm leading-7">العروض غير متاحة للعرض حالياً، لكن يمكنك إرسال طلب سفر عند اتصال خدمة الطلبات.</div>}
            {offers.map(offer=>(
              <article key={offer.id} className="overflow-hidden rounded-[26px] border border-[#D4AF37]/35 bg-white shadow-[0_15px_45px_rgba(13,59,52,.07)]">
                {offer.bannerUrl&&<div className="h-36 overflow-hidden bg-[#F2EEE3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={offer.bannerUrl} alt={offer.title} className="h-full w-full object-cover"/>
                </div>}
                <div className="p-5">
                  {offer.carrierName&&<p className="text-xs font-black text-[#B18D32]">{offer.carrierName}</p>}
                  <h3 className="mt-2 text-lg font-black">{offer.title}</h3>
                  {offer.origin&&offer.destination&&<p className="mt-2 text-sm">{offer.origin} ← {offer.destination}</p>}
                  {offer.travelDate&&<p className="mt-1 text-xs text-[#0D3B34]/65">موعد الرحلة: {new Date(offer.travelDate).toLocaleDateString("ar-SA",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})}</p>}
                  {offer.amountSar!==null&&<p className="mt-3 text-2xl font-black text-[#A47A23]">{offer.amountSar.toLocaleString("ar-SA")} ر.س <span className="text-xs font-medium">{offer.priceUnit||""}</span></p>}
                  {offer.description&&<p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#0D3B34]/75">{offer.description}</p>}
                </div>
              </article>
            ))}
            {!offersError&&offers.length===0&&<div className="rounded-2xl border border-dashed border-[#D4AF37]/45 bg-white p-6 text-sm leading-8">سيتم عرض الأسعار والجداول المتاحة هنا عند نشرها من إدارة أريس.</div>}
            <div className="rounded-[24px] border border-[#D4AF37]/35 bg-[#FFFAEE] p-5 text-sm leading-8">
              <h3 className="font-black">مهم قبل إرسال الطلب</h3>
              <p className="mt-2">{policies[kind]}</p>
              <p className="mt-2 font-bold">لا تدفع أي مبلغ في هذه الصفحة.</p>
            </div>
          </aside>

          <section className="min-w-0 rounded-[30px] border border-[#D4AF37]/30 bg-white p-5 shadow-[0_20px_60px_rgba(13,59,52,.08)] md:p-8">
            {confirmation?(
              <div role="status">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-700">✓</div>
                <h2 className="text-3xl font-black">تم استلام طلبك بنجاح</h2>
                <p className="mt-3 text-sm leading-8">رقم الطلب: <strong dir="ltr">{confirmation.reference}</strong></p>
                <div className="mt-6 grid gap-3 rounded-[22px] bg-[#F8F4E9] p-5 text-sm leading-7 sm:grid-cols-2">
                  <p>الاسم: <b>{confirmation.customerName}</b></p>
                  <p>نوع الطلب: <b>{ferry?"باخرة":"طيران"}</b></p>
                  <p>من: <b>{confirmation.origin}</b></p>
                  <p>إلى: <b>{confirmation.destination}</b></p>
                  <p>السفر: <b>{confirmation.travelDate}</b></p>
                  <p>المسافرون: <b>{confirmation.adults} بالغ / {confirmation.children} طفل / {confirmation.infants} رضيع</b></p>
                  <p className="sm:col-span-2">التواصل: <b dir="ltr">{confirmation.phone}</b></p>
                </div>
                <p className="mt-5 text-sm leading-8">سيراجع موظف أريس الطلب ويتواصل معك على الرقم المدخل لإرسال السعر والتوفر. <strong>لا يعتبر الطلب تذكرة أو حجزاً مؤكداً.</strong></p>
                <button type="button" onClick={()=>{setConfirmation(null);setNotes("");}} className="mt-7 rounded-full bg-[#0D3B34] px-8 py-3 font-bold text-white">إرسال طلب جديد</button>
              </div>
            ):(
              <>
                <h2 className="text-2xl font-black">بيانات طلب {title}</h2>
                <p className="mt-2 text-sm leading-7 text-[#0D3B34]/65">املأ البيانات التالية للتواصل معك بعرض السعر. لا تتطلب العملية حساباً أو دفعاً.</p>
                {error&&<p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
                <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
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
                  <div className="sm:col-span-2">
                    <p className="mb-2 text-sm font-bold">واتساب بديل (اختياري إذا كنت خارج بلدك)</p>
                    <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
                      <select aria-label="مفتاح دولة واتساب البديل" className={field} value={altCountryCode} onChange={e=>setAltCountryCode(e.target.value)}>{codes.map(([v,t])=><option value={v} key={v}>{t}</option>)}</select>
                      <input aria-label="رقم واتساب البديل" className={field} inputMode="tel" value={whatsappPhone} onChange={e=>setWhatsappPhone(e.target.value)} placeholder="رقم واتساب آخر"/>
                    </div>
                    {altCountryCode==="other"&&whatsappPhone&&<input required inputMode="numeric" className={field+" mt-2"} aria-label="مفتاح دولة واتساب آخر" value={altCustomCountryCode} onChange={e=>setAltCustomCountryCode(e.target.value)}/>}
                  </div>
                  {ferry?(
                    <>
                      <label className={label}>من *<select required className={field} value={origin} onChange={e=>{const next=e.target.value;setOrigin(next);setDestination(next==="سواكن"?"جدة":"سواكن");}}><option value="سواكن">سواكن</option><option value="جدة">جدة</option></select></label>
                      <label className={label}>إلى *<select required className={field} value={destination} onChange={e=>{const next=e.target.value;setDestination(next);setOrigin(next==="سواكن"?"جدة":"سواكن");}}><option value="جدة">جدة</option><option value="سواكن">سواكن</option></select></label>
                    </>
                  ):(
                    <>
                      <label className={label}>مدينة / مطار المغادرة *<input className={field} required maxLength={100} value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="مثلاً: المدينة المنورة"/></label>
                      <label className={label}>مدينة / مطار الوصول *<input className={field} required maxLength={100} value={destination} onChange={e=>setDestination(e.target.value)} placeholder="مثلاً: الخرطوم"/></label>
                    </>
                  )}
                  <label className={label}>تاريخ السفر المطلوب *<input className={field} required type="date" min={today} value={travelDate} onChange={e=>setTravelDate(e.target.value)}/></label>
                  <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                    {[["البالغون",adults,setAdults,1],["الأطفال",children,setChildren,0],["الرضع",infants,setInfants,0]].map(([title,value,setter,min])=>(
                      <label key={String(title)} className="flex flex-col gap-2 text-xs font-bold">{String(title)}<input type="number" className={field+" text-center"} value={Number(value)} min={Number(min)} max={30} required onChange={e=>(setter as (n:number)=>void)(Number(e.target.value))}/></label>
                    ))}
                  </div>
                  <label className={label+" sm:col-span-2"}>ملاحظات أو متطلبات خاصة<textarea className={field} value={notes} onChange={e=>setNotes(e.target.value)} rows={4} maxLength={1200} placeholder="رحلة ذهاب فقط/ملاحظات الأمتعة أو المقاعد أو غيرها..."/></label>
                  <div className="sm:col-span-2 rounded-2xl bg-[#F7F2E6] p-4 text-xs leading-7 text-[#0D3B34]/80">بإرسال الطلب، أوافق على استخدام بيانات التواصل المقدمة للرد على الاستفسار. {policies[kind]}</div>
                  <div className="sm:col-span-2"><button disabled={busy} type="submit" className="w-full rounded-2xl bg-[#0D3B34] px-6 py-4 text-base font-black text-white transition hover:bg-[#16574B] disabled:opacity-40">{busy?"جاري إرسال الطلب...":"إرسال طلب السعر — بدون سداد"}</button></div>
                </form>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
