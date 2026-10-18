"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminIcon, {type AdminIconName} from "../AdminIcon";

type Partner={id:string;legalNameAr?:string|null;tradeNameAr?:string|null;partnerType?:string|null;submittedAt?:string|null;status?:string|null};
type Service={id:string;nameAr?:string|null;status?:string|null};
type RequestAlerts={ferries:number|null;flights:number|null;hotels:number|null;drivingLicenses:number|null;visas:number|null};
type DashboardMetrics={bookings:number;settlements:number;directRequests:number;bookingStatuses:{status:string;count:number}[];settlementTotals:{grossSales:number;platformCommission:number;netAmount:number}};
type QuickLink={key:keyof RequestAlerts;label:string;icon:AdminIconName;href:string;bg:string;iconColor:string};
const shortcuts:QuickLink[]=[
 {key:"ferries",label:"طلبات البواخر",icon:"ship",href:"/admin/transport/ferries?view=requests",bg:"bg-[#E8F3FF]",iconColor:"text-[#2365A5]"},
 {key:"flights",label:"طلبات الطيران",icon:"plane",href:"/admin/transport/flights?view=requests",bg:"bg-[#EDF0FF]",iconColor:"text-[#4759B1]"},
 {key:"hotels",label:"طلبات الفنادق",icon:"hotel",href:"/admin/hotels?view=requests",bg:"bg-[#F5EDFF]",iconColor:"text-[#7955A3]"},
 {key:"visas",label:"طلبات التأشيرات",icon:"globe",href:"/admin/transport/visas?view=requests",bg:"bg-[#FFF3E5]",iconColor:"text-[#B97922]"},
 {key:"drivingLicenses",label:"الرخص الدولية",icon:"car",href:"/admin/transport/driving-licenses?view=requests",bg:"bg-[#E8F7EE]",iconColor:"text-[#1E8053]"},
];

const label=(s?:string|null)=>({ACTIVE:"معتمد ونشط",UNDER_REVIEW:"تحت التدقيق",SUBMITTED:"تم استلام الطلب",NEEDS_COMPLETION:"مطلوب استكمال",NEEDS_INFO:"مطلوب استكمال",REJECTED:"مرفوض"}[s||""]||s||"غير محدد");
const tone=(s?:string|null)=>s==="ACTIVE"?"bg-[#E2F4E9] text-[#287B50]":s==="REJECTED"?"bg-[#FFE8E8] text-[#E44C4C]":s==="NEEDS_COMPLETION"||s==="NEEDS_INFO"?"bg-[#FFF2D5] text-[#B67C00]":"bg-[#E5F3FF] text-[#1880D0]";

