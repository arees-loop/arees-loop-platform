"use client";
import AuthenticatedRequestGate from "@/app/components/AuthenticatedRequestGate";
import {storeCustomerClaim} from "@/lib/customer-request-claims";
import Link from "next/link";
import {useState,type FormEvent} from "react";

type Slot="PASSPORT"|"LOCAL_LICENSE"|"PORTRAIT";
const requiredDocuments:{slot:Slot;title:string;hint:string}[]=[
 {slot:"PASSPORT",title:"صورة جواز السفر",hint:"صفحة بيانات الجواز كاملة وواضحة"},
 {slot:"LOCAL_LICENSE",title:"صورة رخصة القيادة المحلية السارية",hint:"الوجه الأمامي للرخصة أو المستند الذي يحتوي بياناتها"},
 {slot:"PORTRAIT",title:"صورة شخصية بخلفية بيضاء",hint:"صورة حديثة وواضحة بخلفية بيضاء"}
];
const field="w-full min-w-0 rounded-xl border border-[#D4AF37]/40 bg-[#FFFEFA] px-4 py-3 text-sm text-[#123D35] outline-[#AD8B3B] focus:ring-2 focus:ring-[#D4AF37]/35";
const label="flex min-w-0 flex-col gap-2 text-sm font-bold text-[#123D35]";
const codes=[["966","السعودية +966"],["249","السودان +249"],["20","مصر +20"],["971","الإمارات +971"],["974","قطر +974"],["965","الكويت +965"],["973","البحرين +973"],["968","عُمان +968"],["1","أمريكا/كندا +1"],["44","بريطانيا +44"],["other","دولة أخرى"]];
const today=new Date().toISOString().slice(0,10);
const fileAllowed=["image/jpeg","image/png","image/webp","application/pdf"];

