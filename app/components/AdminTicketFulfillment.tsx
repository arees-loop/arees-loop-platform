"use client";
import {useCallback,useEffect,useState} from "react";

type Ticket={id:string;name:string;size:number|null;createdAt:string};
export default function AdminTicketFulfillment({reference,id,status,onStatusChange}:{
 reference:string;id:string;status:string;onStatusChange?:(status:string)=>void
}){
 const [tickets,setTickets]=useState<Ticket[]>([]);
 const [file,setFile]=useState<File|null>(null);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const [message,setMessage]=useState(""),[error,setError]=useState("");
 const [previewId,setPreviewId]=useState<string|null>(null);
 const list=useCallback(async()=>{
  try{
   const r=await fetch("/api/customer/ticket?reference="+encodeURIComponent(reference),{credentials:"include",cache:"no-store"});
   const d=await r.json();
   if(!r.ok||!d.success)throw Error(d.message||"تعذر تحميل التذاكر.");
   setTickets(d.tickets||[]);setError("");
  }catch(e){setError(e instanceof Error?e.message:"تعذر تحميل التذاكر.");}
  finally{setLoading(false);}
 },[reference]);
 useEffect(()=>{setLoading(true);setTickets([]);setFile(null);setPreviewId(null);void list()},[list]);

 async function upload(){
  if(!file||busy)return;
  setBusy(true);setError("");setMessage("");
  try{
   const fd=new FormData();fd.set("reference",reference);fd.set("file",file);
   const r=await fetch("/api/customer/ticket",{method:"POST",credentials:"include",body:fd});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر حفظ التذكرة.");
   setMessage(d.message||"تم تسليم التذكرة للعميل.");setFile(null);await list();
  }catch(e){setError(e instanceof Error?e.message:"تعذر رفع التذكرة.");}
  finally{setBusy(false);}
 }
 async function complete(){
  if(!tickets.length||!["PAID","EXECUTING"].includes(status)||busy)return;
  if(!window.confirm("هل أكدت وصول السداد للبنك، وتسليم تذكرة PDF صحيحة لهذا العميل؟ سيتم تحويل حالة الطلب إلى «تم التنفيذ» وإعلام العميل داخل طلباتي."))return;
  setBusy(true);setError("");setMessage("");
  try{
   const r=await fetch("/api/admin/transport",{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,action:"SET_STATUS",status:"DONE"})});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر إكمال الطلب.");
   setMessage("تم التنفيذ بنجاح. التذكرة متاحة للعميل من «طلباتي».");onStatusChange?.("DONE");
  }catch(e){setError(e instanceof Error?e.message:"تعذر إكمال الطلب.");}
  finally{setBusy(false);}
 }
 const base="/api/customer/ticket?reference="+encodeURIComponent(reference);
 return <section dir="rtl" className="mt-4 rounded-2xl border border-[#D4AF37]/35 bg-white p-4">
  <h3 className="text-sm font-black text-[#0D3B34]">🎫 تسليم التذكرة PDF وإكمال الطلب</h3>
  <p className="mt-2 text-xs leading-6 text-[#4D675E]">بعد التحقق من وصول الحوالة البنكية، ارفع ملف التذكرة ليظهر للعميل في «طلباتي». ثم اختر «تم التنفيذ». رفع الملف لا يرسل واتساب تلقائياً.</p>
  {loading?<p className="mt-3 text-xs">جارٍ تحميل التذاكر...</p>:tickets.length>0&&<div className="mt-3 space-y-2">{tickets.map(ticket=><div key={ticket.id} className="rounded-xl border border-[#C9E2D0] bg-[#F2FAF4] p-3">
   <p className="break-words text-xs font-black text-[#175D3D]">✓ تم إتاحة التذكرة: {ticket.name}</p>
   <div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={()=>setPreviewId(previewId===ticket.id?null:ticket.id)} className="rounded-lg border border-[#9FC5AE] bg-white px-3 py-2 text-xs font-bold">معاينة PDF</button><a href={base+"&file="+encodeURIComponent(ticket.id)} className="rounded-lg border border-[#9FC5AE] bg-white px-3 py-2 text-xs font-bold">تنزيل PDF</a></div>
   {previewId===ticket.id&&<iframe className="mt-3 h-[380px] w-full rounded-lg border bg-white" title={"معاينة التذكرة "+ticket.name} src={base+"&file="+encodeURIComponent(ticket.id)+"&mode=preview"}/>}
  </div>)}</div>}
  {["PAID","EXECUTING"].includes(status)&&<div className="mt-4 space-y-3">
    <label className="block text-xs font-black">ملف التذكرة PDF (حتى 10 ميجابايت)
      <input aria-label="اختيار تذكرة PDF" type="file" accept=".pdf,application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} className="mt-2 block w-full rounded-xl border border-[#D4AF37]/35 bg-[#FAF8F3] p-3 text-xs"/>
    </label>
    <button disabled={!file||busy} onClick={()=>void upload()} type="button" className="rounded-xl bg-[#0D3B34] px-5 py-3 text-xs font-bold text-white disabled:opacity-40">{busy?"جارٍ حفظ التذكرة...":"إرفاق التذكرة وتسليمها للعميل"}</button>
    <div className="rounded-xl border border-[#CDE0D1] bg-[#F4FAF5] p-3">
      <p className="text-xs text-[#18593C]">حالة التسليم: {tickets.length?"التذكرة محفوظة ومتاحة للعميل":"لم تُرفق التذكرة بعد"}</p>
      <button disabled={busy||tickets.length===0} onClick={()=>void complete()} type="button" className="mt-3 rounded-xl bg-[#137B4A] px-5 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40">✓ تم التنفيذ وإغلاق الطلب</button>
    </div>
   </div>}
  {status==="DONE"&&<p className="mt-3 rounded-xl bg-[#E9F8EE] p-3 text-xs font-bold text-[#165D3C]">تم تنفيذ الطلب. التذكرة متاحة لصاحب الطلب.</p>}
  {!["PAID","EXECUTING","DONE"].includes(status)&&<p className="mt-3 rounded-xl border border-[#EAD7AE] bg-[#FFF8EB] p-3 text-xs text-[#886625]">سيظهر رفع التذكرة بعد تأكيد الإدارة استلام السداد فعلياً من قسم «مراجعة السداد».</p>}
  {message&&<p role="status" className="mt-3 rounded-xl bg-[#E9F8EE] p-3 text-xs font-bold text-[#165D3C]">{message}</p>}
  {error&&<p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-800">{error}</p>}
 </section>;
}
