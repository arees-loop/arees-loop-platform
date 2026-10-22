"use client";
import {useEffect,useState} from "react";

type Customer={key:string;name:string;email:string;phone:string;archived?:boolean};
type Details={user:{firstName:string|null;lastName:string|null;status:string;phone:string|null};bookings:number;loyaltyPoints:number;partnerMemberships:number;history:Array<{id:string;action:string;createdAt:string}>};
export default function CustomerManagement({selected,onClose,onChanged}:{selected:Customer|null;onClose:()=>void;onChanged:()=>Promise<void>}){
 const [details,setDetails]=useState<Details|null>(null);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const id=selected?.key.startsWith("u:")?selected.key.slice(2):null;
 const load=async(customerId:string)=>{
  const r=await fetch("/api/admin/customer-reports/"+encodeURIComponent(customerId),{cache:"no-store"});
  const x=await r.json();if(!r.ok||!x.success)throw Error(x.message||"تعذر تحميل تفاصيل الحساب");setDetails(x);
 };
 useEffect(()=>{setDetails(null);setError("");if(id)load(id).catch(e=>setError(e.message));},[id]);
 if(!selected)return null;
 const action=async(a:"SUSPEND"|"RESTORE"|"ARCHIVE"|"UPDATE_NAME")=>{
  if(!id||!details||busy)return;
  const reason=window.prompt("سبب الإجراء (يُحفظ في سجل التدقيق):");
  if(!reason||reason.trim().length<5)return;
  const extra:{firstName?:string;lastName?:string}={};
  if(a==="UPDATE_NAME"){
   const firstName=window.prompt("الاسم الأول",details.user.firstName||"");if(firstName===null)return;
   const lastName=window.prompt("الاسم الأخير",details.user.lastName||"");if(lastName===null)return;
   extra.firstName=firstName;extra.lastName=lastName;
  }
  if(a==="ARCHIVE"&&!window.confirm("هل تريد حذف العميل إدارياً؟ سيتم أرشفة الحساب وتعطيل دخوله مع الاحتفاظ بسجلات الحجوزات والمحاسبة."))return;
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/admin/customer-reports/"+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:a,reason,...extra})});
   const x=await r.json();if(!r.ok||!x.success)throw Error(x.message||"تعذر تنفيذ الإجراء");
   await onChanged();
   if(a==="ARCHIVE"){onClose();return;}
   await load(id);
  }catch(e){setError(e instanceof Error?e.message:"تعذر تنفيذ الإجراء")}finally{setBusy(false)}
 };
 return <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" dir="rtl"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 text-[#0D3B34] shadow-2xl">
  <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-black">تفاصيل العميل وإدارة الحساب</h2><button type="button" onClick={onClose} className="rounded-xl border px-4 py-2">إغلاق</button></div>
  {error&&<p role="alert" className="my-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  <p className="mb-4 text-sm">{selected.name} — {selected.email}</p>
  {!details?<p className="text-sm">جاري تحميل تفاصيل الحساب...</p>:<><div className="space-y-2 rounded-xl border p-4 text-sm"><p>حالة الحساب: <b>{details.user.status}</b></p><p>الهاتف: {details.user.phone||"—"}</p><p>الحجوزات: {details.bookings}</p><p>النقاط: {details.loyaltyPoints}</p><p>العضويات المرتبطة: {details.partnerMemberships}</p></div>
   <div className="mt-4 flex flex-wrap gap-2">
    <button type="button" disabled={busy} onClick={()=>action("UPDATE_NAME")} className="rounded-xl border border-[#D4AF37]/40 px-3 py-2 text-xs font-bold disabled:opacity-30">تعديل الاسم</button>
    {!selected.archived&&details.user.status==="ACTIVE"&&<button type="button" disabled={busy} onClick={()=>action("SUSPEND")} className="rounded-xl border border-[#D4AF37]/40 px-3 py-2 text-xs font-bold disabled:opacity-30">حظر مؤقت</button>}
    {(selected.archived||details.user.status!=="ACTIVE")&&<button type="button" disabled={busy} onClick={()=>action("RESTORE")} className="rounded-xl border border-[#D4AF37]/40 px-3 py-2 text-xs font-bold disabled:opacity-30">إعادة التفعيل</button>}
    {!selected.archived&&<button type="button" disabled={busy} onClick={()=>action("ARCHIVE")} className="rounded-xl border border-red-300 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-30">حذف إداري</button>}
   </div>
   <p className="mt-3 text-xs text-black/60">الحذف الإداري يؤرشف الحساب ويوقف تسجيل الدخول، مع بقاء سجلات الحجوزات والعمليات المالية. يمكن استعادة الحساب من قائمة المؤرشف.</p>
   <h3 className="mt-5 font-bold">سجل الإجراءات</h3><div className="mt-2 space-y-2">{(details.history||[]).map(h=><p key={h.id} className="rounded-lg bg-[#F8F4E8] p-2 text-xs">{new Date(h.createdAt).toLocaleString("ar-SA")} — {h.action}</p>)}</div>
  </>}
 </div></div>;
}
