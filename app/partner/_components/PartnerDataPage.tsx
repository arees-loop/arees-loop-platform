"use client";
import PartnerTeamManagement from "./PartnerTeamManagement";
import PartnerActivityLog from "./PartnerActivityLog";
import {useEffect,useMemo,useState} from "react";
type Kind="dashboard"|"bookings"|"settlements"|"invoices"|"reports"|"team"|"business";
const titles={dashboard:"الرئيسية",bookings:"الحجوزات",settlements:"التسويات",invoices:"الفواتير",reports:"التقارير",team:"الموظفون والصلاحيات",business:"المنشأة والتراخيص"};
const money=(v:any)=>new Intl.NumberFormat("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v||0));
const date=(v:any)=>v?new Date(v).toLocaleDateString("ar-SA"):"—";
export default function PartnerDataPage({kind}:{kind:Kind}){
 const [d,setD]=useState<any>(null);const [error,setError]=useState("");
 const [editingLegalName,setEditingLegalName]=useState(false);
 const [legalName,setLegalName]=useState("");
 const [savingLegalName,setSavingLegalName]=useState(false);
 const [legalNameMessage,setLegalNameMessage]=useState("");
 const saveLegalName=async()=>{
  const name=legalName.trim();
  if(!name||name.length>160){setLegalNameMessage("أدخل اسماً صالحاً حتى 160 حرفاً.");return;}
  setSavingLegalName(true);setLegalNameMessage("");
  try{
   const response=await fetch("/api/partner/portal",{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({legalNameAr:name})});
   const result=await response.json();
   if(!response.ok||!result.success){setLegalNameMessage(result.message||"تعذر حفظ اسم المنشأة.");return;}
   setD((old:any)=>({...old,partner:{...old.partner,legalNameAr:result.partner.legalNameAr}}));
   setEditingLegalName(false);setLegalNameMessage("تم حفظ اسم المنشأة.");
  }catch{setLegalNameMessage("تعذر الاتصال بالخادم.");}
  finally{setSavingLegalName(false);}
 };
 const [editingTradeName,setEditingTradeName]=useState(false);
 const [tradeName,setTradeName]=useState("");
 const [savingTradeName,setSavingTradeName]=useState(false);
 const [tradeNameMessage,setTradeNameMessage]=useState("");
 const saveTradeName=async()=>{
  const name=tradeName.trim();
  if(!name||name.length>160){setTradeNameMessage("أدخل اسماً تجارياً صالحاً حتى 160 حرفاً.");return;}
  setSavingTradeName(true);setTradeNameMessage("");
  try{
   const response=await fetch("/api/partner/portal",{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({tradeNameAr:name})});
   const result=await response.json();
   if(!response.ok||!result.success){setTradeNameMessage(result.message||"تعذر حفظ الاسم التجاري.");return;}
   setD((old:any)=>({...old,partner:{...old.partner,tradeNameAr:result.partner.tradeNameAr}}));
   setEditingTradeName(false);setTradeNameMessage("تم حفظ الاسم التجاري.");
  }catch{setTradeNameMessage("تعذر الاتصال بالخادم.");}
  finally{setSavingTradeName(false);}
 };
 useEffect(()=>{if(kind==="team")return;fetch("/api/partner/portal?section="+kind,{credentials:"include",cache:"no-store"}).then(r=>r.json()).then(x=>x.success?setD(x):setError(x.message||"تعذر تحميل البيانات")).catch(()=>setError("تعذر تحميل البيانات"));},[kind]);
 const [bookingQuery,setBookingQuery]=useState("");
 const [bookingStatus,setBookingStatus]=useState("ALL");
 const stats=useMemo(()=>{if(!d)return null;if(d.dashboardSummary)return{sales:d.dashboardSummary.sales,bookings:d.dashboardSummary.bookings,services:d.dashboardSummary.services,settlements:d.dashboardSummary.settlements};const sales=d.bookings.reduce((a:number,b:any)=>a+Number(b.totalAmount||0),0);return{sales,bookings:d.bookings.length,services:d.services.length,settlements:d.settlements.reduce((a:number,s:any)=>a+Number(s.netAmount||0),0)}},[d]);
 if(kind==="team")return <main dir="rtl" className="min-h-screen bg-[#F7F4EA] p-5 text-[#0D3B34] md:p-8"><div className="mx-auto max-w-7xl space-y-6"><div><p className="text-xs font-bold text-[#B99124]">AREES LOOP PARTNER</p><h1 className="mt-2 text-3xl font-bold">{titles.team}</h1></div><PartnerTeamManagement/><PartnerActivityLog/></div></main>;
 if(error)return <main className="p-8"><div className="rounded-3xl bg-white p-8 text-red-700">{error}</div></main>;
 if(!d)return <main className="p-8">جاري تحميل بيانات الشريك...</main>;
 const empty=(s:string)=><div className="rounded-3xl border border-dashed border-[#0D3B34]/20 bg-white p-10 text-center text-sm text-[#0D3B34]/55">لا توجد {s} حالياً</div>;
 const table=(heads:string[],rows:any[][])=><div className="overflow-x-auto rounded-3xl bg-white"><table className="w-full text-sm"><thead className="bg-[#0D3B34] text-white"><tr>{heads.map(h=><th key={h} className="p-4 text-right">{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i} className="border-b border-black/5">{r.map((x,j)=><td key={j} className="p-4">{x??"—"}</td>)}</tr>)}</tbody></table></div>;
 return <main dir="rtl" className="min-h-screen bg-[#F7F4EA] p-5 text-[#0D3B34] md:p-8"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold text-[#B99124]">AREES LOOP PARTNER</p><h1 className="mt-2 text-3xl font-bold">{titles[kind]}</h1><p className="mt-1 text-sm opacity-60">{d.partner?.tradeNameAr||d.partner?.legalNameAr||"حساب الشريك"} — بيانات فعلية من حساب المنشأة</p>
 {kind==="dashboard"&&<><div className="my-7 grid gap-4 md:grid-cols-4">{[["إجمالي الحجوزات",stats?.bookings],["الخدمات",stats?.services],["قيمة الحجوزات",money(stats?.sales)+" ر.س"],["صافي التسويات",money(stats?.settlements)+" ر.س"]].map(x=><div key={x[0] as string} className="rounded-3xl bg-white p-5"><p className="text-xs opacity-55">{x[0]}</p><b className="mt-2 block text-2xl">{x[1]}</b></div>)}</div>{!d.access?.bookings?<div className="rounded-3xl border border-dashed border-[#0D3B34]/20 bg-white p-6 text-sm text-[#0D3B34]/60">تفاصيل الحجوزات تحتاج صلاحية مستقلة.</div>:d.bookings.length?table(["الحجز","العميل","الخدمة","الإجمالي","الحالة"],d.bookings.slice(0,8).map((b:any)=>[b.reference,b.customerName,b.service?.nameAr,money(b.totalAmount)+" ر.س",b.status])):empty("حجوزات")}</>}
 {kind==="bookings"&&<section className="mt-7 space-y-5"><div className="flex flex-wrap gap-3 rounded-3xl bg-white p-4"><input aria-label="البحث في الحجوزات" className="min-w-52 flex-1 rounded-xl border border-black/10 p-3 text-sm" placeholder="ابحث برقم الحجز أو العميل أو الخدمة" value={bookingQuery} onChange={e=>setBookingQuery(e.target.value)}/><select aria-label="تصفية حالة الحجز" className="rounded-xl border border-black/10 p-3 text-sm" value={bookingStatus} onChange={e=>setBookingStatus(e.target.value)}><option value="ALL">جميع الحالات</option>{Array.from(new Set(d.bookings.map((b:any)=>String(b.status)))).map((s:any)=><option key={s} value={s}>{s}</option>)}</select></div>{(()=>{const q=bookingQuery.trim().toLocaleLowerCase();const filtered=d.bookings.filter((b:any)=>(bookingStatus==="ALL"||b.status===bookingStatus)&&(!q||[b.reference,b.customerName,b.service?.nameAr].some(v=>String(v||"").toLocaleLowerCase().includes(q))));return filtered.length?table(["الحجز","العميل","الخدمة","عدد الأشخاص","تاريخ الخدمة","الإجمالي","الحالة"],filtered.map((b:any)=>[b.reference,b.customerName,b.service?.nameAr,b.guests,date(b.serviceDate),money(b.totalAmount)+" ر.س",b.status])):empty("حجوزات مطابقة للبحث")})()}</section>}
 {kind==="settlements"&&(d.settlements.length?table(["رقم التسوية","الفترة","المبيعات","عمولة المنصة","الاستردادات","الصافي","الحالة"],d.settlements.map((s:any)=>[s.settlementNumber,date(s.periodStart)+" - "+date(s.periodEnd),money(s.grossSales),money(s.platformCommission),money(s.refunds),money(s.netAmount),s.status])):empty("تسويات"))}
 {kind==="invoices"&&(d.invoices.length?table(["الفاتورة","الحجز","العميل","الخدمة","الإجمالي","الحالة"],d.invoices.map((i:any)=>[i.invoiceNumber,i.booking?.reference,i.booking?.customerName,i.booking?.service?.nameAr,money(i.totalAmount)+" ر.س",i.status])):empty("فواتير"))}
 {kind==="reports"&&<div className="my-7 grid gap-4 md:grid-cols-4">{[["الحجوزات",stats?.bookings],["الخدمات",stats?.services],["إجمالي المبيعات",money(stats?.sales)+" ر.س"],["صافي التسويات",money(stats?.settlements)+" ر.س"]].map(x=><div key={x[0] as string} className="rounded-3xl bg-white p-6"><p className="text-xs opacity-55">{x[0]}</p><b className="mt-2 block text-2xl">{x[1]}</b></div>)}</div>}
 {kind==="business"&&<><div className="my-7 grid gap-4 md:grid-cols-2"><div className="rounded-3xl bg-white p-6"><h2 className="font-bold">بيانات المنشأة</h2><div className="mt-4 space-y-3 text-sm"><div className="space-y-2"><p>الاسم: <b>{d.partner?.legalNameAr||"—"}</b></p>{!editingLegalName?(d.access?.canEditLegalName?<button type="button" onClick={()=>{setLegalName(d.partner?.legalNameAr||"");setEditingLegalName(true);setLegalNameMessage("");}} className="rounded-xl border border-[#B99124] px-4 py-2 font-bold text-[#0D3B34]">تعديل الاسم</button>:null):<div className="space-y-2"><label htmlFor="partner-legal-name" className="block text-xs font-bold">الاسم الجديد للمنشأة</label><input id="partner-legal-name" maxLength={160} value={legalName} onChange={e=>setLegalName(e.target.value)} className="w-full rounded-xl border border-[#0D3B34]/20 bg-white p-3"/><div className="flex gap-2"><button type="button" onClick={saveLegalName} disabled={savingLegalName||!legalName.trim()} className="rounded-xl bg-[#0D3B34] px-4 py-2 font-bold text-white disabled:opacity-50">{savingLegalName?"جاري الحفظ...":"حفظ الاسم"}</button><button type="button" onClick={()=>{setEditingLegalName(false);setLegalNameMessage("");}} disabled={savingLegalName} className="rounded-xl border px-4 py-2">إلغاء</button></div><p className="text-xs text-amber-800">يجب أن يطابق الاسم القانوني مستندات السجل التجاري.</p></div>}{legalNameMessage&&<p role="status" className="text-xs font-bold">{legalNameMessage}</p>}</div><div className="space-y-2"><p>الاسم التجاري: <b>{d.partner?.tradeNameAr||"—"}</b></p>{!editingTradeName?(d.access?.canEditTradeName?<button type="button" onClick={()=>{setTradeName(d.partner?.tradeNameAr||"");setEditingTradeName(true);setTradeNameMessage("");}} className="rounded-xl border border-[#B99124] px-4 py-2 font-bold text-[#0D3B34]">تعديل الاسم التجاري</button>:null):<div className="space-y-2"><label htmlFor="partner-trade-name" className="block text-xs font-bold">الاسم التجاري الجديد</label><input id="partner-trade-name" maxLength={160} value={tradeName} onChange={e=>setTradeName(e.target.value)} className="w-full rounded-xl border border-[#0D3B34]/20 bg-white p-3" /><div className="flex gap-2"><button type="button" onClick={saveTradeName} disabled={savingTradeName||!tradeName.trim()} className="rounded-xl bg-[#0D3B34] px-4 py-2 font-bold text-white disabled:opacity-50">{savingTradeName?"جاري الحفظ...":"حفظ الاسم التجاري"}</button><button type="button" onClick={()=>{setEditingTradeName(false);setTradeNameMessage("");}} disabled={savingTradeName} className="rounded-xl border px-4 py-2">إلغاء</button></div></div>}{tradeNameMessage&&<p role="status" className="text-xs font-bold">{tradeNameMessage}</p>}</div><p>الرقم الموحد: <b>{d.partner?.unifiedNumber||"—"}</b></p><p>السجل التجاري: <b>{d.partner?.commercialRegister||"—"}</b></p><p>الرقم الضريبي: <b>{d.partner?.vatNumber||"—"}</b></p><p>المدينة: <b>{d.partner?.city||"—"}</b></p></div></div><div className="rounded-3xl bg-white p-6"><h2 className="font-bold">الحساب والتواصل</h2><div className="mt-4 space-y-3 text-sm"><p>البريد: <b>{d.partner?.businessEmail||"—"}</b></p><p>الجوال: <b>{d.partner?.businessPhone||"—"}</b></p><p>البنك: <b>{d.partner?.bankName||"—"}</b></p><p>IBAN: <b>{d.partner?.iban||"—"}</b></p></div></div></div>{d.licenses.length?table(["الترخيص","الجهة","الرقم","الانتهاء","الحالة"],d.licenses.map((l:any)=>[l.type,l.issuer,l.licenseNumber,date(l.expiryDate),l.status])):empty("تراخيص")}</>}
 </div></main>
}
