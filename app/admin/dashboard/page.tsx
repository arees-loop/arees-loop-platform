"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Partner={id:string;legalNameAr?:string|null;tradeNameAr?:string|null;partnerType?:string|null;submittedAt?:string|null;status?:string|null};
type Service={id:string;nameAr?:string|null;status?:string|null};

const label=(s?:string|null)=>({ACTIVE:"معتمد ونشط",UNDER_REVIEW:"تحت التدقيق",SUBMITTED:"تم استلام الطلب",NEEDS_COMPLETION:"مطلوب استكمال",NEEDS_INFO:"مطلوب استكمال",REJECTED:"مرفوض"}[s||""]||s||"غير محدد");
const tone=(s?:string|null)=>s==="ACTIVE"?"bg-[#E2F4E9] text-[#287B50]":s==="REJECTED"?"bg-[#FFE8E8] text-[#E44C4C]":s==="NEEDS_COMPLETION"||s==="NEEDS_INFO"?"bg-[#FFF2D5] text-[#B67C00]":"bg-[#E5F3FF] text-[#1880D0]";

export default function AdminDashboardPage(){
 const [partners,setPartners]=useState<Partner[]>([]),[services,setServices]=useState<Service[]>([]),[loading,setLoading]=useState(true);
 useEffect(()=>{Promise.all([
  fetch("/api/admin/partners",{cache:"no-store",credentials:"include"}).then(r=>r.json()),
  fetch("/api/admin/services",{cache:"no-store",credentials:"include"}).then(r=>r.json())
 ]).then(([p,s])=>{if(p?.success)setPartners(p.data||[]);if(s?.success)setServices(s.data||[])}).finally(()=>setLoading(false))},[]);
 const stats=useMemo(()=>({total:partners.length,active:partners.filter(x=>x.status==="ACTIVE").length,review:partners.filter(x=>x.status==="UNDER_REVIEW"||x.status==="SUBMITTED").length,needs:partners.filter(x=>x.status==="NEEDS_COMPLETION"||x.status==="NEEDS_INFO").length}),[partners]);
 const recent=[...partners].sort((a,b)=>new Date(b.submittedAt||0).getTime()-new Date(a.submittedAt||0).getTime()).slice(0,5);
 return <main dir="rtl" className="min-h-screen bg-[#FBF8F1] px-6 py-10 text-[#171717] md:px-10 xl:px-12"><div className="mx-auto max-w-[1500px]">
  <section><h1 className="text-3xl font-bold md:text-4xl">لوحة إدارة Arees Loop</h1><p className="mt-2 text-sm text-[#171717]/50">بيانات تشغيلية مباشرة من قاعدة بيانات المنصة — بدون بيانات تجريبية.</p></section>
  {loading?<div className="mt-8 rounded-3xl bg-white p-8 text-center">جارٍ تحميل البيانات...</div>:<>
   <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="الشركاء المعتمدون" value={stats.active}/><Stat label="مطلوب استكمال" value={stats.needs}/><Stat label="طلبات قيد المراجعة" value={stats.review}/><Stat label="إجمالي الشركاء" value={stats.total}/></section>
   <section className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
    <div className="rounded-[20px] border border-[#D8CDB8]/55 bg-[#FFFDF8] p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">أحدث طلبات الشركاء</h2><Link href="/admin/partners" className="rounded-full bg-[#FFF4D9] px-4 py-2 text-xs font-bold text-[#B47D08]">عرض جميع الطلبات ←</Link></div>
     {recent.length===0?<p className="py-10 text-center text-sm text-[#171717]/45">لا توجد طلبات شركاء حالياً.</p>:<div className="mt-5 overflow-x-auto"><table className="w-full min-w-[650px] text-right text-xs"><thead><tr className="border-b border-black/10 text-black/45"><th className="pb-3">الشريك</th><th className="pb-3">النشاط</th><th className="pb-3">الحالة</th><th className="pb-3">تاريخ الطلب</th></tr></thead><tbody>{recent.map(p=><tr key={p.id} className="border-b border-black/5"><td className="py-4 font-bold">{p.tradeNameAr||p.legalNameAr||"غير مدخل"}</td><td>{p.partnerType||"غير مدخل"}</td><td><span className={`rounded-full px-3 py-1.5 font-bold ${tone(p.status)}`}>{label(p.status)}</span></td><td>{p.submittedAt?new Date(p.submittedAt).toLocaleDateString("ar-SA"):"غير مدخل"}</td></tr>)}</tbody></table></div>}
    </div>
    <div className="grid gap-5"><div className="rounded-[20px] border border-black/8 bg-white/75 p-5 shadow-sm"><h2 className="text-lg font-bold">الخدمات الحقيقية</h2><p className="mt-5 text-4xl font-bold">{services.length}</p><div className="mt-4 space-y-2 text-xs"><p>منشورة: <b>{services.filter(s=>s.status==="PUBLISHED").length}</b></p><p>تحت المراجعة: <b>{services.filter(s=>s.status==="UNDER_REVIEW").length}</b></p></div><Link href="/admin/services" className="mt-5 inline-block rounded-full bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white">إدارة الخدمات</Link></div></div>
   </section>
  </>}</div></main>
}
function Stat({label,value}:{label:string;value:number}){return <div className="rounded-[22px] border border-white/55 bg-white/55 p-5 shadow-sm"><p className="text-sm font-semibold text-[#555]">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>}
