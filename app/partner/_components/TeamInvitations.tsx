"use client";
import {useCallback,useEffect,useState} from "react";

type Invitation={id:string;email:string;role:string;jobTitle:string|null;createdAt:string;expiresAt:string;acceptedAt:string|null;revokedAt:string|null};
export default function TeamInvitations({owner}:{owner:boolean}){
 const [items,setItems]=useState<Invitation[]>([]);
 const [email,setEmail]=useState("");
 const [role,setRole]=useState<"MANAGER"|"EMPLOYEE">("EMPLOYEE");
 const [jobTitle,setJobTitle]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const load=useCallback(async()=>{
  try{const response=await fetch("/api/partner/team/invitations",{credentials:"include",cache:"no-store"});const data=await response.json();if(!response.ok)throw new Error(data.message);setItems(data.invitations||[]);}
  catch(e){setMessage(e instanceof Error?e.message:"تعذر تحميل الدعوات");}
 },[]);
 useEffect(()=>{
  const controller=new AbortController();
  fetch("/api/partner/team/invitations",{credentials:"include",cache:"no-store",signal:controller.signal})
   .then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.message);return data;})
   .then(data=>setItems(data.invitations||[])).catch(e=>{if(!controller.signal.aborted)setMessage(e instanceof Error?e.message:"تعذر تحميل الدعوات")});
  return ()=>controller.abort();
 },[]);
 const invite=async(e:React.FormEvent)=>{
  e.preventDefault();setBusy(true);setMessage("");
  try{
   const response=await fetch("/api/partner/team/invitations",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,role,jobTitle})});
   const data=await response.json();setMessage(data.message||"تعذر إرسال الدعوة");
   if(response.ok){setEmail("");setJobTitle("");await load();}
  }catch{setMessage("تعذر الاتصال بالخادم");}finally{setBusy(false);}
 };
 const revoke=async(id:string)=>{
  if(!window.confirm("هل تريد إلغاء هذه الدعوة؟"))return;
  setBusy(true);setMessage("");
  try{
   const response=await fetch("/api/partner/team/invitations/revoke",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({invitationId:id})});
   const data=await response.json();setMessage(data.message||"تعذر الإلغاء");if(response.ok)await load();
  }catch{setMessage("تعذر الاتصال بالخادم");}finally{setBusy(false);}
 };
 return <section className="mt-8 rounded-3xl bg-white p-5"><h2 className="text-lg font-bold">دعوات الموظفين</h2>
  <form onSubmit={invite} className="mt-4 flex flex-wrap gap-3">
   <input required type="email" dir="ltr" aria-label="بريد الموظف" placeholder="بريد الموظف الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)} className="min-w-52 flex-1 rounded-xl border p-3"/>
   <input aria-label="المسمى الوظيفي" placeholder="المسمى الوظيفي (اختياري)" value={jobTitle} onChange={e=>setJobTitle(e.target.value)} className="rounded-xl border p-3"/>
   <select aria-label="دور الموظف" value={role} onChange={e=>setRole(e.target.value as "MANAGER"|"EMPLOYEE")} className="rounded-xl border p-3"><option value="EMPLOYEE">موظف</option>{owner&&<option value="MANAGER">مدير</option>}</select>
   <button disabled={busy} className="rounded-xl bg-[#0D3B34] px-5 py-3 text-white disabled:opacity-50">إرسال الدعوة</button>
  </form>
  {message&&<p role="status" className="mt-3 text-sm">{message}</p>}
  <div className="mt-5 overflow-x-auto"><table className="w-full text-right text-sm"><thead><tr className="border-b"><th className="p-3">البريد</th><th className="p-3">الدور</th><th className="p-3">الحالة</th><th className="p-3">الإجراء</th></tr></thead><tbody>{items.map(item=>{const pending=!item.acceptedAt&&!item.revokedAt&&new Date(item.expiresAt)>new Date();return <tr key={item.id} className="border-b border-black/5"><td className="p-3">{item.email}</td><td className="p-3">{item.role==="MANAGER"?"مدير":"موظف"}</td><td className="p-3">{item.acceptedAt?"مقبولة":item.revokedAt?"ملغاة":pending?"بانتظار القبول":"منتهية"}</td><td className="p-3">{pending?<button type="button" disabled={busy} onClick={()=>void revoke(item.id)} className="text-red-700 disabled:opacity-50">إلغاء الدعوة</button>:"—"}</td></tr>})}</tbody></table>{items.length===0&&<p className="p-4 text-sm opacity-60">لا توجد دعوات حتى الآن.</p>}</div>
 </section>;
}
