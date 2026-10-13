"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AirportLookup, AirlineLookup } from "@/app/components/AviationLookup";

type RequestRow={
  id:string;reference:string;kind:string;customerName:string;customerEmail:string|null;
  countryCode:string;phone:string;whatsappCountryCode:string|null;whatsappPhone:string|null;
  origin:string;destination:string;travelDate:string;adults:number;children:number;infants:number;
  notes:string|null;status:string;adminNotes:string|null;carrierName:string|null;
  quoteAmountSar:number|null;quoteNotes:string|null;quoteValidUntil:string|null;whatsappStatus:string;
  notificationStatus:string;createdAt:string;assignedToId:string|null;canceledBy:string|null;cancellationReason:string|null;
  tripType?:string;returnDate?:string|null;itinerary?:unknown;
};
type Offer={
  id:string;kind:string;title:string;description:string|null;carrierName:string|null;
  origin:string|null;destination:string|null;travelDate:string|null;amountSar:number|null;
  priceUnit:string|null;bannerUrl:string|null;operationStatus:string;operationNote:string|null;
  isVisible:boolean;sortOrder:number;
};
const operators={FLIGHT:["تاركو للطيران","بدر للطيران","الخطوط الجوية السودانية","أخرى"],FERRY:["الجودي","دليلة","عمان","مونتي","أخرى"]};
type Staff={id:string;firstName:string|null;lastName:string|null;email:string;role:string};
type HistoryEvent={id:string;actorName:string;action:string;fromStatus:string|null;toStatus:string|null;details:unknown;createdAt:string};
const statusNames:Record<string,string>={NEW:"جديد",PROCESSING:"تحت المعالجة",QUOTE_READY:"عرض السعر جاهز",QUOTE_SENT:"تم إرسال عرض السعر",PAID:"تم السداد",EXECUTING:"تحت التنفيذ",DONE:"تم التنفيذ",CANCELED:"تم الإلغاء"};
const transitions:Record<string,string[]>={NEW:["PROCESSING","CANCELED"],PROCESSING:["QUOTE_READY","CANCELED"],QUOTE_READY:["PROCESSING","CANCELED"],QUOTE_SENT:["PAID","PROCESSING","CANCELED"],PAID:["EXECUTING","CANCELED"],EXECUTING:["DONE","CANCELED"],DONE:[],CANCELED:[]};
const blankOffer={
  id:"",kind:"FERRY",title:"",description:"",carrierName:"",origin:"سواكن",destination:"جدة",
  travelDate:"",amountSar:"",priceUnit:"للبالغ",bannerUrl:"",operationStatus:"AVAILABLE",operationNote:"",
  isVisible:true,sortOrder:0,
};
type OfferForm=typeof blankOffer;
const field="w-full rounded-xl border border-[#D4AF37]/35 bg-[#FFFEFA] px-3 py-3 text-sm outline-[#B38A25]";
const label="flex flex-col gap-1.5 text-xs font-semibold";
const day=(d:string|null)=>d?d.slice(0,10):"";

