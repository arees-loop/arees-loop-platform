"use client";
import {useCallback,useEffect,useState} from "react";

type Event={action:string;createdAt:string;details?:{fileId?:string}};
type ReceiptPreview={url:string;type:string};
export default function AdminPaymentReview({reference,onReviewed}:{reference:string;onReviewed?:(status:string)=>void}){
 const [events,setEvents]=useState<Event[]>([]);
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const [notice,setNotice]=useState(""),[error,setError]=useState("");
 const [preview,setPreview]=useState<ReceiptPreview|null>(null);
 const load=useCallback(async()=>{
  try{
   const r=await fetch("/api/customer/request-payment?reference="+encodeURIComponent(reference),{cache:"no-store",credentials:"include"});
   const d=await r.json();
   if(!r.ok||!d.success)throw Error(d.message||"تعذر تحميل سجل السداد.");
   setEvents(d.events||[]);setError("");
  }catch(e){setError(e instanceof Error?e.message:"تعذر تحميل سجل السداد.");}
  finally{setLoading(false);}
 },[reference]);
 useEffect(()=>{setLoading(true);setNotice("");void load()},[load]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview.url)},[preview]);

 const accepted=events.some(e=>e.action==="CUSTOMER_OFFER_ACCEPTED");
 const last=events.find(e=>["CUSTOMER_TRANSFER_SUBMITTED","ADMIN_PAYMENT_VERIFIED","ADMIN_PAYMENT_REJECTED"].includes(e.action));
 const pending=last?.action==="CUSTOMER_TRANSFER_SUBMITTED";
 const fileId=last?.details?.fileId||events.find(e=>e.action==="CUSTOMER_TRANSFER_SUBMITTED")?.details?.fileId||"";
 async function openReceipt(mode:"preview"|"download"){
  if(!fileId){setError("الإيصال غير مرتبط بهذا الإشعار؛ راجع تفاصيل الطلب.");return;}
  if(busy)return;setBusy(true);setError("");
  try{
   const r=await fetch("/api/customer/request-attachments?reference="+encodeURIComponent(reference)+"&file="+encodeURIComponent(fileId),{cache:"no-store",credentials:"include"});
   if(!r.ok){const d=await r.json().catch(()=>({message:"تعذر تنزيل الإيصال من التخزين الخاص."}));throw Error(d.message||"تعذر قراءة الإيصال.");}
   const blob=await r.blob();
   if(!["application/pdf","image/png","image/jpeg","image/webp"].some(t=>blob.type.includes(t)))throw Error("نوع إيصال التحويل غير مدعوم للمعاينة.");
   const url=URL.createObjectURL(blob);
   if(mode==="preview"){setPreview({url,type:blob.type});}
   else{
    const ext=blob.type.includes("pdf")?"pdf":blob.type.includes("png")?"png":blob.type.includes("webp")?"webp":"jpg";
    const a=document.createElement("a");a.href=url;a.download="Arees-Receipt-"+reference+"."+ext;
    document.body.appendChild(a);a.click();a.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),30000);
   }
  }catch(e){setError(e instanceof Error?e.message:"تعذر فتح إيصال التحويل.");}
  finally{setBusy(false);}
 }
 async function decide(action:"VERIFY_TRANSFER"|"REJECT_TRANSFER"){
  if(action==="VERIFY_TRANSFER"&&!window.confirm("هل تأكدت فعلياً من وصول المبلغ إلى كشف الحساب البنكي الرسمي ومطابقته مع الطلب؟"))return;
  if(busy)return;setBusy(true);setError("");setNotice("");
  try{
   const r=await fetch("/api/customer/request-payment",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference,action,confirmed:action==="VERIFY_TRANSFER"})});
   const d=await r.json();
   if(!r.ok||!d.success)throw Error(d.message||"تعذر تحديث السداد.");
   setNotice(action==="VERIFY_TRANSFER"?"✓ تم اعتماد وصول السداد، ويمكن استكمال تنفيذ الطلب.":"تم رفض الإيصال؛ يستطيع العميل إرسال إشعار جديد.");
   onReviewed?.(action==="VERIFY_TRANSFER"?"PAID":"QUOTE_SENT");
   await load();
  }catch(e){setError(e instanceof Error?e.message:"تعذر تنفيذ الإجراء.");}
  finally{setBusy(false);}
 }
 return <section dir="rtl" className="mt-4 rounded-xl border border-[#D4AF37]/35 bg-[#FFFAEF] p-4">
  <h3 className="text-sm font-black">💳 إشعارات السداد والإيصالات</h3>
  {loading?<p className="mt-3 text-xs">جارٍ تحميل إشعارات السداد...</p>:<>
   <p className="mt-2 text-xs">قبول عرض السعر: <b>{accepted?"تم القبول":"بانتظار العميل"}</b></p>
   {pending&&<p className="mt-3 rounded-lg border border-[#E6D096] bg-[#FFF1CF] p-3 text-xs font-black text-[#80601E]">● إشعار سداد جديد بانتظار المطابقة البنكية. لا يُعد مبلغاً مدفوعاً بعد.</p>}
   {fileId&&<div className="mt-3 rounded-xl border border-[#D4AF37]/35 bg-white p-3">
    <p className="text-xs font-black">📎 إيصال التحويل المرفق بالطلب</p>
    <div className="mt-3 flex flex-wrap gap-2">
     <button type="button" disabled={busy} onClick={()=>void openReceipt("preview")} className="rounded-lg border border-[#C5A75B] px-4 py-2 text-xs font-black disabled:opacity-40">معاينة الإيصال</button>
     <button type="button" disabled={busy} onClick={()=>void openReceipt("download")} className="rounded-lg bg-[#0D3B34] px-4 py-2 text-xs font-black text-white disabled:opacity-40">تنزيل الإيصال PDF / صورة</button>
    </div>
    {preview&&<div className="mt-3">
     <button type="button" className="mb-2 text-xs underline" onClick={()=>setPreview(null)}>إغلاق المعاينة</button>
     {preview.type.includes("pdf")?<iframe src={preview.url} title="معاينة إيصال التحويل" className="h-[430px] w-full rounded-lg border bg-white"/>:
      // eslint-disable-next-line @next/next/no-img-element
      <img src={preview.url} alt="صورة إيصال التحويل" className="max-h-[480px] w-full rounded-lg border bg-white object-contain"/>}
    </div>}
   </div>}
   {pending&&<div className="mt-3 flex flex-wrap gap-2">
    <button type="button" disabled={busy||!fileId} onClick={()=>void decide("VERIFY_TRANSFER")} className="rounded-lg bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">تأكيد وصول المبلغ من البنك</button>
    <button type="button" disabled={busy} onClick={()=>void decide("REJECT_TRANSFER")} className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-700 disabled:opacity-40">رفض الإيصال</button>
   </div>}
   {last?.action==="ADMIN_PAYMENT_VERIFIED"&&<p className="mt-3 rounded-lg bg-[#E6F6EB] p-3 text-xs font-black text-green-800">✓ تم اعتماد وصول المبلغ بعد المراجعة البنكية.</p>}
   {last?.action==="ADMIN_PAYMENT_REJECTED"&&<p className="mt-3 rounded-lg bg-[#FCECE9] p-3 text-xs font-black text-red-800">تم رفض آخر إشعار؛ يمكن للعميل إرسال إيصال جديد.</p>}
  </>}
  {notice&&<p role="status" className="mt-3 rounded-lg bg-[#E7F6EC] p-3 text-xs font-bold text-[#17663F]">{notice}</p>}
  {error&&<p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-800">{error}</p>}
 </section>;
}
