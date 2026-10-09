"use client";
import {useCallback,useEffect,useState} from "react";

type Event = {id:string;entityId:string|null;userId:string|null;createdAt:string;beforeData:unknown;afterData:unknown};
const roleName=(value:unknown)=>({OWNER:"مالك",MANAGER:"مدير",EMPLOYEE:"موظف",LEGACY:"غير مصنف"} as Record<string,string>)[String(value)]||"غير مصنف";
const extractRole=(value:unknown):unknown=>value&&typeof value==="object"&&!Array.isArray(value)?"role" in value?(value as {role:unknown}).role:undefined:undefined;

export default function TeamRoleHistory({members,refreshKey}:{members:Array<{id:string;user?:{firstName?:string|null;lastName?:string|null}}>;refreshKey:number}) {
 const [events,setEvents]=useState<Event[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  try{
   const response=await fetch("/api/partner/team/history",{credentials:"include",cache:"no-store"});
   const data=await response.json();
   if(!response.ok||!data.success)throw new Error(data.message||"تعذر تحميل السجل");
   setEvents(Array.isArray(data.events)?data.events:[]);
  }catch(e){setError(e instanceof Error?e.message:"تعذر تحميل السجل");}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{void load()},[load,refreshKey]);
 const names=new Map(members.map(m=>[m.id,[m.user?.firstName,m.user?.lastName].filter(Boolean).join(" ")||"موظف"]));
 return <section className="mt-8 rounded-3xl bg-white p-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">سجل تغيير أدوار الموظفين</h2><button type="button" onClick={()=>void load()} disabled={loading} className="rounded-xl border border-[#0D3B34]/20 px-4 py-2 text-sm">تحديث السجل</button></div>
  {loading?<p className="mt-5 text-sm">جاري تحميل السجل...</p>:error?<p role="alert" className="mt-5 text-sm text-red-700">{error}</p>:events.length===0?<p className="mt-5 text-sm opacity-60">لا توجد تغييرات مسجلة حتى الآن.</p>:
  <div className="mt-5 overflow-x-auto"><table className="w-full text-right text-sm"><thead><tr className="border-b"><th className="p-3">الموظف</th><th className="p-3">الدور السابق</th><th className="p-3">الدور الجديد</th><th className="p-3">منفذ التعديل</th><th className="p-3">التاريخ</th></tr></thead><tbody>{events.map(e=><tr key={e.id} className="border-b border-black/5"><td className="p-3">{names.get(e.entityId||"")||"عضو سابق"}</td><td className="p-3">{roleName(extractRole(e.beforeData))}</td><td className="p-3">{roleName(extractRole(e.afterData))}</td><td className="p-3">{e.userId||"—"}</td><td className="p-3">{new Date(e.createdAt).toLocaleString("ar-SA")}</td></tr>)}</tbody></table></div>}
 </section>;
}
