"use client";

import Link from "next/link";
import { BadgeCheck, FilePenLine, FileClock, UsersRound } from "lucide-react";

const requests=[
 {name:"شركة اريس الحلول المتكاملة",activity:"السفر والسياحة",date:"2026/10/01",status:"مطلوب استكمال",tone:"amber"},
 {name:"التجربة الثرية",activity:"الأنشطة السياحية",date:"2026/09/28",status:"قيد المراجعة",tone:"blue"},
 {name:"جولات المدينة",activity:"الإرشاد السياحي",date:"2026/09/25",status:"معتمد",tone:"green"},
 {name:"سفر الخليج",activity:"النقل السياحي",date:"2026/09/20",status:"مرفوض",tone:"red"},
 {name:"فعاليات طيبة",activity:"الفعاليات والأنشطة",date:"2026/09/18",status:"قيد المراجعة",tone:"blue"},
];
const tone:any={amber:"bg-[#FFF2D5] text-[#B67C00]",blue:"bg-[#E5F3FF] text-[#1880D0]",green:"bg-[#E2F4E9] text-[#287B50]",red:"bg-[#FFE8E8] text-[#E44C4C]"};

export default function AdminDashboardPage(){
 return <main dir="rtl" className="min-h-screen bg-[#FBF8F1] px-6 py-10 text-[#171717] md:px-10 xl:px-12">
  <div className="mx-auto max-w-[1500px]">
   <section className="flex flex-col-reverse gap-5 md:flex-row md:items-start md:justify-between">
    <div className="text-left md:text-right">
      <p className="text-sm font-bold">الخميس، 2 أكتوبر 2026</p>
      <p className="mt-2 text-xs text-[#171717]/55"><span className="text-[#D39B16]">✣</span> يوم جديد من الفرص</p>
    </div>
    <div>
      <h1 className="text-3xl font-bold md:text-4xl">مرحباً بك، Arees Admin</h1>
      <p className="mt-2 text-sm text-[#171717]/50">إدارة ومتابعة شركاء المنصة والتجارب والخدمات.</p>
    </div>
   </section>

   <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <Stat label="الشركاء المعتمدون" value="8" icon={<BadgeCheck size={30} strokeWidth={1.8}/>}/>
    <Stat label="مطلوب استكمال" value="1" icon={<FilePenLine size={30} strokeWidth={1.8}/>} emphasis/>
    <Stat label="طلبات قيد المراجعة" value="3" icon={<FileClock size={30} strokeWidth={1.8}/>}/>
    <Stat label="إجمالي الشركاء" value="12" icon={<UsersRound size={30} strokeWidth={1.8}/>}/>
   </section>

   <section className="mt-6 grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
    <div className="rounded-[20px] border border-[#D8CDB8]/55 bg-[#FFFDF8] p-5 shadow-[0_10px_28px_rgba(90,70,35,.06)]">
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold">⚓ أحدث طلبات الشركاء</h2><Link href="/admin/partners" className="rounded-full bg-[#FFF4D9] px-4 py-2 text-xs font-bold text-[#B47D08]">عرض جميع الطلبات ←</Link></div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-right text-xs">
       <thead><tr className="border-b border-[#171717]/8 text-[#171717]/45"><th className="pb-3">#</th><th className="pb-3">اسم الشريك</th><th className="pb-3">النشاط</th><th className="pb-3">الحالة</th><th className="pb-3">تاريخ الطلب</th><th className="pb-3">إجراءات</th></tr></thead>
       <tbody>{requests.map((r,i)=><tr key={r.name} className="border-b border-[#E9E1D3]/70 last:border-0"><td className="py-4 font-bold">{i+1}</td><td className="py-4 font-bold">{r.name}</td><td className="py-4 text-[#171717]/60">{r.activity}</td><td className="py-4"><span className={`rounded-full px-3 py-1.5 font-bold ${tone[r.tone]}`}>{r.status}</span></td><td className="py-4">{r.date}</td><td className="py-4"><Link href="/admin/partners" className="rounded-lg border border-[#171717]/10 px-3 py-1.5">•••</Link></td></tr>)}</tbody>
      </table></div>
    </div>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
      <div className="rounded-[20px] border border-[#171717]/8 bg-white/75 p-5 shadow-sm">
       <div className="flex items-center justify-between"><h2 className="text-lg font-bold">📊 إحصاءات سريعة</h2><span className="rounded-lg border border-[#171717]/10 px-3 py-2 text-xs">آخر 30 يوم⌄</span></div>
       <div className="mt-6 h-52 rounded-xl bg-[linear-gradient(to_top,rgba(210,158,32,.13),transparent),repeating-linear-gradient(to_right,transparent,transparent_19%,rgba(0,0,0,.04)_20%)] p-4">
        <div className="flex h-full items-end gap-2">{[18,25,35,58,55,70,55,65,78,56,72,86,98].map((h,i)=><div key={i} className="flex-1 rounded-t bg-[#D39B16]" style={{height:`${h}%`}}/>)}</div>
       </div>
      </div>
      <div className="rounded-[20px] border border-[#171717]/8 bg-white/75 p-5 shadow-sm">
       <h2 className="text-lg font-bold">◔ حالة الطلبات</h2>
       <div className="mt-5 flex items-center gap-8">
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full" style={{background:"conic-gradient(#2f8b62 0 57%, #e9ad22 57% 64%, #2f8dd8 64% 86%, #ef5555 86% 100%)"}}><div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white"><b className="text-2xl">14</b><span className="text-[10px]">إجمالي الطلبات</span></div></div>
        <div className="space-y-2 text-xs"><p>🔵 قيد المراجعة &nbsp; <b>3</b></p><p>🟡 مطلوب استكمال &nbsp; <b>1</b></p><p>🟢 معتمد &nbsp; <b>8</b></p><p>🔴 مرفوض &nbsp; <b>2</b></p></div>
       </div>
      </div>
    </div>
   </section>

   <section className="relative mt-6 min-h-[112px] overflow-hidden rounded-[20px] border border-[#D7B75D]/25 bg-gradient-to-l from-[#FFF9EA] via-[#FFFDF8] to-[#F3E4C8] px-8 py-7 shadow-[0_10px_28px_rgba(90,70,35,.06)]">
    <img src="/Logo/arees-loop-logo.png" alt="Arees Loop" className="absolute left-8 top-1/2 h-20 w-auto -translate-y-1/2 object-contain" />
    <div className="text-center"><h2 className="text-2xl font-bold md:text-3xl">نبني معاً تجارب سياحية استثنائية</h2><p className="mt-2 text-sm text-[#171717]/55">دعم شركائنا هو أساس نجاح المنصة.</p></div>
   </section>
  </div>
 </main>
}
function Stat({label,value,icon,emphasis=false}:{label:string;value:string;icon:React.ReactNode;emphasis?:boolean}){return <div className={`flex items-center justify-between rounded-[22px] border border-white/55 bg-white/35 p-5 shadow-[0_10px_30px_rgba(110,85,35,.08),inset_0_1px_0_rgba(255,255,255,.75)] backdrop-blur-xl ${emphasis?"ring-1 ring-[#D7B75D]/25":""}`}><div><p className="text-sm font-semibold text-[#555]">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FBF5E6] text-[32px] font-bold text-[#D39B16]">{icon}</div></div>}
