"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
type Suggestion={id:string;title:string;message:string;href:string;createdAt:string};
export default function NotificationsPage(){
 const [items,setItems]=useState<Suggestion[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{fetch("/api/account/interest-suggestions",{cache:"no-store"}).then(async response=>{if(response.status===401){window.location.href="/login";return null;}const data=await response.json();if(!response.ok)throw new Error(data.message||"تعذر تحميل الإشعارات");return data;}).then(data=>{if(data)setItems(data.suggestions||[])}).catch(e=>setError(e instanceof Error?e.message:"تعذر تحميل الإشعارات")).finally(()=>setLoading(false))},[]);
 return <main dir="rtl" className="mx-auto min-h-screen max-w-4xl px-5 pb-20 pt-36 text-[#0D3B34]"><h1 className="text-3xl font-black">الإشعارات</h1><p className="mt-3 text-sm">تجارب جديدة مشابهة للخدمات التي أضفتها إلى اهتماماتك خلال آخر 30 يوماً.</p>{loading?<p className="mt-8">جاري تحميل الإشعارات...</p>:<section className="mt-8 space-y-3">{items.map(item=><Link key={item.id} href={item.href} className="block rounded-2xl border border-[#D4AF37]/20 bg-white p-5 transition hover:border-[#B99124]"><p className="font-bold">{item.title}</p><p className="mt-2 text-sm">{item.message}</p><time className="mt-3 block text-xs opacity-60">{new Date(item.createdAt).toLocaleDateString("ar-SA")}</time></Link>)}{!items.length&&<p className="rounded-2xl bg-white p-6">لا توجد تجارب جديدة مطابقة حالياً. احفظ التجارب التي تعجبك بالقلب لتظهر اقتراحات مشابهة هنا.</p>}</section>}{error&&<p role="alert" className="mt-4 text-red-700">{error}</p>}<Link href="/interests" className="mt-7 inline-block text-sm font-bold underline">عرض اهتماماتي</Link></main>;
}