export default function InternationalLicenseForm(){
 const [name,setName]=useState(""),[nationality,setNationality]=useState(""),[residence,setResidence]=useState(""),[destination,setDestination]=useState(""),[countryCode,setCountryCode]=useState("966"),[customCode,setCustomCode]=useState(""),[phone,setPhone]=useState(""),[email,setEmail]=useState("");
 const [travelDate,setTravelDate]=useState(""),[height,setHeight]=useState(""),[eyeColor,setEyeColor]=useState(""),[licenseValidUntil,setLicenseValidUntil]=useState(""),[deliveryAddress,setDeliveryAddress]=useState(""),[deliveryLink,setDeliveryLink]=useState(""),[notes,setNotes]=useState("");
 const [files,setFiles]=useState<Record<Slot,File|null>>({PASSPORT:null,LOCAL_LICENSE:null,PORTRAIT:null});
 const [uploaded,setUploaded]=useState<Slot[]>([]),[reference,setReference]=useState(""),[claimSaved,setClaimSaved]=useState(true);
 const [busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const pick=(slot:Slot,file:File|null)=>{if(reference)return;setFiles(old=>({...old,[slot]:file}));};
 const payloadNotes=()=>{
  const summary=[
   "طلب رخصة قيادة دولية — نموذج الرخصة المعتمد",
   "الجنسية: "+nationality.trim(),"بلد الإقامة: "+residence.trim(),
   "الدولة المقصودة: "+destination.trim(),
   "الطول: "+height.trim()+" سم","لون العين: "+eyeColor.trim(),
   "انتهاء الرخصة المحلية: "+licenseValidUntil,
   "عنوان التوصيل: "+deliveryAddress.trim(),
   "موقع التوصيل: "+deliveryLink.trim(),
   "مستندات مطلوبة: جواز سفر، رخصة محلية، صورة بخلفية بيضاء",
   ...(notes.trim()?["ملاحظات: "+notes.trim()]:[])
  ].join("\n");
  return summary;
 };
 async function send(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy||sent)return;
  setBusy(true);setError("");setNotice("");
  try{
   if(!/^https:\/\//i.test(deliveryLink.trim()))throw Error("أدخل رابط موقع التوصيل الصحيح من الخرائط.");
   for(const item of requiredDocuments){
    const f=files[item.slot];
    if(!f)throw Error("الرجاء إرفاق "+item.title);
    if(!fileAllowed.includes(f.type)||f.size===0||f.size>5*1024*1024)throw Error("ملف "+item.title+" يجب أن يكون PDF أو JPG أو PNG أو WebP وبحجم حتى 5 ميجابايت.");
   }
   const summary=payloadNotes();
   if(summary.length>1200)throw Error("الملاحظات طويلة؛ اختصرها ثم أعد الإرسال.");
   let ref=reference;
   if(!ref){
    const response=await fetch("/api/transport/requests",{
     method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},
     body:JSON.stringify({
      kind:"DRIVING_LICENSE",customerName:name.trim(),customerEmail:email.trim(),
      countryCode:countryCode==="other"?customCode:countryCode,
      phone:phone.replace(/[^0-9]/g,""),
      origin:residence.trim(),destination:destination.trim(),travelDate,
      tripType:"ONE_WAY",adults:1,children:0,infants:0,notes:summary
     })
    });
    const result=await response.json().catch(()=>null);
    if(response.status===401||result?.code==="AUTH_REQUIRED"){window.location.assign("/login?next="+encodeURIComponent("/international-driving-license"));return;}
    if(!response.ok||!result?.success||!result?.data?.reference)throw Error(result?.message||"لم يتم إنشاء الطلب. أعد المحاولة.");
    ref=result.data.reference;
    setReference(ref);
    setClaimSaved(storeCustomerClaim({reference:ref,token:result.data.trackingToken}));
   }
   const finished=new Set(uploaded);
   for(const doc of requiredDocuments){
    if(finished.has(doc.slot))continue;
    const file=files[doc.slot];
    if(!file)throw Error("الرجاء إعادة اختيار المستند الناقص: "+doc.title);
    const form=new FormData();
    form.set("reference",ref);form.set("purpose","DOCUMENT");form.set("label",doc.title);form.set("file",file);
    const response=await fetch("/api/customer/request-attachments",{method:"POST",credentials:"include",body:form});
    const result=await response.json().catch(()=>null);
    if(!response.ok||!result?.success)throw Error("تم إنشاء الطلب رقم "+ref+" لكن تعذر رفع "+doc.title+": "+(result?.message||"حاول مجدداً دون إنشاء طلب آخر."));
    finished.add(doc.slot);setUploaded([...finished]);
   }
   setSent(true);setNotice("تم إرسال طلب الرخصة وحفظ المستندات الثلاثة بأمان. حالة الطلب: جديد — تحت المراجعة.");
  }catch(e){setError(e instanceof Error?e.message:"تعذر استكمال الطلب، أعد المحاولة.");}
  finally{setBusy(false);}
 }
 return <main dir="rtl" className="min-h-screen bg-[#F7F4EC] px-4 pb-20 pt-28 text-[#123D35] md:px-8 md:pt-32">
  <div className="mx-auto max-w-7xl">
   <div className="overflow-hidden rounded-[24px]"><img src="/Image/hero/arees-driving-license-banner-v2.png" alt="إصدار رخصة القيادة الدولية" className="block h-auto w-full object-contain"/></div>
   <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(270px,.85fr)_minmax(0,1.4fr)]">
    <aside className="rounded-3xl border border-[#D4AF37]/45 bg-[#0D3B34] p-5 text-white shadow-lg lg:sticky lg:top-28">
      <p className="text-xs font-black text-[#E7C779]">خدمات أريس · إصدار بالطلب</p>
      <h1 className="mt-3 text-2xl font-black">رخصة القيادة الدولية</h1>
      <div className="mt-4 overflow-hidden rounded-2xl bg-[#F8F3E7]"><img src="/Image/social/arees-international-driving-license.webp" alt="رخصة القيادة الدولية" className="aspect-square w-full object-contain"/></div>
      <p className="mt-4 text-sm leading-8">أرسل بياناتك ومستنداتك المطلوبة عبر نموذج آمن. يراجع فريق أريس الطلب قبل التنفيذ والتواصل معك.</p>
      <p className="mt-3 text-lg font-black text-[#EFD69D]">199 ر.س <span className="text-xs font-normal">شامل التوصيل · سنة واحدة</span></p>
      <p className="mt-3 rounded-xl border border-white/20 bg-white/10 p-3 text-xs leading-7">المطلوب: جواز سفر ساري، رخصة قيادة محلية سارية، صورة بخلفية بيضاء، الطول ولون العين، وعنوان وموقع التوصيل. لا توجد خانة فئة الرخصة.</p>
      <a href="https://wa.me/966580091220?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%B7%D9%84%D8%A8%20%D8%B1%D8%AE%D8%B5%D8%A9%20%D9%82%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%AF%D9%88%D9%84%D9%8A%D8%A9" target="_blank" rel="noopener noreferrer" className="mt-5 block rounded-xl border border-[#D7B762] px-4 py-3 text-center text-sm font-bold">تواصل مع أريس عبر واتساب ↗</a>
    </aside>
    <section id="license-form" className="scroll-mt-28 rounded-3xl border border-[#D4AF37]/35 bg-white p-5 shadow-sm md:p-8">
      <h2 className="text-xl font-black">نموذج طلب الرخصة الدولية</h2>
      <p className="mt-2 text-sm text-[#61736C]">بيانات الطلب والمستندات المطلوبة — تُحفظ المرفقات في التخزين الخاص ويُعرض الطلب في «طلباتي».</p>
      {reference&&<p role="status" className="mt-4 rounded-xl border border-[#D4AF37]/45 bg-[#FFFAEE] p-3 text-sm"><b>رقم الطلب:</b> <span dir="ltr" className="font-mono">{reference}</span>{!claimSaved&&<span className="block text-xs">احتفظ بالرقم لمتابعة الطلب.</span>}</p>}
      {error&&<p role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-800">{error}</p>}
      {notice&&<p role="status" className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4 text-sm font-bold text-green-800">{notice}</p>}
      {sent?<div className="mt-6 rounded-2xl border border-[#B8D3BD] bg-[#F4FBF4] p-5">
        <p className="text-lg font-black">تم تسجيل الطلب والمرفقات بنجاح.</p>
        <p className="mt-2 text-sm">حالة طلبك الآن: جديد — قيد مراجعة الإدارة. لا يُعد هذا إصداراً للرخصة أو تأكيداً للدفع.</p>
        <Link href={"/my-requests?reference="+encodeURIComponent(reference)} className="mt-4 inline-flex rounded-xl bg-[#0D3B34] px-5 py-3 text-sm font-bold text-white">انتقل إلى طلباتي ←</Link>
      </div>:<AuthenticatedRequestGate><form onSubmit={send} className="mt-5 grid gap-4 sm:grid-cols-2">
       <label className={label}>الاسم الكامل<input required disabled={!!reference} minLength={2} maxLength={100} autoComplete="name" className={field} value={name} onChange={e=>setName(e.target.value)}/></label>
       <label className={label}>الجنسية<input required disabled={!!reference} maxLength={80} className={field} value={nationality} onChange={e=>setNationality(e.target.value)}/></label>
       <label className={label}>بلد الإقامة<input required disabled={!!reference} maxLength={100} className={field} value={residence} onChange={e=>setResidence(e.target.value)}/></label>
       <label className={label}>الدولة المراد استخدامها فيها<input required disabled={!!reference} maxLength={100} className={field} value={destination} onChange={e=>setDestination(e.target.value)}/></label>
       <label className={label}>تاريخ السفر المتوقع<input required disabled={!!reference} type="date" min={today} className={field} value={travelDate} onChange={e=>setTravelDate(e.target.value)}/></label>
       <label className={label}>انتهاء الرخصة المحلية<input required disabled={!!reference} type="date" min={today} className={field} value={licenseValidUntil} onChange={e=>setLicenseValidUntil(e.target.value)}/></label>
       <label className={label}>الطول (سم)<input required disabled={!!reference} maxLength={10} inputMode="numeric" className={field} value={height} onChange={e=>setHeight(e.target.value)} placeholder="مثلاً 175"/></label>
       <label className={label}>لون العين<input required disabled={!!reference} maxLength={40} className={field} value={eyeColor} onChange={e=>setEyeColor(e.target.value)} placeholder="مثلاً بني"/></label>
       <label className={label}>مفتاح الدولة<select disabled={!!reference} className={field} value={countryCode} onChange={e=>setCountryCode(e.target.value)}>{codes.map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
       {countryCode==="other"&&<label className={label}>مفتاح الاتصال<input disabled={!!reference} required inputMode="numeric" pattern="[0-9]{1,4}" className={field} value={customCode} onChange={e=>setCustomCode(e.target.value)}/></label>}
       <label className={label}>رقم الهاتف<input disabled={!!reference} required minLength={6} maxLength={15} inputMode="tel" pattern="[0-9]{6,15}" className={field} value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}/></label>
       <label className={label}>البريد الإلكتروني (اختياري)<input disabled={!!reference} type="email" maxLength={180} className={field} value={email} onChange={e=>setEmail(e.target.value)}/></label>
       <label className={label+" sm:col-span-2"}>عنوان التوصيل (المدينة والحي)<input disabled={!!reference} required maxLength={180} className={field} value={deliveryAddress} onChange={e=>setDeliveryAddress(e.target.value)}/></label>
       <label className={label+" sm:col-span-2"}>رابط موقع التوصيل من الخرائط<input disabled={!!reference} required type="url" placeholder="https://maps.google.com/..." className={field} value={deliveryLink} onChange={e=>setDeliveryLink(e.target.value)}/></label>
       <div className="sm:col-span-2 rounded-2xl border border-[#D4AF37]/35 bg-[#FAF8F2] p-4">
        <h3 className="text-sm font-black">المرفقات الإلزامية (3)</h3>
        <p className="mt-1 text-xs">المسموح PDF وJPG وPNG وWebP، بحد أقصى 5 ميجابايت لكل ملف. لا تشارك مستنداتك عبر رابط عام.</p>
        <div className="mt-4 grid gap-3">{requiredDocuments.map(doc=><label key={doc.slot} className="rounded-xl border border-[#E0D2B4] bg-white p-4 text-xs font-bold">
         <span className="block text-sm">{doc.title} {uploaded.includes(doc.slot)?"✓ تم الحفظ":""}</span>
         <span className="mb-2 block font-normal text-[#62746A]">{doc.hint}</span>
         <input disabled={!!reference} required={!reference} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" className="max-w-full text-xs" onChange={e=>pick(doc.slot,e.target.files?.[0]||null)}/>
        </label>)}</div>
       </div>
       <label className={label+" sm:col-span-2"}>ملاحظات إضافية (اختياري)<textarea disabled={!!reference} maxLength={300} rows={3} className={field} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
       <p className="sm:col-span-2 rounded-xl bg-[#F8F1E2] p-3 text-xs leading-6">عند إرسال الطلب تُحفظ المستندات في ملف الطلب ولا يتم إصدار الرخصة أو استيفاء رسوم تلقائياً. إضافة الرخصة للسلة غير مفعلة في هذا النموذج لحين اكتمال ربط الطلب بالمستندات والسداد.</p>
       <div className="sm:col-span-2 flex flex-wrap justify-center gap-3">
        <button type="submit" disabled={busy} className="min-w-[210px] rounded-xl bg-[#0D3B34] px-6 py-3 text-sm font-black text-white disabled:opacity-50">{busy?"جارٍ حفظ الطلب والمستندات...":reference?"إعادة محاولة رفع المستندات الناقصة":"إرسال طلب الرخصة والمستندات"}</button>
        <a href="https://wa.me/966580091220" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#B38A25] px-5 py-3 text-sm font-black">واتساب للاستفسارات</a>
       </div>
      </form></AuthenticatedRequestGate>}
    </section>
   </div>
  </div>
 </main>;
}
