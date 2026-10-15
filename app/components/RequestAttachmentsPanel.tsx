"use client";
import {useCallback,useEffect,useRef,useState} from "react";

type Attachment={id:string;name:string;mimeType:string;sizeBytes:number;note:string|null;uploaderRole:string;createdAt:string;downloadUrl:string};
type ApiResponse={success:boolean;enabled?:boolean;data?:Attachment[];message?:string};
const allowed=new Set(["application/pdf","image/jpeg","image/png"]);
const maxBytes=4*1024*1024;
export default function RequestAttachmentsPanel({reference,staff=false,requestStatus}:{
  reference:string;staff?:boolean;requestStatus?:string
}){
 const [data,setData]=useState<Attachment[]>([]);
 const [enabled,setEnabled]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [note,setNote]=useState("");
 const [pending,setPending]=useState<File[]>([]);
 const [busy,setBusy]=useState(false);
 const input=useRef<HTMLInputElement>(null);
 const canUpload=!(["CLOSED","CANCELED"].includes(requestStatus||"")||(!staff&&requestStatus==="DONE"));
 const refresh=useCallback(async(signal?:AbortSignal)=>{
  if(!reference)return;
  const response=await fetch("/api/request-attachments?reference="+encodeURIComponent(reference),{cache:"no-store",signal});
  const body=await response.json() as ApiResponse;
  if(!response.ok||!body.success)throw Error(body.message||"تعذر تحميل المرفقات.");
  setEnabled(Boolean(body.enabled));setData(body.data||[]);
 },[reference]);
 useEffect(()=>{
  const controller=new AbortController();
  setLoading(true);setData([]);setPending([]);setError("");setMessage("");
  void refresh(controller.signal).catch(err=>{if(!controller.signal.aborted)setError(err instanceof Error?err.message:"تعذر تحميل المرفقات.")}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[refresh]);
 function addFiles(items:FileList|null){
  if(!items)return;
  const chosen=Array.from(items);
  if(chosen.some(f=>!allowed.has(f.type)||f.size<100||f.size>maxBytes)){setError("كل مرفق يجب أن يكون JPG أو PNG أو PDF، وبحجم لا يتجاوز 4 ميجابايت.");return;}
  setPending(current=>{
   if(current.length+chosen.length>10){setError("يمكن اختيار 10 ملفات في الدفعة الواحدة.");return current;}
   return [...current,...chosen];
  });
  if(input.current)input.current.value="";
  setError("");setMessage("");
 }
 async function upload(){
  if(!pending.length||busy||!enabled||!canUpload)return;
  setBusy(true);setError("");setMessage("");
  let completed=0;
  try{
   for(const file of pending){
    const form=new FormData();form.set("reference",reference);form.set("file",file);if(note.trim())form.set("note",note.trim().slice(0,500));
    const response=await fetch("/api/request-attachments",{method:"POST",body:form,credentials:"include"});
    const result=await response.json() as ApiResponse;
    if(!response.ok||!result.success)throw Error(result.message||"تعذر إرسال إحدى المرفقات.");
    completed+=1;
   }
   setPending([]);setNote("");setMessage(`تم إرسال ${completed} مرفق بنجاح. يمكن للطرف الآخر الاطلاع عليه داخل الطلب.`);
  }catch(err){
   setPending(old=>old.slice(completed));
   setError((err instanceof Error?err.message:"تعذر الرفع")+"؛ المرفقات المرسلة سابقاً محفوظة.");
  }finally{
   try{await refresh();}catch{}
   setBusy(false);
  }
 }
 return <section dir="rtl" className="mt-5 rounded-2xl border border-[#D4AF37]/35 bg-[#FFFCF4] p-4" aria-label="مرفقات الطلب">
  <h3 className="text-sm font-black text-[#0D3B34]">📎 المرفقات والمستندات</h3>
  <p className="mt-1 text-xs leading-6 text-[#0D3B34]/70">{staff
    ?"اطلب صور الجوازات في ردك على العميل، أو أرفق التذكرة أو تأكيد الحجز PDF مع تعليمات السفر."
    :"بعد طلب المستندات من أريس، يمكنك إضافة صور الجوازات أو المستندات واحدة تلو الأخرى، ثم إرسالها للمراجعة."}</p>
  {loading&&<p className="mt-3 text-xs">جارٍ تحميل مرفقات الطلب...</p>}
  {!loading&&!enabled&&!error&&<p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">رفع المستندات قيد التجهيز؛ لن نطلب منك إرسال ملفات حساسة قبل اختبار التخزين الآمن.</p>}
  {error&&<p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs leading-6 text-red-800">{error}</p>}
  {message&&<p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs leading-6 text-emerald-900">{message}</p>}
  {enabled&&<div className="mt-3 space-y-2">{data.length===0?<p className="text-xs text-[#0D3B34]/60">لم تُرفع مرفقات لهذا الطلب بعد.</p>:data.map(item=>
   <div key={item.id} className="rounded-xl border border-[#D4AF37]/20 bg-white p-3 text-xs">
    <div className="flex flex-wrap items-center justify-between gap-3">
     <div className="min-w-0"><b className="block break-all">{item.name}</b><span className="mt-1 block text-[#0D3B34]/60">{item.uploaderRole==="STAFF"?"أرسله فريق أريس":"أرسله العميل"} · {(item.sizeBytes/1024).toFixed(0)} ك.ب</span></div>
     <a href={item.downloadUrl} className="rounded-lg bg-[#0D3B34] px-3 py-2 font-bold text-white">تنزيل آمن</a>
    </div>
    {item.note&&<p className="mt-2 whitespace-pre-wrap leading-6">{item.note}</p>}
   </div>)}</div>}
  {enabled&&canUpload&&<div className="mt-4 grid gap-3">
    <input ref={input} type="file" multiple accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" className="sr-only" aria-label="إرفاق صور أو ملفات PDF" onChange={e=>addFiles(e.target.files)}/>
    <button type="button" disabled={busy} onClick={()=>input.current?.click()} className="w-fit rounded-xl border border-[#B58A2B] bg-white px-4 py-2.5 text-xs font-bold disabled:opacity-50">+ {pending.length?"إضافة مرفق آخر":"إضافة مرفق"}</button>
    {pending.length>0&&<div className="space-y-2">{pending.map((f,i)=><div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-[#F4F0E5] p-2 text-xs">
      <span className="min-w-0 break-all">{f.name}</span><button type="button" onClick={()=>setPending(x=>x.filter((_,n)=>n!==i))} disabled={busy} className="shrink-0 text-red-700">إزالة</button>
    </div>)}</div>}
    <label className="text-xs font-bold">رسالة مع المرفقات (اختيارية)
      <textarea className="mt-2 w-full rounded-xl border border-[#D4AF37]/40 bg-white p-3 text-xs" rows={2} maxLength={500} value={note} onChange={e=>setNote(e.target.value)} placeholder={staff?"مرفق تأكيد الحجز وموعد الحضور وتعليمات الرحلة.":"أرفقت صور الجوازات المطلوبة."}/>
    </label>
    <button type="button" disabled={busy||pending.length===0} onClick={()=>void upload()} className="rounded-xl bg-[#0D3B34] px-5 py-3 text-xs font-black text-white disabled:opacity-40">{busy?"جارٍ رفع المستندات...":"إرسال المرفقات للمراجعة"}</button>
    <p className="text-[11px] leading-6 text-[#0D3B34]/60">ملفات JPG/PNG/PDF حتى 4 ميجابايت لكل ملف. المرفقات خاصة بصاحب الطلب والإدارة المخولة فقط.</p>
   </div>}
 </section>;
}
