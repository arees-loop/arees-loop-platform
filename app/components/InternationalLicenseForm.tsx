"use client";

import {useState,type FormEvent} from "react";
import {requireCustomerSession} from "@/lib/customer-auth-client";
import Link from "next/link";

const style="w-full rounded-xl border border-[#D7C18F]/55 bg-[#FCFBF6] px-4 py-3 text-sm text-[#0D3B34] outline-[#A8842A]";
const label="block space-y-2 text-sm font-bold text-[#0D3B34]";
const phoneCodes=[["966","السعودية +966"],["249","السودان +249"],["20","مصر +20"],["971","الإمارات +971"],["1","أمريكا / كندا +1"],["44","بريطانيا +44"],["other","دولة أخرى"]];
const COLORS=["أسود","بني","أزرق","أخضر","رمادي","عسلي"] as const;
type Slot="PASSPORT"|"LOCAL_LICENSE"|"PORTRAIT";
const documents:ReadonlyArray<{key:Slot;name:string;hint:string}>=[
 {key:"PASSPORT",name:"صورة جواز السفر",hint:"صورة واضحة لكامل صفحة البيانات؛ جواز ساري المفعول"},
 {key:"LOCAL_LICENSE",name:"صورة رخصة القيادة المحلية",hint:"رخصة بلد الأم سارية المفعول، والبيانات واضحة"},
 {key:"PORTRAIT",name:"صورة شخصية بخلفية بيضاء",hint:"صورة حديثة واضحة للوجه بخلفية بيضاء"},
];
function PhotoInput({name,hint,file,onPick,disabled}:{name:string;hint:string;file:File|null;onPick:(f:File|null)=>void;disabled:boolean}){
 return <label className="block space-y-2 rounded-2xl border border-[#D4AF37]/30 bg-white p-4 text-sm font-bold">
   <span>{name} <span className="text-red-700">*</span></span>
   <span className="block text-xs font-normal leading-6 text-[#0D3B34]/65">{hint}</span>
   <span className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-[#B8A275] bg-[#FCFBF7] p-5 text-center">
    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A47A23" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m5 17 5-5 3 3 3-3 3 4"/></svg>
    <span className="text-xs">{file?"✓ "+file.name:"اسحب الملف أو اضغط لاختيار صورة"}</span>
    <span className="text-[10px] font-normal">JPG أو PNG · حتى 4 ميجابايت</span>
   </span>
   <input className="sr-only" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" disabled={disabled} onChange={e=>{
    const selected=e.target.files?.[0]||null;
    if(selected&&(!["image/jpeg","image/png"].includes(selected.type)||selected.size>4*1024*1024)){onPick(null);window.alert("صورة JPG/PNG فقط، وبحد أقصى 4 ميجابايت.");return;}
    onPick(selected);e.currentTarget.value="";
   }}/>
 </label>;
}
export default function InternationalLicenseForm(){
 const [name,setName]=useState("");
 const [countryCode,setCountryCode]=useState("966");
 const [otherCode,setOtherCode]=useState("");
 const [phone,setPhone]=useState("");
 const [height,setHeight]=useState("");
 const [eyes,setEyes]=useState<string[]>([]);
 const [street,setStreet]=useState("");
 const [duration,setDuration]=useState("1");
 const [deliveryLocation,setDeliveryLocation]=useState("");
 const [files,setFiles]=useState<Record<Slot,File|null>>({PASSPORT:null,LOCAL_LICENSE:null,PORTRAIT:null});
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [quantity,setQuantity]=useState(1);
 const pick=(slot:Slot,file:File|null)=>setFiles(existing=>({...existing,[slot]:file}));
 const setEye=(eye:string)=>setEyes(current=>current.includes(eye)?current.filter(x=>x!==eye):[...current,eye]);
 async function addToCart(goToCart:boolean){
   if(busy)return;
   if(!(await requireCustomerSession("/international-driving-license")))return;
   setError("");setNotice("");
   if(!name.trim()||name.trim().length<2||!phone.trim()||!/^\d{6,15}$/.test(phone.trim())||
      !height.trim()||!/^\d{2,3}(\.\d{1,2})?$/.test(height.trim())||eyes.length===0||
      !street.trim()||duration!=="1"||!/^https:\/\//i.test(deliveryLocation.trim())||
      (countryCode==="other"&&!/^\d{1,4}$/.test(otherCode))||Object.values(files).some(f=>!f)){
     setError("أكمل جميع الحقول والصور الثلاث وموقع التوصيل الصحيح قبل الإضافة إلى السلة.");return;
   }
   if(quantity!==1){setError("كل طلب رخصة لشخص واحد. أضف طلباً مستقلاً لكل متقدم.");return;}
   setBusy(true);
   try{
    const own=await fetch("/api/auth/me",{cache:"no-store",credentials:"include"});
    const ownData=await own.json().catch(()=>null);
    const ownerId=ownData?.data?.user?.id;
    if(!own.ok||typeof ownerId!=="string"||!ownerId)throw Error("يرجى تسجيل الدخول مجدداً قبل حفظ مستندات الرخصة.");
    const ids:Partial<Record<Slot,string>>={};
    for(const item of documents){
      const file=files[item.key]!;
      const payload=new FormData();payload.append("slot",item.key);payload.append("file",file);
      const result=await fetch("/api/license-documents",{method:"POST",body:payload,credentials:"include"});
      const response=await result.json().catch(()=>null);
      if(!result.ok||!response?.success||typeof response.document?.id!=="string")
        throw Error(response?.message||"تعذر رفع المستندات عبر التخزين الخاص.");
      ids[item.key]=response.document.id;
    }
    const application={
      name:name.trim(),phone:phone.trim(),countryCode:countryCode==="other"?otherCode:countryCode,
      height:height.trim(),eyeColor:eyes.join("، "),deliveryAddress:street.trim(),
      deliveryLink:deliveryLocation.trim(),durationYears:"1",
      passportDocumentId:ids.PASSPORT!,localLicenseDocumentId:ids.LOCAL_LICENSE!,portraitDocumentId:ids.PORTRAIT!
    };
    const key="arees-loop-cart-v1",serviceId="international-driving-license-1";
    const raw=JSON.parse(localStorage.getItem(key)||"[]");
    const prior=Array.isArray(raw)?raw.filter((x:unknown)=>{
      return x!==null&&typeof x==="object"&&"serviceId" in x&&(x as {serviceId?:string}).serviceId!==serviceId;
    }):[];
    // ONLY metadata and opaque private document IDs are stored in the browser.
    localStorage.setItem(key,JSON.stringify([...prior,{
      serviceId,ownerId,quantity:1,itemType:"DRIVING_LICENSE",title:"رخصة القيادة الدولية",
      durationYears:1,unitPriceSar:199,imageUrl:"/Image/social/arees-international-driving-license.webp",application
    }]));
    window.dispatchEvent(new Event("arees-cart-updated"));
    setNotice("تم حفظ نموذج الرخصة والمستندات الخاصة في السلة؛ لم يتم الدفع أو تأكيد الإصدار.");
    if(goToCart)window.location.assign("/cart");
   }catch(err){setError(err instanceof Error?err.message:"تعذر حفظ طلب الرخصة. لم تتم إضافته للسلة.");}
   finally{setBusy(false);}
 }
 function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();void addToCart(true);}
 return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] px-4 pb-24 pt-32 text-[#0D3B34] md:px-8">
  <div className="mx-auto max-w-[1450px]">
   <div className="overflow-hidden rounded-[28px] bg-[#F7F5EF]"><img src="/Image/hero/arees-driving-license-banner.webp" alt="رخصة القيادة الدولية من أريس لوب" className="block h-auto w-full object-contain"/></div>
   <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(290px,.78fr)_minmax(0,1.22fr)]">
    <aside className="lg:sticky lg:top-28">
     <div className="rounded-[28px] bg-[#0D3B34] p-6 text-white">
      <h1 className="text-2xl font-black">إصدار رخصة القيادة الدولية</h1>
      <p className="mt-3 text-sm leading-7 text-white/80">سنة واحدة، شاملة التوصيل إلى الموقع المحدد. تعبئة النموذج لا تعني تأكيد الإصدار.</p>
      <p className="mt-6 text-3xl font-black text-[#E5C17B]">199 ر.س</p>
      <p className="mt-2 text-sm">شامل التوصيل · صلاحية سنة واحدة</p>
      <div className="mt-6 rounded-2xl bg-white/10 p-4">
       <h2 className="font-black text-[#E5C17B]">المتطلبات الأساسية</h2>
       <p className="mt-2 text-xs leading-7">جواز سفر ساري المفعول، رخصة قيادة محلية سارية، صورة شخصية حديثة بخلفية بيضاء، الطول ولون العين، وعنوان وموقع التوصيل.</p>
      </div>
       <button type="button" onClick={()=>void addToCart(false)} disabled={busy} className="mt-5 w-full rounded-xl bg-[#D5B15D] px-5 py-3 font-black text-[#0D3B34] disabled:opacity-50">أضف للسلة</button>
       <button type="button" onClick={()=>void addToCart(true)} disabled={busy} className="mt-3 w-full rounded-xl border border-white/60 px-5 py-3 font-black disabled:opacity-50">اشترِ الآن</button>
      <div className="mt-3 text-center text-xs text-white/70">احصل على 150 نقطة Loop بعد إكمال الخدمة وفق شروط البرنامج.</div>
      <Link href="/cart" className="mt-4 block text-center text-xs underline">عرض السلة</Link>
     </div>
    </aside>
    <section className="rounded-[28px] border border-[#D4AF37]/30 bg-white p-5 shadow-sm sm:p-8">
     <p className="text-xs font-black tracking-widest text-[#B08A35]">AREES LOOP · INTERNATIONAL DRIVING PERMIT</p>
     <h2 className="mt-3 text-2xl font-black">نموذج طلب الرخصة الدولية</h2>
     <p className="mt-2 text-sm leading-7 text-[#0D3B34]/70">يمكنك استعراض المتطلبات وتعبئة البيانات بحرية. يُطلب تسجيل الدخول فقط عند الضغط على «أضف للسلة» أو «اشترِ الآن».</p>
     {error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
     {notice&&<p role="status" className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
      <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
       <label className={label}>اسم مقدم الطلب *<input className={style} required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label>
       <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-3"><label className={label}>رقم الجوال *<input className={style} required inputMode="tel" pattern="[0-9]{6,15}" maxLength={15} value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9]/g,""))}/></label><label className={label}>مفتاح الدولة<select className={style} value={countryCode} onChange={e=>setCountryCode(e.target.value)}>{phoneCodes.map(([v,txt])=><option key={v} value={v}>{txt}</option>)}</select></label>{countryCode==="other"&&<input className={style} inputMode="numeric" value={otherCode} onChange={e=>setOtherCode(e.target.value.replace(/\D/g,""))} placeholder="المفتاح" maxLength={4}/>}</div>
       {documents.slice(0,2).map(item=><PhotoInput key={item.key} name={item.name} hint={item.hint} file={files[item.key]} onPick={f=>pick(item.key,f)} disabled={busy}/>)}
       <label className={label}>الطول التقريبي (سم) *<input required className={style} value={height} onChange={e=>setHeight(e.target.value.replace(/[^0-9.]/g,""))} placeholder="مثال 173"/></label>
       <fieldset className="rounded-2xl border border-[#D4AF37]/30 p-4"><legend className="px-2 text-sm font-black">لون العين *</legend><div className="grid grid-cols-3 gap-2">{COLORS.map(color=><label key={color} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={eyes.includes(color)} onChange={()=>setEye(color)}/>{color}</label>)}</div></fieldset>
       <div className="sm:col-span-2"><PhotoInput name={documents[2].name} hint={documents[2].hint} file={files.PORTRAIT} onPick={f=>pick("PORTRAIT",f)} disabled={busy}/></div>
       <label className={label+" sm:col-span-2"}>العنوان المطلوب للتوصيل على الرخصة *<input required className={style} maxLength={180} value={street} onChange={e=>setStreet(e.target.value)} placeholder="المدينة، الحي، الشارع، أقرب معلم"/></label>
       <label className={label}>صلاحية الرخصة المطلوبة *<select className={style} value={duration} onChange={e=>setDuration(e.target.value)}><option value="1">سنة واحدة</option></select></label>
       <label className={label}>موقع التوصيل (استلام) *<input required type="url" className={style} value={deliveryLocation} onChange={e=>setDeliveryLocation(e.target.value)} placeholder="رابط الموقع من خرائط Google"/></label>
       <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F7F3E8] p-4">
        <p className="text-sm font-black">السعر <span className="mr-2 text-[#977121]">199 ر.س</span></p>
        <label className="flex items-center gap-3 text-sm font-bold">الكمية
         <input type="number" min={1} max={1} readOnly value={quantity} onChange={e=>setQuantity(Number(e.target.value))} className="w-16 rounded-xl border border-[#D4AF37]/45 bg-white p-2 text-center"/>
        </label>
       </div>
       <p className="sm:col-span-2 text-xs leading-7 text-[#0D3B34]/65">لا تُحفظ صور الجواز والرخصة في سلة المتصفح. تُرفع إلى تخزين خاص بعد التحقق من تسجيل الدخول، ولا يبدأ السداد إلا بعد استكمال جميع البيانات والمرفقات.</p>
       <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
        <button disabled={busy} type="button" onClick={()=>void addToCart(false)} className="rounded-xl bg-[#0D3B34] px-5 py-3.5 text-sm font-black text-white disabled:opacity-50">{busy?"جارٍ رفع المستندات...":"أضف للسلة"}</button>
        <button disabled={busy} type="submit" className="rounded-xl border border-[#B99C59] px-5 py-3.5 text-sm font-black disabled:opacity-50">اشترِ الآن</button>
       </div>
      </form>
    </section>
   </div>
  </div>
 </main>;
}
