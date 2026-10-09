"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
type Application={id:string;fullName:string;city:string;countries:string[];licenseCategory:string;status:string;reviewNotes:string|null;createdAt:string;reviewedAt:string|null};
const statusNames:Record<string,string>={UNDER_REVIEW:"تحت المراجعة",APPROVED:"معتمد",REJECTED:"مرفوض",NEEDS_COMPLETION:"بانتظار استكمال البيانات"};
export default function GuideApplicationsPage(){
 const [items,setItems]=useState<Application[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{
  let active=true;
  fetch("/api/guides/my-applications",{cache:"no-store"})
   .then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.message||"تعذر تحميل الطلبات");return data})
   .then(data=>{if(active)setItems(data.applications||[])})
   .catch(e=>{if(active)setError(e instanceof Error?e.message:"تعذر تحميل الطلبات")})
   .finally(()=>{if(active)setLoading(false)});
  return ()=>{active=false};
 },[]);
 return <main dir="rtl" className="min-h-screen bg-[#F8F5ED] px-5 pb-24 pt-36 text-[#0D3B34]"><section className="mx-auto max-w-4xl"><h1 className="text-3xl font-black">متابعة طلبات المرشد السياحي</h1><p className="mt-3 text-sm leading-7 opacity-75">اطلع على حالة كل طلب وقرار الإدارة وملاحظات الاستكمال. لا تظهر بيانات المرشد في الدليل قبل الاعتماد.</p><Link href="/guides/register" className="mt-5 inline-block rounded-xl bg-[#0D3B34] px-5 py-3 text-sm font-bold text-white">تقديم طلب جديد</Link>{loading&&<p className="mt-8">جاري تحميل الطلبات...</p>}{error&&<p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}<div className="mt-8 space-y-4">{items.map(item=><article key={item.id} className="rounded-2xl border border-[#D4AF37]/30 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-black">{item.fullName}</h2><span className="rounded-full bg-[#F4EDDC] px-4 py-2 text-xs font-bold">{statusNames[item.status]||item.status}</span></div><p className="mt-3 text-sm">{item.licenseCategory} · {item.city} · {item.countries.join("، ")}</p><p className="mt-2 text-xs opacity-60">تاريخ التقديم: {new Date(item.createdAt).toLocaleDateString("ar-SA")}</p>{item.reviewNotes&&<div className="mt-4 rounded-xl bg-[#F8F5ED] p-4"><p className="text-sm font-bold">ملاحظات الإدارة</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7">{item.reviewNotes}</p></div>}{item.status==="NEEDS_COMPLETION"&&<p className="mt-4 text-sm font-semibold text-amber-800">طلبت الإدارة استكمال البيانات. يجري تجهيز نموذج تحديث الطلب الحالي دون تقديم طلب مكرر.</p>}</article>)}{!loading&&!error&&items.length===0&&<div className="rounded-2xl bg-white p-8 text-center text-sm">ليس لديك طلبات مسجلة حتى الآن.</div>}</div></section></main>;
}
