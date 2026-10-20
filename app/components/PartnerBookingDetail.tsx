"use client";
import {useCallback,useEffect,useState} from "react";

export type PartnerBookingRow={
 id:string;source:"CART"|"BOOKING";reference:string;customerName:string;customerEmail:string|null;
 customerPhone:string|null;guests:number;totalAmount:number;status:string;createdAt:string;serviceDate:string|null;
 service:{nameAr:string};partner:{legalNameAr:string;tradeNameAr:string|null};
 items?:{title:string;quantity:number;unitPriceSar:number;partnerName:string}[];
 bankReference?:string;bankStatus?:string;bankVerified?:boolean;hasReceipt?:boolean;hasVoucher?:boolean;
 notes?:string;mixedWithLicense?:boolean;
};
const statusLabel:Record<string,string>={
 PENDING:"جديد / بانتظار الدفع",RECEIPT_REVIEW:"إيصال قيد المراجعة",
 RECEIPT_REJECTED:"إيصال مرفوض",PAID:"تم السداد",CONFIRMED:"مؤكد",
 IN_PROGRESS:"تحت التنفيذ",COMPLETED:"تم التنفيذ",CANCELLED:"ملغي",REFUNDED:"مسترد"
};
function cash(n:number){return Number(n).toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2})+" ر.س"}
export default function PartnerBookingDetail({row,onClose,onUpdated}:{
 row:PartnerBookingRow;onClose:()=>void;onUpdated:()=>Promise<void>}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [notes,setNotes]=useState(row.notes||"");
 const [customerName,setCustomerName]=useState(row.customerName);
 const [customerPhone,setCustomerPhone]=useState(row.customerPhone||"");
 const [file,setFile]=useState<File|null>(null);
 const [history,setHistory]=useState<{action:string;createdAt:string;status:string;notes:string}[]>([]);
 const refreshHistory=useCallback(async()=>{
  const url="/api/admin/partner-cart-workflow?reference="+encodeURIComponent(row.reference)+"&source="+row.source;
  try{const r=await fetch(url,{cache:"no-store",credentials:"include"});const d=await r.json();
   if(r.ok&&d.success)setHistory(d.history||[]);
  }catch{/* Display only verified history; unavailable history never changes a payment status. */}
 },[row.reference,row.source]);
 useEffect(()=>{void Promise.resolve().then(refreshHistory);},[refreshHistory]);
 async function update(action:"STATUS"|"NOTES"|"CUSTOMER",status?:string){
  if(busy)return;
  setBusy(true);setError("");setNotice("");
  try{
   const r=await fetch("/api/admin/partner-cart-workflow",{method:"PATCH",credentials:"include",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({
     reference:row.reference,source:row.source,action,status,notes,name:customerName,phone:customerPhone
    })});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر تعديل الطلب.");
   setNotice(d.message);await onUpdated();await refreshHistory();
  }catch(e){setError(e instanceof Error?e.message:"تعذر التعديل.");}finally{setBusy(false)}
 }
 async function receipt(decision:"VERIFY"|"REJECT"){
  if(!row.bankReference||busy)return;
  if(decision==="VERIFY"&&!window.confirm("هل تأكدت من وصول مبلغ التحويل في كشف البنك وليس فقط من صورة الإيصال؟"))return;
  setBusy(true);setError("");setNotice("");
  try{
   const r=await fetch("/api/admin/cart-bank-payments",{method:"POST",credentials:"include",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({reference:row.bankReference,decision})});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذرت مراجعة التحويل.");
   setNotice(d.message);await onUpdated();
  }catch(e){setError(e instanceof Error?e.message:"تعذرت مراجعة التحويل.");}finally{setBusy(false)}
 }
 async function uploadVoucher(){
  if(!file||!row.bankReference||busy)return;
  setBusy(true);setError("");setNotice("");
  try{
   const payload=new FormData();payload.set("reference",row.bankReference);payload.set("file",file);
   const r=await fetch("/api/cart/service-voucher",{method:"POST",body:payload,credentials:"include"});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر حفظ ملف الخدمة.");
   setNotice(d.message);setFile(null);await onUpdated();
  }catch(e){setError(e instanceof Error?e.message:"تعذر رفع الملف.");}finally{setBusy(false)}
 }
 const next=row.status==="PAID"||row.status==="CONFIRMED"?"IN_PROGRESS":row.status==="IN_PROGRESS"?"COMPLETED":null;
 return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-5" onClick={onClose}>
  <section role="dialog" aria-modal="true" aria-label={"تفاصيل الطلب "+row.reference} onClick={e=>e.stopPropagation()}
   dir="rtl" className="max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#FDFBF5] p-4 text-[#0D3B34] shadow-xl sm:p-6">
   <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D4AF37]/35 pb-4">
    <div><p className="text-[11px] font-bold text-[#AA812C]">{row.source==="CART"?"طلب تجربة عبر سلة الشركاء":"حجز تجربة مسجل"}</p>
     <h2 className="mt-1 text-xl font-black">{row.service.nameAr}</h2>
     <p dir="ltr" className="mt-2 break-all text-right font-mono text-xs">{row.reference}</p></div>
    <button type="button" onClick={onClose} className="rounded-xl border border-[#C5AA69] bg-white px-4 py-2 text-sm font-bold">إغلاق ×</button>
   </header>
   {error&&<p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
   {notice&&<p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
   <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 text-sm sm:grid-cols-2">
    <p>العميل: <b>{row.customerName}</b></p>
    <p>الهاتف: <b dir="ltr">{row.customerPhone||"غير مسجل"}</b></p>
    <p>البريد: <b>{row.customerEmail||"غير متوفر"}</b></p>
    <p>المبلغ الإجمالي: <b>{cash(row.totalAmount)}</b></p>
    <p>عدد الأشخاص / الخدمات: <b>{row.guests}</b></p>
    <p>تاريخ الطلب: <b>{new Date(row.createdAt).toLocaleString("ar-SA")}</b></p>
    <p>الشريك: <b>{row.partner.tradeNameAr||row.partner.legalNameAr}</b></p>
    <p>الحالة: <b>{statusLabel[row.status]||row.status}</b></p>
   </div>
   {row.source==="CART"&&<p className="mt-3 rounded-xl border border-[#DFC989] bg-[#FFF6D9] p-3 text-xs leading-7">
    طلب سلة محفوظ، وليس حجزاً مؤكداً تلقائياً. لا يُعتمد السداد إلا بعد التحقق من وصول المبلغ.
    {row.mixedWithLicense&&<strong className="block text-amber-900">تنبيه: هذه سلة مختلطة مع الرخصة الدولية؛ قيمتها تخص السلة كاملة، وتحتاج مراجعة مالية موحدة.</strong>}
   </p>}
   {!!row.items?.length&&<div className="mt-4 rounded-xl border border-[#E1D3B3] bg-white p-4">
    <h3 className="font-black">تفاصيل تجارب السلة</h3>
    <div className="mt-3 space-y-2">{row.items.map((x,i)=><div key={i} className="flex flex-wrap justify-between gap-2 border-b border-[#EFE6D1] pb-2 text-xs">
     <div><b>{x.title}</b><p className="mt-1 text-[#56716A]">{x.partnerName} — {x.quantity} × {cash(x.unitPriceSar)}</p></div>
     <span>{cash(x.quantity*x.unitPriceSar)}</span></div>)}</div>
   </div>}
   <div className="mt-4 rounded-xl border border-[#E1D3B3] bg-white p-4">
    <h3 className="font-black">مراحل الطلب</h3>
    <div className="mt-3 flex flex-wrap gap-2">{(["PENDING","PAID","IN_PROGRESS","COMPLETED"] as const).map(x=>
     <span key={x} className={"rounded-full border px-3 py-2 text-xs font-bold "+(row.status===x?"border-[#B89641] bg-[#FFF0C3]":"border-[#D8D8D0]")}>{statusLabel[x]}</span>)}</div>
    {next&&<button type="button" disabled={busy||!!row.mixedWithLicense&&row.source==="CART"} onClick={()=>void update("STATUS",next)}
      className="mt-4 rounded-xl bg-[#0D3B34] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">
      نقل الطلب إلى: {statusLabel[next]}
    </button>}
    {!next&&<p className="mt-3 text-xs text-[#647469]">{row.status==="PENDING"||row.status==="RECEIPT_REVIEW"?"بانتظار التحقق من السداد قبل التنفيذ.":"لا توجد مرحلة تنفيذ تالية متاحة حالياً."}</p>}
    <label className="mt-4 block text-xs font-bold">ملاحظات الإدارة (داخلية)
     <textarea rows={3} maxLength={2500} value={notes} onChange={e=>setNotes(e.target.value)}
      className="mt-2 w-full rounded-xl border border-[#D4AF37]/40 p-3 text-sm"/>
    </label>
    <button type="button" disabled={busy||notes===(row.notes||"")} onClick={()=>void update("NOTES")}
     className="mt-2 rounded-xl border border-[#D4AF37] px-4 py-2 text-xs font-bold disabled:opacity-40">حفظ الملاحظات</button>
    {(row.source==="CART"&&!row.bankVerified||row.source==="BOOKING"&&row.status==="PENDING")&&<div className="mt-4 grid gap-3 sm:grid-cols-2">
     <label className="text-xs font-bold">اسم العميل<input value={customerName} onChange={e=>setCustomerName(e.target.value)}
      className="mt-2 w-full rounded-lg border p-3 text-sm"/></label>
     <label className="text-xs font-bold">هاتف العميل<input value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)}
      className="mt-2 w-full rounded-lg border p-3 text-sm"/></label>
     <button type="button" disabled={busy} onClick={()=>void update("CUSTOMER")} className="rounded-xl border border-[#D4AF37] px-4 py-2 text-xs font-bold sm:col-span-2">حفظ تعديل بيانات التواصل</button>
    </div>}
   </div>
   {row.source==="CART"&&<div className="mt-4 rounded-xl border border-[#E1D3B3] bg-white p-4">
    <h3 className="font-black">التحويل البنكي ومستندات الخدمة</h3>
    <p className="mt-2 text-sm">حالة الحوالة: <b>{row.bankStatus==="CART_BANK_RECEIPT_SUBMITTED"?"الإيصال قيد المراجعة":row.bankStatus==="CART_BANK_VERIFIED"?"تم اعتماد التحويل":row.bankStatus==="CART_BANK_REJECTED"?"الإيصال مرفوض":"بانتظار الحوالة"}</b></p>
    <div className="mt-3 flex flex-wrap gap-2">
     {row.hasReceipt&&row.bankReference&&<>
      <a href={"/api/admin/cart-bank-payments?receipt=true&reference="+encodeURIComponent(row.bankReference)}
       className="rounded-xl border border-[#D4AF37] px-4 py-2 text-xs font-bold">تنزيل إيصال التحويل</a>
      {!row.mixedWithLicense&&<><button type="button" disabled={busy} onClick={()=>void receipt("VERIFY")}
       className="rounded-xl bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">اعتماد وصول المبلغ</button>
      <button type="button" disabled={busy} onClick={()=>void receipt("REJECT")}
       className="rounded-xl border border-red-300 px-4 py-2 text-xs font-bold text-red-800 disabled:opacity-40">رفض الإيصال</button></>}
     </>}
     {row.bankVerified&&row.bankReference&&<a href={"/cart/documents/invoice?reference="+encodeURIComponent(row.bankReference)}
      target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#D4AF37] px-4 py-2 text-xs font-bold">فاتورة السداد / Invoice</a>}
     {row.hasVoucher&&row.bankReference&&<a href={"/api/cart/service-voucher?download=true&reference="+encodeURIComponent(row.bankReference)}
       className="rounded-xl border border-[#D4AF37] px-4 py-2 text-xs font-bold">ملف الخدمة / الفاوتشر</a>}
    </div>
    {row.bankVerified&&!row.mixedWithLicense&&<div className="mt-4 rounded-xl bg-[#F7F3E7] p-4">
     <label className="text-xs font-bold">رفع ملف الخدمة أو الفاوتشر للعميل
      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e=>setFile(e.target.files?.[0]||null)}
       className="mt-2 block max-w-full text-xs"/></label>
     <button type="button" disabled={!file||busy} onClick={()=>void uploadVoucher()}
      className="mt-3 rounded-xl bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">رفع الملف وإتاحته للعميل</button>
    </div>}
   </div>}
   <section className="mt-4 rounded-xl border border-[#E1D3B3] bg-white p-4"><h3 className="font-black">سجل تعديلات الطلب</h3>
    {history.length===0?<p className="mt-2 text-xs text-[#647469]">لا توجد تعديلات إدارية مسجلة بعد.</p>:
     <div className="mt-3 space-y-2">{history.map((h,i)=><div key={i} className="rounded-lg bg-[#F6F5F0] p-3 text-xs">
      <b>{h.action==="STATUS_CHANGED"?"تغيير حالة التنفيذ":h.action==="NOTES_UPDATED"?"تعديل الملاحظات":"تعديل بيانات التواصل"}</b>
      {h.status&&<span className="mr-2">{statusLabel[h.status]||h.status}</span>}
      <span className="mr-2">{new Date(h.createdAt).toLocaleString("ar-SA")}</span>
     </div>)}</div>}
   </section>
  </section>
 </div>;
}