export default function TransportAdminPage() {
  const [tab,setTab]=useState<"requests"|"offers">("requests");
  const [requests,setRequests]=useState<RequestRow[]>([]);
  const [offers,setOffers]=useState<Offer[]>([]);
  const [staff,setStaff]=useState<Staff[]>([]);
  const [identity,setIdentity]=useState<{role:string;id:string}|null>(null);
  const [history,setHistory]=useState<HistoryEvent[]>([]);
  const [cancelReason,setCancelReason]=useState("");
  const [cancelBy,setCancelBy]=useState("STAFF");
  const [filterKind,setFilterKind]=useState<"ALL"|"FLIGHT"|"FERRY">("ALL");
  const [bannerFile,setBannerFile]=useState<File|null>(null);
  const [bannerPreview,setBannerPreview]=useState("");
  const [selected,setSelected]=useState<RequestRow|null>(null);
  const [form,setForm]=useState({carrierName:"",quoteAmountSar:"",quoteNotes:"",adminNotes:"",quoteValidUntil:""});
  const [offerForm,setOfferForm]=useState<OfferForm>({...blankOffer});
  const [status,setStatus]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const [r,o]=await Promise.all([
        fetch("/api/admin/transport?mode=requests",{cache:"no-store"}),
        fetch("/api/admin/transport?mode=offers",{cache:"no-store"}),
      ]);
      const [q,p]=await Promise.all([r.json(),o.json()]);
      if(!r.ok||!q.success||!o.ok||!p.success){setError(q.message||p.message||"تعذر تحميل بيانات إدارة النقل.");return;}
      setRequests(q.data);setOffers(p.data);setError("");
    }catch{setError("تعذر الاتصال بالخادم.");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{
    void fetch("/api/admin/me",{cache:"no-store"}).then(r=>r.json()).then(d=>{
      if(d.success)setIdentity({role:d.data.role,id:d.data.id});
    }).catch(()=>{});
    void fetch("/api/admin/transport?mode=staff",{cache:"no-store"}).then(r=>r.json()).then(d=>{
      if(d.success)setStaff(d.data||[]);
    }).catch(()=>{});
  },[]);
  useEffect(()=>{
    if(!bannerFile){setBannerPreview("");return;}
    const url=URL.createObjectURL(bannerFile);setBannerPreview(url);
    return()=>URL.revokeObjectURL(url);
  },[bannerFile]);
  const showSuper=identity?.role==="SUPER_ADMIN";
  const staffName=(id:string|null)=>{
    const user=staff.find(s=>s.id===id);
    return user?([user.firstName,user.lastName].filter(Boolean).join(" ")||user.email):"لم يسند بعد";
  };
  async function loadHistory(id:string){
    try {
      const r=await fetch("/api/admin/transport?mode=history&id="+encodeURIComponent(id),{cache:"no-store"});
      const d=await r.json();setHistory(d.success?d.data:[]);
    }catch{setHistory([]);}
  }

  function choose(q:RequestRow) {
    setSelected(q);setError("");setStatus("");
    void loadHistory(q.id);
    setForm({carrierName:q.carrierName||"",
      quoteAmountSar:q.quoteAmountSar===null?"":String(q.quoteAmountSar),
      quoteNotes:q.quoteNotes||"",adminNotes:q.adminNotes||"",
      quoteValidUntil:day(q.quoteValidUntil)});
  }

  async function saveQuote(event:FormEvent) {
    event.preventDefault();if(!selected||busy)return;
    setBusy(true);setError("");setStatus("");
    try{
      const r=await fetch("/api/admin/transport",{method:"PATCH",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:selected.id,action:"SAVE_QUOTE",...form})});
      const result=await r.json();
      if(!r.ok||!result.success){setError(result.message||"تعذر حفظ العرض.");return;}
      setSelected(result.data);
      void loadHistory(selected.id);
      setStatus("حُفظ عرض السعر. يمكن فتحه وطباعة PDF، ثم إرساله يدوياً من واتساب الشركة.");
      await load();
    }catch{setError("تعذر حفظ العرض.");}
    finally{setBusy(false);}
  }

  async function performAction(action:"SET_STATUS"|"ASSIGN",payload:Record<string,unknown>){
    if(!selected||busy)return;
    setBusy(true);setError("");setStatus("");
    try{
      const r=await fetch("/api/admin/transport",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected.id,action,...payload})});
      const d=await r.json();
      if(!r.ok||!d.success){setError(d.message||"تعذر تنفيذ الإجراء.");return;}
      setSelected(d.data);
      setStatus(action==="ASSIGN"?"تم إسناد الطلب للموظف المختار.":"تم تحديث حالة الطلب وتسجيل الإجراء في السجل.");
      setCancelReason("");
      void loadHistory(selected.id);
      await load();
    }catch{setError("تعذر تحديث الطلب.");}
    finally{setBusy(false);}
  }

  async function markManuallySent() {
    if(!selected||busy)return;setBusy(true);setError("");
    try{
      if(!window.confirm("هل أرسلت ملف عرض السعر PDF فعلياً من واتساب الشركة؟ فتح المحادثة فقط لا يكفي.")){setBusy(false);return;}
      const r=await fetch("/api/admin/transport",{method:"PATCH",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:selected.id,action:"MARK_MANUAL_WHATSAPP",confirmed:true})});
      const q=await r.json();
      if(!r.ok||!q.success){setError(q.message||"تعذر تحديث الإرسال.");return;}
      setSelected(current=>current?{...current,whatsappStatus:"MANUALLY_MARKED_SENT",status:"QUOTE_SENT"}:current);
      void loadHistory(selected.id);
      setStatus("تم تسجيل تأكيد الموظف اليدوي لإرسال العرض. هذا ليس إثبات تسليم من واتساب.");
      await load();
    }catch{setError("تعذر تحديث حالة الإرسال.");}
    finally{setBusy(false);}
  }

  const customerWhatsApp = selected
    ? (selected.whatsappPhone ? (selected.whatsappCountryCode||"")+selected.whatsappPhone : selected.countryCode+selected.phone).replace(/\D/g,"")
    : "";
  const message = selected ? `السلام عليكم، بناءً على طلبكم لدى شركة أريس للحجز ${selected.kind==="FERRY"?"بالباخرة":"بالطيران"} رقم ${selected.reference} (${selected.origin} - ${selected.destination})، أعددنا عرض السعر لدى ${selected.carrierName||"الناقل المختار"}. المبلغ ${selected.quoteAmountSar===null?"قيد التحديد":selected.quoteAmountSar+" ريال سعودي"}. سنرفق عرض السعر PDF بهذه المحادثة. نؤكد أن العرض ليس حجزاً نهائياً، وشروط الاسترداد والتعديل وفق الناقل. ${selected.quoteNotes||""}` : "";

  function startOffer(offer?:Offer) {
    setStatus("");setError("");setTab("offers");
    setOfferForm(offer?{
      id:offer.id,kind:offer.kind,title:offer.title,description:offer.description||"",
      carrierName:offer.carrierName||"",origin:offer.origin||"",destination:offer.destination||"",
      travelDate:day(offer.travelDate),amountSar:offer.amountSar===null?"":String(offer.amountSar),
      priceUnit:offer.priceUnit||"",bannerUrl:offer.bannerUrl||"",
      operationStatus:offer.operationStatus,operationNote:offer.operationNote||"",
      isVisible:offer.isVisible,sortOrder:offer.sortOrder,
    }:{...blankOffer});
  }

  async function saveOffer(event:FormEvent) {
    event.preventDefault();if(busy)return;setBusy(true);setError("");setStatus("");
    try{
      const method=offerForm.id?"PUT":"POST";
      const r=await fetch("/api/admin/transport",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(offerForm)});
      const d=await r.json();
      if(!r.ok||!d.success){setError(d.message||"تعذر حفظ العرض.");return;}
      setStatus("تم حفظ العرض أو الجدول. سيظهر للزوار إذا اخترت «ظاهر» والبيانات متصلة.");
      setOfferForm({...blankOffer});
      await load();
    }catch{setError("تعذر الاتصال بالخادم لحفظ العرض.");}
    finally{setBusy(false);}
  }

  const ferryOperators=operators.FERRY;
  return (
    <main dir="rtl" className="mx-auto max-w-[1300px] px-5 py-8 text-[#0D3B34]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-black tracking-widest text-[#A78332]">AREES LOOP · AREES TRAVEL</p>
          <h1 className="mt-2 text-3xl font-black">حجوزات الطيران والبواخر</h1>
          <p className="mt-2 text-sm leading-8 text-[#0D3B34]/70">استقبال الطلبات، إعداد عروض الأسعار، متابعة التواصل، وإدارة إعلانات الأسعار وجداول البواخر.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/flights" className="rounded-full border border-[#D4AF37] bg-white px-4 py-2.5 text-sm font-bold">معاينة الطيران</Link>
          <Link href="/ferries" className="rounded-full border border-[#D4AF37] bg-white px-4 py-2.5 text-sm font-bold">معاينة البواخر</Link>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap gap-2">
        <button onClick={()=>setTab("requests")} className={`rounded-full px-6 py-3 text-sm font-bold ${tab==="requests"?"bg-[#0D3B34] text-white":"border border-[#D4AF37]/40 bg-white"}`}>طلبات العملاء ({requests.length})</button>
        <button onClick={()=>setTab("offers")} className={`rounded-full px-6 py-3 text-sm font-bold ${tab==="offers"?"bg-[#0D3B34] text-white":"border border-[#D4AF37]/40 bg-white"}`}>الأسعار والعروض والجداول ({offers.length})</button>
        <button onClick={()=>void load()} disabled={busy||loading} className="rounded-full border border-[#D4AF37]/40 px-5 py-3 text-sm font-bold disabled:opacity-40">تحديث</button>
      </div>
      {error&&<p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {status&&<p role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">{status}</p>}
      {loading&&<p className="mt-5 text-sm">جاري تحميل البيانات...</p>}
      {tab==="requests"&&(
        <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(350px,1fr)]">
          <section className="min-w-0 space-y-3">
            {requests.length===0&&!loading&&<p className="rounded-2xl border bg-white p-5 text-sm">لا توجد طلبات قابلة للعرض حالياً.</p>}
            {requests.map(q=>(
              <button key={q.id} onClick={()=>choose(q)} className={`w-full rounded-[20px] border p-5 text-right transition hover:shadow-lg ${selected?.id===q.id?"border-[#D4AF37] bg-[#FFF9E7]":"border-[#D4AF37]/25 bg-white"}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-black">{q.kind==="FERRY"?"⚓ باخرة":"✈ طيران"} · {q.customerName}</span>
                  <span className="rounded-full bg-[#EDF2EB] px-3 py-1 text-xs font-bold">{q.status}</span>
                </div>
                <p className="mt-2 text-sm">{q.origin} ← {q.destination} · {day(q.travelDate)}</p>
                <p className="mt-2 text-xs text-[#0D3B34]/70">{q.reference} · +{q.countryCode}{q.phone}</p>
                {q.notificationStatus==="FAILED"&&<p className="mt-2 text-xs font-semibold text-amber-700">تنبيه: البريد الإداري لم يؤكد إرساله؛ الطلب محفوظ في القاعدة</p>}
              </button>
            ))}
          </section>
          <section className="min-w-0 rounded-[25px] border border-[#D4AF37]/35 bg-white p-5 shadow-md lg:p-6">
            {!selected? <p className="text-sm">اختر طلباً من القائمة لفتح تفاصيله وتجهيز عرض السعر.</p> : (
              <>
                <h2 className="text-xl font-black">طلب {selected.reference}</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#F7F4EB] p-4 text-sm">
                  <p>الاسم: <b>{selected.customerName}</b></p>
                  <p>التواصل: <b dir="ltr">+{selected.countryCode}{selected.phone}</b></p>
                  <p>المغادرة: <b>{selected.origin}</b></p>
                  <p>الوصول: <b>{selected.destination}</b></p>
                  <p>السفر: <b>{day(selected.travelDate)}</b></p>
                  <p>العدد: <b>{selected.adults} بالغ / {selected.children} طفل / {selected.infants} رضيع</b></p>
                </div>
                {selected.notes&&<p className="mt-3 whitespace-pre-wrap rounded-xl border p-3 text-xs leading-7">ملاحظات العميل: {selected.notes}</p>}
                <form onSubmit={saveQuote} className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2 rounded-xl border border-[#D4AF37]/35 bg-[#F9F6EC] px-4 py-3 text-sm font-bold">حالة الطلب الحالية: {statusNames[selected.status]||selected.status}</div>
                  <label className={label}>المشغّل / الباخرة / شركة الطيران
                    {selected.kind==="FLIGHT" ? <AirlineLookup ariaLabel="ابحث عن شركة الطيران" value={form.carrierName} onChange={v=>setForm(f=>({...f,carrierName:v}))} placeholder="اختر شركة طيران برمز IATA أو اكتب اسماً آخر"/> :
                      <><input className={field} list="ferry-operators-quote" value={form.carrierName} onChange={e=>setForm(f=>({...f,carrierName:e.target.value}))} placeholder="اسم الباخرة" maxLength={100}/>
                        <datalist id="ferry-operators-quote">{operators.FERRY.map(n=><option value={n} key={n}/>)}</datalist></>}
                  </label>
                  <label className={label}>سعر العرض الإجمالي (ريال سعودي)<input className={field} type="number" min="0" step=".01" value={form.quoteAmountSar} onChange={e=>setForm(f=>({...f,quoteAmountSar:e.target.value}))} placeholder="0.00"/></label>
                  <label className={label}>صلاحية العرض حتى<input className={field} type="date" value={form.quoteValidUntil} onChange={e=>setForm(f=>({...f,quoteValidUntil:e.target.value}))}/></label>
                  <label className={label+" sm:col-span-2"}>ملاحظات العرض للعميل / توقف الباخرة<textarea className={field} rows={3} maxLength={2500} value={form.quoteNotes} onChange={e=>setForm(f=>({...f,quoteNotes:e.target.value}))} placeholder="مثل: جودي غير متاحة حالياً، وتوجد رحلة دليلة في الموعد المحدد..."/></label>
                  <label className={label+" sm:col-span-2"}>ملاحظات داخلية للموظف (لا تظهر في PDF)<textarea className={field} rows={2} maxLength={2500} value={form.adminNotes} onChange={e=>setForm(f=>({...f,adminNotes:e.target.value}))}/></label>
                  <button disabled={busy} className="rounded-xl bg-[#0D3B34] px-5 py-3 font-bold text-white disabled:opacity-40 sm:col-span-2" type="submit">حفظ تفاصيل عرض السعر</button>
                </form>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <Link href={`/admin/transport/quote/${selected.id}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#D4AF37]/50 bg-[#FFF8E4] px-4 py-3 text-center text-sm font-bold">فتح عرض السعر · طباعة PDF</Link>
                  <a href={`https://wa.me/${customerWhatsApp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#D4AF37]/50 bg-white px-4 py-3 text-center text-sm font-bold">فتح محادثة العميل في واتساب</a>
                </div>
                <p className="mt-3 text-xs leading-7 text-[#0D3B34]/65">احفظ عرض السعر PDF ثم أرفقه يدوياً من حساب واتساب الشركة في المحادثة المفتوحة. فتح المحادثة وحده لا يعني إرسال الملف. لا يتم إرسال المستند تلقائياً قبل ربط WhatsApp Cloud API.</p>
                <button disabled={busy} type="button" onClick={()=>void markManuallySent()} className="mt-4 w-full rounded-xl border border-[#D4AF37]/35 px-4 py-3 text-sm font-bold">تأكيد الموظف أنه أرسل PDF يدوياً</button>
                <p className="mt-2 text-xs">حالة واتساب: {selected.whatsappStatus==="MANUALLY_MARKED_SENT"?"أكد الموظف الإرسال يدوياً":"لم يتم إثبات الإرسال"}</p>
              </>
            )}
          </section>
        </div>
      )}
      {tab==="offers"&&(
        <div className="mt-7 grid items-start gap-6 xl:grid-cols-2">
          <section className="rounded-[25px] border border-[#D4AF37]/35 bg-white p-6">
            <h2 className="text-xl font-black">{offerForm.id?"تعديل عرض أو جدول":"إضافة عرض أو جدول جديد"}</h2>
            <p className="mt-2 text-xs leading-7">الأسعار تظهر في البطاقات الجانبية، وليس داخل نموذج طلب العميل. في البواخر أضف حالة التشغيل والملاحظات عند توقف أي باخرة.</p>
            <form onSubmit={saveOffer} className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className={label}>الخدمة<select className={field} value={offerForm.kind} onChange={e=>setOfferForm(f=>({...f,kind:e.target.value}))}><option value="FERRY">بواخر</option><option value="FLIGHT">طيران</option></select></label>
              <label className={label}>الناقل / الباخرة
                {offerForm.kind==="FLIGHT" ? <AirlineLookup ariaLabel="شركة الطيران في الإعلان" value={offerForm.carrierName} onChange={v=>setOfferForm(f=>({...f,carrierName:v}))} /> :
                  <><input className={field} list="offer-operators" value={offerForm.carrierName} onChange={e=>setOfferForm(f=>({...f,carrierName:e.target.value}))} placeholder="اختر الباخرة"/><datalist id="offer-operators">{ferryOperators.map(v=><option key={v} value={v}/>)}</datalist></>}
              </label>
              <label className={label+" sm:col-span-2"}>اسم العرض / الجدول<input required maxLength={160} className={field} value={offerForm.title} onChange={e=>setOfferForm(f=>({...f,title:e.target.value}))}/></label>
              <label className={label}>من
                {offerForm.kind==="FLIGHT" ? <AirportLookup ariaLabel="مطار أو مدينة المغادرة" value={offerForm.origin} onChange={v=>setOfferForm(f=>({...f,origin:v}))}/> :
                  <select className={field} value={offerForm.origin} onChange={e=>setOfferForm(f=>({...f,origin:e.target.value,destination:e.target.value==="جدة"?"سواكن":"جدة"}))}><option value="سواكن">سواكن</option><option value="جدة">جدة</option></select>}
              </label>
              <label className={label}>إلى
                {offerForm.kind==="FLIGHT" ? <AirportLookup ariaLabel="مطار أو مدينة الوصول" value={offerForm.destination} onChange={v=>setOfferForm(f=>({...f,destination:v}))}/> :
                  <select className={field} value={offerForm.destination} onChange={e=>setOfferForm(f=>({...f,destination:e.target.value,origin:e.target.value==="جدة"?"سواكن":"جدة"}))}><option value="جدة">جدة</option><option value="سواكن">سواكن</option></select>}
              </label>
              <label className={label}>موعد السفر/الإبحار<input className={field} type="date" value={offerForm.travelDate} onChange={e=>setOfferForm(f=>({...f,travelDate:e.target.value}))}/></label>
              <label className={label}>السعر المعلن (ريال)<input className={field} type="number" min="0" step=".01" value={offerForm.amountSar} onChange={e=>setOfferForm(f=>({...f,amountSar:e.target.value}))}/></label>
              <label className={label}>وحدة السعر<input className={field} placeholder="للبالغ / للطفل / يبدأ من" value={offerForm.priceUnit} onChange={e=>setOfferForm(f=>({...f,priceUnit:e.target.value}))}/></label>
              <label className={label}>حالة التشغيل<select className={field} value={offerForm.operationStatus} onChange={e=>setOfferForm(f=>({...f,operationStatus:e.target.value}))}><option value="AVAILABLE">تعمل / متاحة</option><option value="SUSPENDED">متوقفة حالياً</option><option value="UNKNOWN">غير مؤكد</option></select></label>
              <label className={label+" sm:col-span-2"}>وصف العرض<textarea className={field} rows={3} value={offerForm.description} onChange={e=>setOfferForm(f=>({...f,description:e.target.value}))}/></label>
              <label className={label+" sm:col-span-2"}>ملاحظات التشغيل التي تظهر للعميل<textarea className={field} rows={2} value={offerForm.operationNote} onChange={e=>setOfferForm(f=>({...f,operationNote:e.target.value}))} placeholder="مثلاً: الباخرة متوقفة حالياً حتى إشعار آخر"/></label>
              <label className={label+" sm:col-span-2"}>رابط بنر من ملفات المشروع (اختياري)<input className={field} value={offerForm.bannerUrl} onChange={e=>setOfferForm(f=>({...f,bannerUrl:e.target.value}))} placeholder="/Image/..."/></label>
              <label className={label}>ترتيب العرض<input className={field} type="number" min={0} max={9999} value={offerForm.sortOrder} onChange={e=>setOfferForm(f=>({...f,sortOrder:Number(e.target.value)}))}/></label>
              <label className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/30 p-3 text-sm font-bold"><input type="checkbox" checked={offerForm.isVisible} onChange={e=>setOfferForm(f=>({...f,isVisible:e.target.checked}))}/> ظاهر للزوار</label>
              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button disabled={busy} className="rounded-xl bg-[#0D3B34] px-6 py-3 font-bold text-white disabled:opacity-40">حفظ العرض</button>
                <button type="button" onClick={()=>setOfferForm({...blankOffer})} className="rounded-xl border border-[#D4AF37] px-5 py-3 text-sm font-bold">عرض جديد</button>
              </div>
            </form>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-black">العروض والجداول المنشورة</h2>
            {offers.length===0&&!loading&&<p className="rounded-xl bg-white p-5 text-sm">لا توجد عروض بعد.</p>}
            {offers.map(offer=>(
              <article key={offer.id} className="rounded-[22px] border border-[#D4AF37]/30 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-xs font-semibold text-[#947426]">{offer.kind==="FERRY"?"بواخر":"طيران"} · {offer.carrierName}</p>
                    <h3 className="mt-1 text-lg font-black">{offer.title}</h3>
                    <p className="mt-2 text-sm">{offer.origin} ← {offer.destination} · {day(offer.travelDate)}</p>
                    {offer.amountSar!==null&&<p className="mt-1 font-black text-[#9A7020]">{offer.amountSar.toLocaleString("ar-SA")} ر.س {offer.priceUnit}</p>}
                    <p className="mt-2 text-xs">{offer.isVisible?"ظاهر":"مخفي"} · {offer.operationStatus==="SUSPENDED"?"متوقف":offer.operationStatus==="UNKNOWN"?"قيد التأكيد":"متاح"}</p>
                    {offer.operationNote&&<p className="mt-2 whitespace-pre-wrap text-xs text-amber-800">{offer.operationNote}</p>}
                  </div>
                  <button onClick={()=>startOffer(offer)} className="rounded-full border border-[#D4AF37]/40 px-5 py-2 text-sm font-bold">تعديل</button>
                </div>
              </article>
            ))}
          </section>
        </div>
      )}
    </main>
  );
}
