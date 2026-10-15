"use client";
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";
import {useRouter} from "next/navigation";
type Notice={id:string;type:string;title:string;body:string;href:string;readAt:string|null;createdAt:string};
export default function NotificationsPage(){
 const router=useRouter();
 const [items,setItems]=useState<Notice[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [unread,setUnread]=useState(0);
 const load=useCallback(async()=>{
  try{
   const response=await fetch("/api/notifications/inbox",{cache:"no-store",credentials:"include"});
   if(response.status===401)throw new Error("يرجى تسجيل الدخول أولاً للاطلاع على إشعاراتك.");
   const data=await response.json();
   if(!response.ok||!data.success)throw new Error(data.message||"تعذر تحميل الإشعارات.");
   setItems(data.data||[]);setUnread(Number(data.unread||0));setError("");
  }catch(e){setError(e instanceof Error?e.message:"تعذر تحميل الإشعارات.");}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{void load();const id=window.setInterval(()=>{void load()},30000);return()=>window.clearInterval(id)},[load]);
 async function openNotice(notice:Notice){
  try{
   await fetch("/api/notifications/inbox",{method:"PATCH",credentials:"include",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({id:notice.id})});
   setItems(existing=>existing.map(item=>item.id===notice.id?{...item,readAt:item.readAt||new Date().toISOString()}:item));
   setUnread(current=>Math.max(0,current-(notice.readAt?0:1)));
  }catch{}
  if(notice.href.startsWith("/")&&!notice.href.startsWith("//"))router.push(notice.href);
 }
 return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] px-5 pb-24 pt-32 text-[#0D3B34]">
  <div className="mx-auto max-w-4xl">
   <p className="text-xs font-black tracking-widest text-[#A87917]">AREES LOOP · NOTIFICATIONS</p>
   <div className="mt-2 flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black md:text-4xl">مركز الإشعارات</h1><span className="rounded-full bg-[#EDE3C6] px-4 py-2 text-xs font-bold">{unread} غير مقروء</span></div>
   <p className="mt-3 text-sm leading-7 text-[#0D3B34]/70">تحديثات طلباتك وردود فريق أريس لوب. اضغط على الإشعار لفتح الطلب المرتبط به مباشرة.</p>
   {loading&&<p className="mt-8 rounded-2xl bg-white p-6">جارٍ تحميل الإشعارات...</p>}
   {!loading&&error&&<div role="alert" className="mt-8 rounded-2xl border border-amber-200 bg-white p-6"><p className="text-sm">{error}</p><Link href="/login" className="mt-3 inline-block text-sm font-bold underline">تسجيل الدخول</Link></div>}
   {!loading&&!error&&items.length===0&&<div className="mt-8 rounded-2xl bg-white p-8 text-center"><p>ليس لديك إشعارات محفوظة حتى الآن.</p><Link href="/my-requests" className="mt-4 inline-flex rounded-xl bg-[#0D3B34] px-5 py-3 text-white">عرض طلباتي</Link></div>}
   {!loading&&!error&&items.length>0&&<section className="mt-8 space-y-3" aria-label="قائمة الإشعارات">
    {items.map(item=><button type="button" key={item.id} onClick={()=>void openNotice(item)} className={`block w-full rounded-2xl border p-5 text-right shadow-sm transition hover:border-[#B58C31] hover:shadow-md ${item.readAt?"border-[#D4AF37]/20 bg-white":"border-[#D4AF37]/60 bg-[#FFFAEA]"}`}>
      <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-black">{item.title}</h2>{!item.readAt&&<span className="shrink-0 rounded-full bg-[#0D3B34] px-3 py-1 text-[10px] font-bold text-white">جديد</span>}</div>
      <p className="mt-2 text-xs leading-7 text-[#0D3B34]/75">{item.body}</p>
      <p className="mt-3 text-xs text-[#0D3B34]/50">{new Intl.DateTimeFormat("ar-SA",{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.createdAt))}</p>
    </button>)}
   </section>}
  </div>
 </main>;
}
