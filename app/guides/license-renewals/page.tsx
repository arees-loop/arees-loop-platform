"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
type Application={id:string;fullName:string;licenseNumber:string;licenseExpiresAt:string;status:string};
type Renewal={id:string;applicationId:string;licenseNumber:string;requestedExpiryDate:string;status:string;reviewNotes:string|null};
export default function GuideLicenseRenewalPage(){
 const [applications,setApplications]=useState<Application[]>([]);
 const [renewals,setRenewals]=useState<Renewal[]>([]);
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const [selected,setSelected]=useState("");
 async function load(){
  const [a,b]=await Promise.all([fetch("/api/guides/my-applications",{cache:"no-store"}),fetch("/api/guides/license-renewals",{cache:"no-store"})]);
  const [aa,bb]=await Promise.all([a.json(),b.json()]);
  if(a.ok)setApplications((aa.applications||[]).filter((x:Application)=>x.status==="APPROVED"));
  if(b.ok)setRenewals(bb.renewals||[]);
 }
 useEffect(()=>{void load().catch(()=>setMessage("تعذر تحميل البيانات"))},[]);
 return <main dir="rtl" className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-36 text-[#0D3B34]"><h1 className="text-3xl font-black">تجديد ترخيص المرشد السياحي</h1><p className="mt-3 text-sm">أرفق الترخيص المجدد، ولن يتم تحديث تاريخ الصلاحية إلا بعد فحص الإدارة واعتمادها.</p><form className="mt-6 grid gap-4 rounded-2xl border bg-white p-6" onSubmit={async e=>{e.preventDefault();setBusy(true);try{const r=await fetch("/api/guides/license-renewals",{method:"POST",body:new FormData(e.currentTarget)});const d=await r.json();setMessage((d.message||"تعذر إرسال الطلب")+(r.ok&&!d.adminEmailSent?" — تم حفظ الطلب لكن تعذر إرسال بريد الإدارة.":""));if(r.ok)await load()}catch{setMessage("تعذر الاتصال بالخادم")}finally{setBusy(false)}}}><label className="grid gap-2">ملف المرشد المعتمد<select name="applicationId" required className="rounded-lg border p-3" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">اختر ملف المرشد</option>{applications.map(a=><option key={a.id} value={a.id}>{a.fullName} — {a.licenseNumber}</option>)}</select></label><label className="grid gap-2">رقم الترخيص المجدد<input name="licenseNumber" required minLength={3} maxLength={100} className="rounded-lg border p-3" defaultValue={applications.find(a=>a.id===selected)?.licenseNumber||""} key={selected}/></label><label className="grid gap-2">تاريخ انتهاء الترخيص الجديد<input type="date" name="expiryDate" required className="rounded-lg border p-3"/></label><label className="grid gap-2">مستند الترخيص المجدد (PDF أو صورة حتى 5 ميجابايت)<input type="file" name="document" accept=".pdf,image/jpeg,image/png,image/webp" required className="rounded-lg border p-3"/></label><button disabled={busy||!applications.length} className="rounded-lg bg-[#0D3B34] px-5 py-3 font-bold text-white disabled:opacity-50">{busy?"جاري الإرسال":"إرسال التجديد للمراجعة"}</button></form>{!applications.length&&<p className="mt-4 text-sm">لا يوجد ملف مرشد معتمد متاح للتجديد.</p>}{message&&<p role="status" className="mt-4 rounded-lg border p-3">{message}</p>}<h2 className="mt-10 text-xl font-black">طلبات التجديد</h2>{renewals.map(x=><article key={x.id} className="mt-3 rounded-xl border bg-white p-4"><b>{x.status==="UNDER_REVIEW"?"تحت المراجعة":x.status==="APPROVED"?"معتمد":x.status==="REJECTED"?"مرفوض":x.status}</b><p className="mt-2 text-sm">رقم الترخيص: {x.licenseNumber} — الانتهاء المطلوب: {new Date(x.requestedExpiryDate).toLocaleDateString("ar-SA")}</p>{x.reviewNotes&&<p className="mt-2 text-sm">ملاحظات الإدارة: {x.reviewNotes}</p>}</article>)}<div className="mt-6 flex gap-4 text-sm"><Link href="/guides/applications" className="underline">متابعة طلبات المرشد</Link><Link href="/guides/license-alerts" className="underline">تنبيهات الترخيص</Link></div></main>;
}
