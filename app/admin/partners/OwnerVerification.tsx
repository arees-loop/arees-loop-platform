"use client";
import {useEffect,useState} from "react";

type Member={id:string;isActive:boolean;permissions:unknown;user:{firstName:string|null;lastName:string|null;email:string;emailVerifiedAt:string|null}};
const role=(permissions:unknown)=>permissions&&typeof permissions==="object"&&!Array.isArray(permissions)&&"role" in permissions?String((permissions as {role:unknown}).role):"LEGACY";
export default function OwnerVerification({partnerId}:{partnerId:string}){
 const [members,setMembers]=useState<Member[]>([]);
 const [selected,setSelected]=useState("");
 const [note,setNote]=useState("");
 const [verified,setVerified]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [done,setDone]=useState(false);
 useEffect(()=>{let active=true;fetch("/api/admin/partners",{cache:"no-store",credentials:"include"}).then(r=>r.json()).then(data=>{if(!active)return;const partner=(data.data||[]).find((p:{id:string})=>p.id===partnerId);setMembers(partner?.members||[]);}).catch(()=>{if(active)setError("تعذر تحميل أعضاء المنشأة.")});return()=>{active=false}},[partnerId,done]);
 const hasOwner=members.some(m=>role(m.permissions)==="OWNER");
 const submit=async()=>{
  setBusy(true);setError("");
  try{
   const response=await fetch("/api/admin/partners/verify-owner",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({partnerId,memberId:selected,evidenceNote:note,confirmOwnershipVerified:verified})});
   const data=await response.json();
   if(!response.ok||!data.success)throw new Error(data.message||data.result||"تعذر الاعتماد");
   setDone(true);setSelected("");setVerified(false);setNote("");
  }catch(e){setError(e instanceof Error?e.message:"تعذر الاعتماد");}
  finally{setBusy(false);}
 };
 return <section className="m-6 rounded-3xl border border-[#D4AF37]/30 bg-white p-5"><h3 className="text-lg font-bold">اعتماد مالك المنشأة</h3><p className="mt-2 text-xs leading-6 opacity-70">هذا الإجراء للمشرف الأعلى بعد التحقق المستقل من مستندات الملكية والتفويض، وليس بناءً على صفة مقدم الطلب وحدها.</p>
 {hasOwner?<p className="mt-4 text-sm">يوجد مالك معتمد بالفعل.</p>:<div className="mt-4 space-y-3">
 <select aria-label="عضو المنشأة المراد اعتماده" value={selected} onChange={e=>setSelected(e.target.value)} className="w-full rounded-xl border p-3"><option value="">اختر العضو بعد التحقق من ملكيته</option>{members.filter(m=>m.isActive&&role(m.permissions)==="LEGACY"&&Boolean(m.user.emailVerifiedAt)).map(m=><option key={m.id} value={m.id}>{[m.user.firstName,m.user.lastName].filter(Boolean).join(" ")||m.user.email} — {m.user.email}</option>)}</select>
 <textarea aria-label="مستندات ومبررات التحقق" value={note} onChange={e=>setNote(e.target.value)} placeholder="اذكر المستندات التي تمت مراجعتها وسبب إثبات الملكية (20 حرفاً على الأقل)" rows={3} className="w-full rounded-xl border p-3"/>
 <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)}/><span>أؤكد أنني تحققت من إثبات الملكية والتفويض بشكل مستقل.</span></label>
 <button type="button" onClick={submit} disabled={busy||!selected||note.trim().length<20||!verified} className="rounded-xl bg-[#0D3B34] px-5 py-3 text-sm text-white disabled:opacity-40">اعتماد المالك</button>
 </div>}
 {done&&<p role="status" className="mt-3 text-green-700">تم اعتماد المالك وتسجيل القرار.</p>}{error&&<p role="alert" className="mt-3 text-red-700">{error}</p>}
 </section>;
}
