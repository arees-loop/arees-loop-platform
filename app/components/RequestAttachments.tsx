"use client";
import {useEffect,useState} from "react";
type Item={id:string;name:string;label?:string;purpose?:string;size?:number;createdAt:string};
type Draft={id:number;label:string;file:File|null;busy:boolean;message:string};
export default function RequestAttachments({reference}:{reference:string}){
 const [files,setFiles]=useState<Item[]>([]),[drafts,setDrafts]=useState<Draft[]>([{id:1,label:"",file:null,busy:false,message:""}]),[message,setMessage]=useState(""),[loading,setLoading]=useState(false);
 const load=async()=>{try{const r=await fetch("/api/customer/request-attachments?reference="+encodeURIComponent(reference),{cache:"no-store"});const d=await r.json();if(r.ok)setFiles(d.data||[]);else setMessage(d.message||"تعذر تحميل المرفقات");}catch{setMessage("تعذر الاتصال بخدمة المرفقات.")}};
 useEffect(()=>{setFiles([]);setDrafts([{id:1,label:"",file:null,busy:false,message:""}]);void load()},[reference]);
 const update=(id:number,patch:Partial<Draft>)=>setDrafts(v=>v.map(d=>d.id===id?{...d,...patch}:d));
 const add=()=>{if(files.length+drafts.length>=12){setMessage("الحد الأقصى 12 مرفقاً للطلب.");return}setDrafts(v=>[...v,{id:Math.max(...v.map(d=>d.id),0)+1,label:"",file:null,busy:false,message:""}]);setMessage("")};
 async function send(d:Draft){if(!d.file||!d.label.trim()||d.busy)return;update(d.id,{busy:true,message:""});try{const fd=new FormData();fd.set("reference",reference);fd.set("purpose","DOCUMENT");fd.set("label",d.label.trim());fd.set("file",d.file);const r=await fetch("/api/customer/request-attachments",{method:"POST",body:fd});const data=await r.json().catch(()=>({message:"تعذر قراءة استجابة الخادم."}));if(!r.ok){update(d.id,{message:data.message||"فشل رفع المرفق."});return}setDrafts(v=>v.filter(x=>x.id!==d.id));await load();setMessage("تم حفظ المرفق بنجاح.")}catch{update(d.id,{message:"تعذر الاتصال بالخادم. حاول مجدداً."})}finally{update(d.id,{busy:false})}}
 const documents=files.filter(f=>f.purpose!=="BANK_RECEIPT");
 return <section className="mt-4 rounded-xl border border-[#D4AF37]/40 bg-[#FFFAEF] p-4" dir="rtl">
  <h4 className="font-black">📎 مستندات الطلب</h4>
  <p className="mt-2 text-xs leading-6">الجوازات والمستندات الأخرى، بحد أقصى 12 مرفقاً للطلب. PDF أو JPG أو PNG أو WebP، حتى 5 ميجابايت لكل ملف. إثبات التحويل له خانة منفصلة في قسم السداد.</p>
  <p className="mt-2 text-xs font-bold">المرفقات المحفوظة: {files.length} من 12</p>
  {documents.map(f=><a key={f.id} className="mt-2 block rounded-lg border bg-white p-3 text-xs underline" href={"/api/customer/request-attachments?reference="+encodeURIComponent(reference)+"&file="+encodeURIComponent(f.id)}>{f.label||f.name} — {f.name} — عرض/تنزيل</a>)}
  {drafts.map((d,i)=><div key={d.id} className="mt-3 rounded-xl border border-[#D4AF37]/35 bg-white/70 p-3">
   <div className="flex items-center justify-between"><b className="text-sm">مرفق {documents.length+i+1}</b><button type="button" disabled={d.busy} onClick={()=>setDrafts(v=>v.filter(x=>x.id!==d.id))} className="text-xs text-red-700">إزالة الخانة</button></div>
   <label className="mt-3 block text-xs font-bold">اسم المرفق<input type="text" maxLength={100} value={d.label} onChange={e=>update(d.id,{label:e.target.value})} placeholder="مثلاً: جواز سفر الأب أو جواز الطفل" className="mt-2 w-full rounded-lg border border-[#D4AF37]/50 bg-white p-3"/></label>
   <label className="mt-3 flex min-h-16 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#B68D35] bg-white p-4 text-center text-sm font-bold hover:bg-[#FFF1C9] focus-within:ring-2 focus-within:ring-[#B68D35]">📎 {d.file?d.file.name:"اضغط هنا لاختيار صورة أو PDF"}<input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={e=>update(d.id,{file:e.target.files?.[0]||null})}/></label>
   <button type="button" disabled={!d.file||!d.label.trim()||d.busy||files.length>=12} onClick={()=>void send(d)} className="mt-3 rounded-lg bg-[#0D3B34] px-5 py-2 text-sm font-bold text-white disabled:opacity-40">{d.busy?"جارٍ الرفع...":"حفظ المرفق"}</button>
   {d.message&&<p role="status" className="mt-2 text-xs text-red-700">{d.message}</p>}
  </div>)}
  {files.length+drafts.length<12&&<button type="button" onClick={add} className="mt-4 w-full rounded-xl border-2 border-dashed border-[#B68D35] bg-white p-4 text-sm font-bold text-[#0D3B34] hover:bg-[#FFF1C9]">+ إضافة مرفق آخر</button>}
  {message&&<p role="status" className="mt-3 text-xs">{message}</p>}
 </section>;
}