export default function AdminDashboardPage(){
 const [partners,setPartners]=useState<Partner[]>([]),[services,setServices]=useState<Service[]>([]),[loading,setLoading]=useState(true);
 const [customerCount,setCustomerCount]=useState<number|null>(null);
 const [metrics,setMetrics]=useState<DashboardMetrics|null>(null),[metricsError,setMetricsError]=useState("");
 const [period,setPeriod]=useState<"today"|"month"|"year"|"custom">("month");
 const [fromDate,setFromDate]=useState("");
 const [toDate,setToDate]=useState("");
 useEffect(()=>{let live=true;fetch("/api/admin/customer-count",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(live&&d.success)setCustomerCount(d.count)}).catch(()=>{});return()=>{live=false}},[]);
 const [requestAlerts,setRequestAlerts]=useState<RequestAlerts|null>(null);
 const [alertsLoading,setAlertsLoading]=useState(true),[alertsError,setAlertsError]=useState("");
 const [refreshSignal,setRefreshSignal]=useState(0);
 useEffect(()=>{
   let active=true;
   async function refreshAlerts(){
     try{
       const response=await fetch("/api/admin/request-alerts",{cache:"no-store",credentials:"include"});
       const data=await response.json();
       if(!response.ok||!data.success)throw Error(data.message||"تعذر قراءة الإشعارات.");
       if(active){setRequestAlerts(data.counts);setAlertsError("");}
     }catch(err){if(active)setAlertsError(err instanceof Error?err.message:"تعذر تحديث الإشعارات.");}
     finally{if(active)setAlertsLoading(false);}
   }
   void refreshAlerts();
   const interval=window.setInterval(()=>{void refreshAlerts()},60000);
   const onFocus=()=>{void refreshAlerts()};
   window.addEventListener("focus",onFocus);
   return()=>{active=false;window.clearInterval(interval);window.removeEventListener("focus",onFocus)};
 },[refreshSignal]);
 useEffect(()=>{Promise.all([
  fetch("/api/admin/partners",{cache:"no-store",credentials:"include"}).then(r=>r.json()),
  fetch("/api/admin/services",{cache:"no-store",credentials:"include"}).then(r=>r.json())
 ]).then(([p,s])=>{if(p?.success)setPartners(p.data||[]);if(s?.success)setServices(s.data||[])}).finally(()=>setLoading(false))},[]);
 const stats=useMemo(()=>({total:partners.length,active:partners.filter(x=>x.status==="ACTIVE").length,review:partners.filter(x=>x.status==="UNDER_REVIEW"||x.status==="SUBMITTED").length,needs:partners.filter(x=>x.status==="NEEDS_COMPLETION"||x.status==="NEEDS_INFO").length}),[partners]);
 const periodRange=useMemo(()=>{const now=new Date();if(period==="custom"){if(!fromDate||!toDate||fromDate>toDate)return null;return {start:new Date(fromDate+"T00:00:00"),end:new Date(toDate+"T23:59:59.999")};}const start=period==="today"?new Date(now.getFullYear(),now.getMonth(),now.getDate()):period==="month"?new Date(now.getFullYear(),now.getMonth(),1):new Date(now.getFullYear(),0,1);return {start,end:now};},[period,fromDate,toDate]);
 const periodPartners=periodRange?partners.filter(p=>p.submittedAt&&new Date(p.submittedAt)>=periodRange.start&&new Date(p.submittedAt)<=periodRange.end):[];
 useEffect(()=>{if(period==="custom"&&!periodRange){setMetrics(null);return;}let active=true;const params=new URLSearchParams({period});if(period==="custom"){params.set("from",fromDate);params.set("to",toDate)}fetch("/api/admin/dashboard-metrics?"+params.toString(),{cache:"no-store"}).then(r=>r.json().then(d=>({ok:r.ok,data:d}))).then(({ok,data})=>{if(!active)return;if(!ok||!data.success)throw Error(data.message||"تعذر تحميل المؤشرات");setMetrics(data);setMetricsError("");}).catch(e=>{if(active){setMetrics(null);setMetricsError(e instanceof Error?e.message:"تعذر تحميل المؤشرات");}});return()=>{active=false};},[period,fromDate,toDate,periodRange]);
 const recent=[...partners].sort((a,b)=>new Date(b.submittedAt||0).getTime()-new Date(a.submittedAt||0).getTime()).slice(0,5);
 return <main dir="rtl" className="min-h-screen bg-[#FBF8F1] px-6 py-10 text-[#171717] md:px-10 xl:px-12"><div className="mx-auto max-w-[1500px]">
  <section><h1 className="text-3xl font-bold md:text-4xl">لوحة إدارة Arees Loop</h1><p className="mt-2 text-sm text-[#171717]/50">بيانات تشغيلية مباشرة من قاعدة بيانات المنصة — بدون بيانات تجريبية.</p></section>
  <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D4AF37]/25 bg-white p-4"><div><h2 className="font-bold text-[#0D3B34]">نظرة عامة على التشغيل</h2><p className="text-xs text-[#0D3B34]/60">فلتر الفترة يطبق حالياً على طلبات انضمام الشركاء فقط؛ عدادات الطلبات الجديدة تعرض الحالة الحالية.</p></div><div className="flex flex-wrap gap-2">{([{id:"today",name:"اليوم"},{id:"month",name:"هذا الشهر"},{id:"year",name:"هذه السنة"},{id:"custom",name:"من تاريخ إلى تاريخ"}] as const).map(item=><button key={item.id} type="button" aria-pressed={period===item.id} onClick={()=>setPeriod(item.id)} className={`rounded-xl px-3 py-2 text-xs font-bold ${period===item.id?"bg-[#0D3B34] text-white":"bg-[#F7F0DF] text-[#0D3B34]"}`}>{item.name}</button>)}</div>{period==="custom"&&<div className="mt-4 flex flex-wrap items-end gap-3 border-t border-[#D4AF37]/20 pt-4"><label className="text-xs font-bold">من تاريخ<input type="date" value={fromDate} max={toDate||undefined} onChange={e=>setFromDate(e.target.value)} className="mt-1 block rounded-lg border border-[#D4AF37]/40 bg-white p-2"/></label><label className="text-xs font-bold">إلى تاريخ<input type="date" value={toDate} min={fromDate||undefined} onChange={e=>setToDate(e.target.value)} className="mt-1 block rounded-lg border border-[#D4AF37]/40 bg-white p-2"/></label>{!periodRange&&<p className="text-xs text-amber-700">حدد تاريخ البداية والنهاية بشكل صحيح لعرض النتائج.</p>}</div>}</section>
  <section className="mt-5 rounded-[24px] border border-[#D4AF37]/35 bg-white p-5 shadow-sm" aria-label="إشعارات طلبات العملاء الجديدة">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-black text-[#0D3B34]">🔔 الطلبات الجديدة</h2><p className="mt-1 text-xs text-[#0D3B34]/60">اضغط على أي قسم للانتقال مباشرة إلى طلبات العملاء. تتجدد العدادات كل دقيقة.</p></div>
      {requestAlerts&&<span className="rounded-full bg-[#F8F1DE] px-4 py-2 text-xs font-bold text-[#87641D]">إجمالي الجديد: {Object.values(requestAlerts).reduce((sum:number,value)=>sum+(value??0),0)}</span>}
      <button type="button" onClick={()=>{setAlertsLoading(true);setRefreshSignal(value=>value+1)}} className="rounded-xl border border-[#D4AF37]/40 bg-white px-4 py-2 text-xs font-black text-[#0D3B34] hover:bg-[#FFF6DD]">↻ تحديث الإشعارات</button>
    </div>
    {alertsLoading&&!requestAlerts?<p className="mt-5 text-sm">جارٍ تحميل إشعارات الطلبات...</p>:null}
    {alertsError?<p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{alertsError}</p>:null}
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {shortcuts.filter(item=>!requestAlerts||requestAlerts[item.key]!==null).map(item=>{
        const count=requestAlerts?.[item.key];
        return <Link key={item.key} href={item.href} className={`group rounded-2xl border border-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${item.bg}`}>
          <div className="flex items-center justify-between gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 shadow-sm ${item.iconColor}`}><AdminIcon name={item.icon} size={27}/></span>
            <span className={`text-3xl font-black tabular-nums ${item.iconColor}`}>{count??"—"}</span>
          </div>
          <p className="mt-4 text-sm font-black text-[#0D3B34]">{item.label}</p>
          <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#0D3B34]/65">فتح الطلبات <AdminIcon name="arrow" size={15}/></p>
        </Link>;
      })}
    </div>
  </section>
  {metricsError&&<p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{metricsError}</p>}
  <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Link href="/admin/dashboard?section=bookings" className="rounded-2xl border border-[#D4AF37]/30 bg-white p-5 shadow-sm"><p className="font-bold text-[#0D3B34]">حجوزات تجارب الشركاء</p><p className="mt-2 text-3xl font-black">{metrics?.bookings??"—"}</p><p className="mt-2 text-xs text-black/45">حجوزات منشأة خلال الفترة المحددة</p></Link><Link href="/admin/dashboard?section=settlements" className="rounded-2xl border border-[#D4AF37]/30 bg-white p-5 shadow-sm"><p className="font-bold text-[#0D3B34]">المالية والتسويات</p><p className="mt-2 text-3xl font-black">{metrics?.settlements??"—"}</p><p className="mt-2 text-xs text-black/45">سجلات تسوية منشأة خلال الفترة، لا تعني المدفوعات المحصلة</p></Link><Link href="/admin/partners" className="rounded-2xl border border-[#D4AF37]/30 bg-white p-5 shadow-sm"><p className="font-bold text-[#0D3B34]">طلبات انضمام الشركاء</p><p className="mt-2 text-3xl font-black">{loading?"—":periodPartners.length}</p><p className="mt-2 text-xs text-black/45">حسب الفترة المختارة</p></Link><Link href="/admin/customer-reports" className="rounded-2xl border border-[#D4AF37]/30 bg-white p-5 shadow-sm"><p className="font-bold text-[#0D3B34]">العملاء المسجلون</p><p className="mt-2 text-3xl font-black">{customerCount??"—"}</p><p className="mt-2 text-xs text-black/45">الإجمالي الحالي • جميع الفترات</p></Link></section>
  {loading?<div className="mt-8 rounded-3xl bg-white p-8 text-center">جارٍ تحميل البيانات...</div>:<>
   <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="الشركاء المعتمدون" value={stats.active}/><Stat label="مطلوب استكمال" value={stats.needs}/><Stat label="طلبات قيد المراجعة" value={stats.review}/><Stat label="إجمالي الشركاء" value={stats.total}/><Link href="/admin/users" className="block rounded-[20px] border border-[#D8CDB8]/55 bg-white p-5 shadow-sm hover:border-[#D4AF37]"><span className="text-sm font-semibold">إجمالي العملاء</span><div className="mt-3 text-3xl font-black">{customerCount??"—"}</div><span className="mt-2 block text-xs text-[#947426]">عرض العملاء والتقارير ←</span></Link></section>
   <section className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
    <div className="rounded-[20px] border border-[#D8CDB8]/55 bg-[#FFFDF8] p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">أحدث طلبات الشركاء</h2><Link href="/admin/partners" className="rounded-full bg-[#FFF4D9] px-4 py-2 text-xs font-bold text-[#B47D08]">عرض جميع الطلبات ←</Link></div>
     {recent.length===0?<p className="py-10 text-center text-sm text-[#171717]/45">لا توجد طلبات شركاء حالياً.</p>:<div className="mt-5 overflow-x-auto"><table className="w-full min-w-[650px] text-right text-xs"><thead><tr className="border-b border-black/10 text-black/45"><th className="pb-3">الشريك</th><th className="pb-3">النشاط</th><th className="pb-3">الحالة</th><th className="pb-3">تاريخ الطلب</th></tr></thead><tbody>{recent.map(p=><tr key={p.id} className="border-b border-black/5"><td className="py-4 font-bold">{p.tradeNameAr||p.legalNameAr||"غير مدخل"}</td><td>{p.partnerType||"غير مدخل"}</td><td><span className={`rounded-full px-3 py-1.5 font-bold ${tone(p.status)}`}>{label(p.status)}</span></td><td>{p.submittedAt?new Date(p.submittedAt).toLocaleDateString("ar-SA"):"غير مدخل"}</td></tr>)}</tbody></table></div>}
    </div>
    <div className="grid gap-5"><div className="rounded-[20px] border border-black/8 bg-white/75 p-5 shadow-sm"><h2 className="text-lg font-bold">الخدمات الحقيقية</h2><p className="mt-5 text-4xl font-bold">{services.length}</p><div className="mt-4 space-y-2 text-xs"><p>منشورة: <b>{services.filter(s=>s.status==="PUBLISHED").length}</b></p><p>تحت المراجعة: <b>{services.filter(s=>s.status==="UNDER_REVIEW").length}</b></p></div><Link href="/admin/services" className="mt-5 inline-block rounded-full bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white">إدارة الخدمات</Link></div></div>
   </section>
  </>}</div></main>
}
function Stat({label,value}:{label:string;value:number}){return <div className="rounded-[22px] border border-white/55 bg-white/55 p-5 shadow-sm"><p className="text-sm font-semibold text-[#555]">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>}
