"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type PriceMode = "INCLUDED" | "ADDED";
type ServiceType = "EXPERIENCE" | "PROGRAM" | "HOTEL" | "TOUR" | "EVENT" | "GUIDE" | "TRANSPORT" | "TICKET" | "OTHER";
type ApprovedLicense = { id:string; type:string; issuer:string; licenseNumber:string; status:string };
type PartnerApplication = { status:string; categories:Array<{name:string}>; licenses:ApprovedLicense[] };
const SERVICE_LABELS:Record<ServiceType,string>={EXPERIENCE:"تجربة أو نشاط",PROGRAM:"برنامج سياحي",HOTEL:"فندق / إقامة",TOUR:"جولة سياحية",EVENT:"فعالية",GUIDE:"مرشد سياحي",TRANSPORT:"نقل سياحي",TICKET:"وجهة / تذكرة دخول",OTHER:"خدمة أخرى معتمدة"};
function allowedTypes(app:PartnerApplication|null):ServiceType[]{
  if(!app||app.status!=="ACTIVE") return [];
  const text=[...(app.categories||[]).map(x=>x.name),...(app.licenses||[]).filter(x=>x.status==="VERIFIED").flatMap(x=>[x.type,x.issuer])].join(" ").toLowerCase();
  const set=new Set<ServiceType>();
  const has=(...words:string[])=>words.some(w=>text.includes(w.toLowerCase()));
  if(has("فندق","إيواء","ضيافة","hotel","accommodation","hospitality")) set.add("HOTEL");
  if(has("مرشد","guide")) set.add("GUIDE");
  if(has("نقل","transport")) set.add("TRANSPORT");
  if(has("فعالية","ترفيه","event","entertainment")) set.add("EVENT");
  if(has("وجهة","تذكرة","موقع سياحي","attraction","ticket")) set.add("TICKET");
  if(has("تجربة","نشاط","experience","activity")) set.add("EXPERIENCE");
  if(has("تنظيم الرحلات","منظم رحلات","tour operator","برنامج سياحي")) {set.add("PROGRAM");set.add("TOUR");}
  if(has("وكالة سفر","وكالات سفر","سفر وسياحة","travel agency")) {set.add("TOUR");set.add("TICKET");}
  return [...set];
}

