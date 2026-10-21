"use client";
import {useEffect,useState} from "react";

type Customer={key:string;name:string;email:string;phone:string;archived?:boolean};
export default function CustomerManagement({selected,adding,onClose,onChanged}:{selected:Customer|null;adding:boolean;onClose:()=>void;onChanged:()=>Promise<void>}){
 const [details,setDetails]=useState<any>(null);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [form,setForm]=useState({firstName:"",lastName:"",email:"",phone:""});
 const id=selected?.key.startsWith("u:")?selected.key.slice(2):null;
 const load=async(customerId:string)=>{
  const r=await fetch("/api/admin/customer-reports/"+encodeURIComponent(customerId),{cache:"no-store"});
  const x=await r.json();if(!r.ok||!x.success)throw Error(x.message||"تعذر تحميل تفاصيل الحساب");setDetails(x);
 };
 useEffect(()=>{setDetails(null);setError("");if(id)load(id).catch(e=>setError(e.message));},[id]);
 if(!adding&&!selected)return null;
 const create=async()=>{
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/admin/customer-reports",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
   const x=await r.json();if(!r.ok||!x.success)throw Error(x.message||"تعذر إضافة العميل");
   await onChanged();setForm({firstName:"",lastName:"",email:"",phone:""});onClose();
  }catch(e){setError(e instanceof Error?e.message:"تعذر إضافة العميل")}finally{setBusy(false)}
 };
 const action=async(a:"SUSPEND"|"DISABLE"|"RESTORE"|"ARCHIVE"|"UPDATE_NAME")=>{
  if(!id||!details||busy)return;
  const reason=window.prompt("سبب الإجراء (يُحفظ في سجل التدقيق):");
  if(!reason||reason.trim().length<5)return;
  const extra:{firstName?:string;lastName?:string}={};
  if(a==="UPDATE_NAME"){
   const firstName=window.prompt("الاسم الأول",details.user.firstName||"");if(firstName===null)return;
   const lastName=window.prompt("الاسم الأخير",details.user.lastName||"");if(lastName===null)return;
   extra.firstName=firstName;extra.lastName=lastName;
  }
  if(a==="ARCHIVE"&&!window.confirm("هل تريد أرشفة هذا الحساب وتعطيل دخوله؟ لن تُحذف الحجوزات أو السجلات المالية."))return;
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/admin/customer-reports/"+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:a,reason,...extra})});
   const x=await r.json();if(!r.ok||!x.success)throw Error(x.message||"تعذر تنفيذ الإجراء");
   await onChanged();await load(id);
   if(a==="ARCHIVE")onClose();
  }catch(e){setError(e instanceof Error?e.message:"تعذر تنفيذ الإجراء")}finally{setBusy(false)}
 };
 return <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" dir="rtl"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 text-[#0D3B34] shadow-2xl">
 <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-black">{adding?"إضافة عميل يدوياً":"تفاصيل العميل وإدارة الحساب"}</h2><button type="button" onClick={onClose} className="rounded-xl border px-4 py-2">إغلاق</button></div>
 {error&&<p role="alert" className="my-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
 {adding?<><p className="mb-3 text-sm text-black/60">يُنشأ سجل غير مفعل. لا تُنشأ كلمة مرور معروفة، ولا تُرسل دعوة تلقائياً.</p><div className="grid gap-3">{(["firstName","lastName","email","phone"] as const).map((k)=><label key={k} className="text-sm font-bold">{{firstName:"الاسم الأول *",lastName:"الاسم الأخير",email:"البريد الإلكتروني *",phone:"الجوال"}[k]}<input type={k==="email"?"email":"text"} className="mt-1 w-full rounded-xl border p-3" value={form[k]} onChange={e=>setForm(o=>({...o,[k]:e.target.value}))}/></label>)}</div><button type="button" disabled={busy||!form.firstName.trim()||!form.email.trim()} onClick={create} className="mt-4 rounded-xl bg-[#0D3B34] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">حفظ العميل</button></>:null}
 {selected&&<><p className="mb-4 text-sm">{selected.name} — {selected.email}</p>{!details?<p className="text-sm">جاري تحميل تفاصيل الحساب...</p>:<><div className="space-y-2 rounded-xl border p-4 text-sm"><p>حالة الحساب: <b>{details.user.status}</b></p><p>الهاتف: {details.user.phone||"—"}</p><p>الحجوزات: {details.bookings}</p><p>النقاط: {details.loyaltyPoints}</p><p>العضويات المرتبطة: {details.partnerMemberships}</p></div><div className="mt-4 flex flex-wrap gap-2">{(["UPDATE_NAME","SUSPEND","DISABLE","RESTORE","ARCHIVE"] as const).map(a=><button type="button" disabled={busy||(a==="RESTORE"&&details.user.status==="ACTIVE"&&!selected.archived)} key={a} onClick={()=>action(a)} className="rounded-xl border border-[#D4AF37]/40 px-3 py-2 text-xs font-bold disabled:opacity-30">{{UPDATE_NAME:"تعديل الاسم",SUSPEND:"حظر",DISABLE:"تعطيل الحساب",RESTORE:"إعادة التفعيل",ARCHIVE:"أرشفة / حذف إداري"}[a]}</button>)}</div><p className="mt-3 text-xs text-black/60">الحذف الإداري هو أرشفة تعطّل تسجيل الدخول وتُبقي سجلات الحجوزات والمحاسبة.</p><h3 className="mt-5 font-bold">سجل الإجراءات</h3><div className="mt-2 space-y-2">{(details.history||[]).map((h:any)=><p key={h.id} className="rounded-lg bg-[#F8F4E8] p-2 text-xs">{new Date(h.createdAt).toLocaleString("ar-SA")} — {h.action}</p>)}</div></>}</>}
 </div></div>;
}