export default function NewPartnerServicePage() {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<ServiceType>("EXPERIENCE");
  const [application,setApplication]=useState<PartnerApplication|null>(null);
  const [loadingEntitlements,setLoadingEntitlements]=useState(true);
  useEffect(()=>{fetch("/api/partner/application",{cache:"no-store"}).then(r=>r.json()).then(j=>setApplication(j.application||null)).finally(()=>setLoadingEntitlements(false));},[]);
  const permittedTypes=useMemo(()=>allowedTypes(application),[application]);
  useEffect(()=>{if(permittedTypes.length&&!permittedTypes.includes(serviceType)) setServiceType(permittedTypes[0]);},[permittedTypes,serviceType]);
  const verifiedLicenses=(application?.licenses||[]).filter(x=>x.status==="VERIFIED");
  const [priceMode, setPriceMode] = useState<PriceMode>("INCLUDED");
  const [location, setLocation] = useState<{lat:number;lng:number}|null>(null);
  const [locationError, setLocationError] = useState("");
  const [images, setImages] = useState<Array<{file:File;url:string}>>([]);
  const addImages=(e:ChangeEvent<HTMLInputElement>)=>{
    const files=Array.from(e.target.files||[]).filter(f=>f.type.startsWith("image/"));
    if(files.length) setImages(prev=>[...prev,...files.map(file=>({file,url:URL.createObjectURL(file)}))]);
    e.target.value="";
  };
  const removeImage=(index:number)=>setImages(prev=>{URL.revokeObjectURL(prev[index]?.url||"");return prev.filter((_,i)=>i!==index)});
  const useCurrentLocation=()=>{
    setLocationError("");
    if(!navigator.geolocation){setLocationError("المتصفح لا يدعم تحديد الموقع.");return;}
    navigator.geolocation.getCurrentPosition(
      p=>setLocation({lat:p.coords.latitude,lng:p.coords.longitude}),
      ()=>setLocationError("تعذر تحديد الموقع. تأكد من السماح للموقع في المتصفح."),
      {enableHighAccuracy:true,timeout:12000}
    );
  };
  const [price, setPrice] = useState(100);
  const commissionRate = 10;

  const preview = useMemo(() => {
    const areesBase = price * (commissionRate / 100);
    const areesVat = areesBase * 0.15;
    const areesTotal = areesBase + areesVat;
    return priceMode === "ADDED"
      ? { customer: price + areesTotal, partnerBase: price, areesBase, areesVat }
      : { customer: price, partnerBase: Math.max(0, price - areesTotal), areesBase, areesVat };
  }, [price, priceMode]);

  return (
    <main dir="rtl" className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]">
      <header className="border-b border-[#0D3B34]/8 bg-[#FBF9F3]/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 md:px-8">
          <div><p className="text-[10px] font-bold tracking-[.2em] text-[#B99124]">NEW SERVICE</p><h1 className="mt-1 text-lg font-bold">إضافة خدمة</h1></div>
          <Link href="/partner/services" className="rounded-full border border-[#0D3B34]/10 bg-white px-4 py-2 text-xs font-bold">حفظ والخروج</Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
        <div className="mb-7 grid grid-cols-4 gap-2">
          {["الأساسيات","المنفذ والترخيص","السعر والسياسات","المراجعة"].map((x,i)=><button key={x} onClick={()=>setStep(i+1)} className={`rounded-2xl px-3 py-3 text-xs font-bold ${step===i+1?"bg-[#0D3B34] text-white":"bg-white text-[#0D3B34]/50"}`}>{i+1}. {x}</button>)}
        </div>

        {step===1 && <Card eyebrow="STEP 01" title="ما نوع الخدمة التي ترغب بإضافتها؟" note="اختر النوع أولاً، وسنظهر لك الحقول المناسبة للخدمة.">
          <Field label="نوع الخدمة"><select value={serviceType} disabled={loadingEntitlements||permittedTypes.length===0} onChange={e=>setServiceType(e.target.value as ServiceType)} className="input">{permittedTypes.map(type=><option key={type} value={type}>{SERVICE_LABELS[type]}</option>)}</select></Field>
          {!loadingEntitlements&&permittedTypes.length===0&&<div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs leading-6"><b>لا يوجد نشاط متاح لإضافة خدمة حالياً.</b><br/>تظهر هنا فقط أنواع الخدمات المطابقة للأنشطة والتراخيص المعتمدة لمنشأتك. لإضافة نشاط جديد يلزم تقديم طلب إضافة نشاط/ترخيص واعتماده أولاً.</div>}
          {serviceType==="HOTEL" && <div className="rounded-[24px] border border-[#D4AF37]/25 bg-[#FFF8E5] p-5"><p className="text-sm font-bold">الإقامة لها نظام إتاحة مستقل</p><p className="mt-2 text-xs leading-6 text-[#0D3B34]/55">سجّل الفندق وبياناته الأساسية مرة واحدة. بعد الاعتماد ستدير أنواع الوحدات والأسعار والكميات المتاحة حسب التاريخ من شاشة الإتاحة، بدلاً من إنشاء خدمة جديدة لكل فترة.</p></div>}
          <Field label="اسم الخدمة"><input className="input" placeholder="مثال: جولة المدينة التاريخية أو إقامة فندقية"/></Field>
          <Field label="وصف مختصر"><textarea className="input min-h-28" placeholder="صف الخدمة كما سيشاهدها العميل..."/></Field>
          <div className="grid gap-4 md:grid-cols-2"><Field label="المدينة"><input className="input" placeholder="المدينة المنورة"/></Field><Field label="اسم الموقع / نقطة التجمع"><input className="input" placeholder="مثال: بوابة ٣، متحف، فندق..."/></Field></div>
          <div className="rounded-[24px] border border-[#0D3B34]/8 bg-[#F8F6EF] p-5">
            <p className="text-[10px] font-bold tracking-[.16em] text-[#B99124]">LOCATION</p>
            <p className="mt-2 text-sm font-bold">موقع تنفيذ الخدمة</p>
            <p className="mt-1 text-xs leading-6 text-[#0D3B34]/50">ثبّت الإحداثيات الدقيقة للخدمة. البحث بالخريطة سيضاف عند ربط مزود الخرائط، أما تحديد موقعك الحالي فيعمل مباشرة من المتصفح.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={useCurrentLocation} className="rounded-2xl bg-[#0D3B34] px-4 py-3 text-xs font-bold text-white">استخدام موقعي الحالي</button>
              {location&&<button type="button" onClick={()=>setLocation(null)} className="rounded-2xl border border-[#0D3B34]/10 bg-white px-4 py-3 text-xs font-bold">مسح الموقع</button>}
            </div>
            {location&&<div className="mt-4 rounded-2xl bg-white p-4 text-xs"><b>تم تثبيت الموقع ✓</b><p className="mt-1 text-[#0D3B34]/50" dir="ltr">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p></div>}
            {locationError&&<p className="mt-3 text-xs font-bold text-red-600">{locationError}</p>}
          </div>
          <div className="rounded-[24px] border border-[#0D3B34]/8 bg-white p-5">
            <p className="text-[10px] font-bold tracking-[.16em] text-[#B99124]">MEDIA</p>
            <p className="mt-2 text-sm font-bold">صور الخدمة</p>
            <p className="mt-1 text-xs leading-6 text-[#0D3B34]/50">أضف أكثر من صورة. الصورة الأولى هي الرئيسية، ويمكنك حذف الصور أو جعل أي صورة هي الرئيسية.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((img,i)=><div key={img.url} className="relative w-32 overflow-hidden rounded-2xl border border-[#0D3B34]/10 bg-[#F8F6EF]">
                <img src={img.url} alt={img.file.name} className="h-24 w-full object-cover"/>
                <div className="p-2"><p className="truncate text-[10px]">{img.file.name}</p>{i===0?<span className="text-[10px] font-bold text-[#B99124]">الصورة الرئيسية</span>:<button type="button" onClick={()=>setImages(prev=>[prev[i],...prev.filter((_,x)=>x!==i)])} className="text-[10px] font-bold">اجعلها الرئيسية</button>}</div>
                <button type="button" aria-label="حذف الصورة" onClick={()=>removeImage(i)} className="absolute left-1 top-1 h-7 w-7 rounded-full bg-white/90 text-xs font-bold">×</button>
              </div>)}
              <label className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#B99124]/50 bg-[#FFF8E5] text-center text-xs font-bold text-[#0D3B34]">+ إضافة صورة<input type="file" accept="image/*" multiple onChange={addImages} className="hidden"/></label>
            </div>
            {images.length>0&&<p className="mt-3 text-xs text-[#0D3B34]/50">تم اختيار {images.length} {images.length===1?"صورة":"صور"}</p>}
          </div>
        </Card>}

        {step===2 && <Card eyebrow="STEP 02" title="من الجهة المنفذة للخدمة؟" note="تُسحب بيانات المنشأة تلقائياً، وتختار فقط الترخيص المعتمد المناسب لهذه الخدمة.">
          <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#FFF8E5] p-4 text-xs leading-6"><b>مهم:</b> الشريك هو الجهة المنظمة أو المنفذة الفعلية. Arees Loop منصة للتسويق والحجز ضمن نطاق ترخيصها، ولا تظهر أريس كمنفذ للخدمة.</div>
          <div className="rounded-2xl bg-[#F8F6EF] p-5">
            <p className="text-[10px] font-bold text-[#0D3B34]/40">الجهة المنظمة / المنفذة</p>
            <p className="mt-2 text-sm font-bold">تُسحب تلقائياً من ملف منشأتك المعتمد</p>
            <p className="mt-1 text-xs leading-6 text-[#0D3B34]/45">لا يمكن تعديل اسم الجهة من داخل الخدمة.</p>
          </div>
          <Field label="الترخيص المستخدم لهذه الخدمة"><select className="input" disabled={verifiedLicenses.length===0}><option value="">اختر من تراخيص منشأتك المعتمدة</option>{verifiedLicenses.map(l=><option key={l.id} value={l.id}>{l.type} — {l.licenseNumber}</option>)}</select></Field>
          <p className="text-xs leading-6 text-[#0D3B34]/45">سيظهر للعميل اسم الجهة المنفذة ورقم الترخيص بصورة تعريفية هادئة، بدون رقم هاتف أو بريد إلكتروني أو رابط تواصل مباشر.</p>
        </Card>}

        {step===3 && serviceType==="HOTEL" && <HotelInventory />}

        {step===3 && serviceType!=="HOTEL" && <Card eyebrow="STEP 03" title="السعر والسياسات" note="اختيار بسيط، ونوضح لك النتيجة قبل النشر.">
          <Field label="سعر الخدمة"><div className="relative"><input type="number" value={price} onChange={e=>setPrice(Number(e.target.value)||0)} className="input pl-16"/><span className="absolute left-4 top-3.5 text-xs font-bold">ر.س</span></div></Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Choice active={priceMode==="INCLUDED"} onClick={()=>setPriceMode("INCLUDED")} title="السعر شامل مقابل أريس" text="العميل يرى السعر الذي أدخلته، ويخصم المقابل وفق الاتفاقية من التسوية."/>
            <Choice active={priceMode==="ADDED"} onClick={()=>setPriceMode("ADDED")} title="إضافة مقابل أريس على السعر" text="سعر الخدمة لك، ويضاف مقابل أريس وضريبته إلى السعر النهائي للعميل."/>
          </div>
          <div className="rounded-[24px] bg-[#0D3B34] p-5 text-white"><p className="text-xs text-white/50">معاينة السعر</p><div className="mt-4 grid gap-4 sm:grid-cols-3"><Metric label="سعر العميل" value={preview.customer}/><Metric label="أساس مقابل أريس" value={preview.areesBase}/><Metric label="ضريبة المقابل 15%" value={preview.areesVat}/></div><p className="mt-4 text-[11px] leading-6 text-white/45">المعاينة إرشادية قبل رسوم وسيلة الدفع أو أي تعديلات أخرى واجبة التطبيق.</p></div>
          <Field label="سياسة الإلغاء والاسترداد"><textarea className="input min-h-24" placeholder="اكتب الشروط بوضوح..."/></Field>
          <Field label="هل يوجد ضمان / تأمين مسترد؟"><select className="input"><option>لا يوجد</option><option>نعم، يوجد ضمان مسترد</option></select></Field>
        </Card>}

        {step===4 && <Card eyebrow="STEP 04" title="جاهزة للمراجعة" note="راجع أهم النقاط قبل إرسالها إلى Arees Loop.">
          <div className="grid gap-3 md:grid-cols-2">{serviceType==="HOTEL" ? ["بيانات الفندق الأساسية مكتملة","الجهة المنفذة مسحوبة من ملف المنشأة","بيانات الترخيص مضافة","نوع الوحدة والإتاحة محددان","فترة الإتاحة والسعر محددان","سياسة الإلغاء والاسترداد محددة"] : ["نوع الخدمة واسمها ووصفها مكتملة","الجهة المنفذة مسحوبة من ملف المنشأة","بيانات الترخيص مضافة","السعر وطريقته واضحان","سياسة الإلغاء والاسترداد محددة","الضمان المسترد محدد إن وجد"].map(x=><div key={x} className="rounded-2xl bg-[#F8F6EF] p-4 text-sm">✓ {x}</div>)}</div>
          <div className="rounded-2xl border border-[#0D3B34]/8 bg-white p-4 text-xs leading-6 text-[#0D3B34]/55">بعد الإرسال ستكون حالة الخدمة <b className="text-[#0D3B34]">تحت المراجعة</b>. لن تظهر للعملاء قبل اعتمادها.</div>
        </Card>}

        <div className="mt-6 flex items-center justify-between">
          <button disabled={step===1} onClick={()=>setStep(Math.max(1,step-1))} className="rounded-2xl border border-[#0D3B34]/10 bg-white px-5 py-3 text-sm font-bold disabled:opacity-30">السابق</button>
          {step<4?<button onClick={()=>setStep(step+1)} className="rounded-2xl bg-[#0D3B34] px-6 py-3 text-sm font-bold text-white">التالي</button>:<button className="rounded-2xl bg-[#D4AF37] px-6 py-3 text-sm font-bold text-[#0D3B34]">إرسال للمراجعة</button>}
        </div>
      </div>
      <style jsx global>{`.input{width:100%;border:1px solid rgba(13,59,52,.1);background:#fff;border-radius:16px;padding:13px 16px;font-size:14px;outline:none}.input:focus{border-color:rgba(185,145,36,.65)}`}</style>
    </main>
  );
}
function Card({eyebrow,title,note,children}:{eyebrow:string;title:string;note:string;children:React.ReactNode}){return <section className="rounded-[30px] border border-white bg-white/80 p-6 shadow-[0_18px_55px_rgba(13,59,52,.05)] md:p-8"><p className="text-[10px] font-bold tracking-[.18em] text-[#B99124]">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold">{title}</h2><p className="mt-2 text-sm text-[#0D3B34]/50">{note}</p><div className="mt-7 space-y-5">{children}</div></section>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block"><span className="mb-2 block text-xs font-bold">{label}</span>{children}</label>}
function Choice({active,onClick,title,text}:{active:boolean;onClick:()=>void;title:string;text:string}){return <button type="button" onClick={onClick} className={`rounded-[22px] border p-5 text-right transition ${active?"border-[#D4AF37] bg-[#FFF8E5]":"border-[#0D3B34]/8 bg-white"}`}><p className="text-sm font-bold">{active?"✓ ":""}{title}</p><p className="mt-2 text-xs leading-6 text-[#0D3B34]/50">{text}</p></button>}
function Metric({label,value}:{label:string;value:number}){return <div><p className="text-[10px] text-white/45">{label}</p><p className="mt-1 text-xl font-bold text-[#F1D263]">{value.toFixed(2)} <span className="text-[10px]">ر.س</span></p></div>}

function HotelInventory(){
  return <Card eyebrow="HOTEL INVENTORY" title="الإتاحة والأسعار" note="أدخل ما هو متاح للبيع خلال فترة محددة. يمكنك إضافة فترات ووحدات أخرى بعد اعتماد الفندق.">
    <div className="rounded-2xl bg-[#0D3B34] p-5 text-white"><p className="text-sm font-bold text-[#F1D263]">مثال سريع</p><p className="mt-2 text-xs leading-6 text-white/65">30 سريراً متاحاً من 10 إلى 15 أكتوبر بسعر 110 ر.س للسرير/الليلة. عند تأكيد الحجز تخصم الكمية تلقائياً من الإتاحة.</p></div>
    <div className="rounded-2xl border border-[#0D3B34]/8 bg-white p-5">
      <p className="text-sm font-bold">توزيع الغرف المتاحة للمجموعات</p>
      <p className="mt-1 text-xs leading-6 text-[#0D3B34]/45">أدخل الكمية المتاحة لكل نوع. الحجز الواحد يمكن أن يجمع أكثر من نوع غرفة.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Field label="ثنائية"><input type="number" min="0" className="input" placeholder="10"/></Field>
        <Field label="ثلاثية"><input type="number" min="0" className="input" placeholder="8"/></Field>
        <Field label="رباعية"><input type="number" min="0" className="input" placeholder="5"/></Field>
        <Field label="أسرّة منفردة"><input type="number" min="0" className="input" placeholder="30"/></Field>
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2"><Field label="نوع وحدة إضافية"><select className="input"><option>لا يوجد</option><option>غرفة مفردة</option><option>جناح</option><option>شقة</option><option>نوع آخر</option></select></Field><Field label="الكمية المتاحة للوحدة الإضافية"><input type="number" min="0" className="input" placeholder="0"/></Field></div>
    <div className="grid gap-4 md:grid-cols-2"><Field label="متاح من"><input type="date" className="input"/></Field><Field label="متاح إلى"><input type="date" className="input"/></Field></div>
    <div className="rounded-2xl bg-[#F8F6EF] p-5">
      <p className="text-sm font-bold">السعر الصافي المتفق عليه مع أريس (Net Rate)</p>
      <p className="mt-1 text-xs leading-6 text-[#0D3B34]/45">يمكن أن يختلف السعر حسب نوع الغرفة. سعر البيع للعميل تديره أريس وفق اتفاقية الفندق.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Field label="الثنائية / ليلة"><input type="number" min="0" className="input" placeholder="220"/></Field>
        <Field label="الثلاثية / ليلة"><input type="number" min="0" className="input" placeholder="260"/></Field>
        <Field label="الرباعية / ليلة"><input type="number" min="0" className="input" placeholder="300"/></Field>
        <Field label="السرير / ليلة"><input type="number" min="0" className="input" placeholder="110"/></Field>
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2"><Field label="الإشغال الأقصى"><input type="number" min="1" className="input" placeholder="عدد الأشخاص"/></Field><Field label="الوجبات"><select className="input"><option>بدون وجبات</option><option>إفطار</option><option>نصف إقامة</option><option>إقامة كاملة</option></select></Field></div>
    <Field label="سياسة الإلغاء والاسترداد"><textarea className="input min-h-24" placeholder="اكتب سياسة هذه الإتاحة بوضوح..."/></Field>
    <p className="text-xs leading-6 text-[#0D3B34]/45">عند حجز مجموعة، يمكن للحجز الواحد احتواء ثنائية + ثلاثية + رباعية معاً. النظام سيجمع الإشغال والسعر ويتحقق من توفر كل نوع طوال فترة الإقامة، ثم يخصم المخزون بعد تأكيد الحجز.</p>
  </Card>
}
