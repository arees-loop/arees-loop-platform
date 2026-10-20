"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import PartnerBookingDetail,{type PartnerBookingRow} from "@/app/components/PartnerBookingDetail";

const statuses=[
 ["ALL","الكل"],["PENDING","جديد / بانتظار الدفع"],["RECEIPT_REVIEW","إيصال قيد المراجعة"],
 ["RECEIPT_REJECTED","إيصال مرفوض"],["PAID","تم السداد"],["CONFIRMED","مؤكد"],
 ["IN_PROGRESS","تحت التنفيذ"],["COMPLETED","تم التنفيذ"],["CANCELLED","ملغي"],["REFUNDED","مسترد"]
] as const;
const labels:Record<string,string>=Object.fromEntries(statuses);
const bg:Record<string,string>={PENDING:"bg-[#EBF0EA] text-[#3D5B4D]",
 RECEIPT_REVIEW:"bg-[#FFF0CB] text-[#805C19]",RECEIPT_REJECTED:"bg-red-100 text-red-800",
 PAID:"bg-amber-100 text-amber-900",CONFIRMED:"bg-emerald-100 text-emerald-900",
 IN_PROGRESS:"bg-sky-100 text-sky-900",COMPLETED:"bg-green-100 text-green-900",
 CANCELLED:"bg-red-100 text-red-900",REFUNDED:"bg-slate-200 text-slate-700"};

export default function AdminBookingsPage(){
 const [rows,setRows]=useState<PartnerBookingRow[]>([]);
 const [counts,setCounts]=useState<{status:string;count:number}[]>([]);
 const [filter,setFilter]=useState("ALL"),[source,setSource]=useState("ALL"),[search,setSearch]=useState("");
 const [loading,setLoading]=useState(true),[error,setError]=useState(""),[selected,setSelected]=useState<PartnerBookingRow|null>(null);
 const [info,setInfo]=useState<{partnerCartCount:number;cartScanLimited:boolean}|null>(null);
 const load=useCallback(async()=>{
  setLoading(true);
  try{
   const r=await fetch("/api/admin/bookings?status="+encodeURIComponent(filter),{cache:"no-store",credentials:"include"});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر تحميل الطلبات.");
   setRows(d.data||[]);setCounts(d.counts||[]);setInfo(d.info||null);setError("");
   setSelected(prev=>prev?(d.data||[]).find((x:PartnerBookingRow)=>x.id===prev.id)||prev:null);
  }catch(e){setError(e instanceof Error?e.message:"تعذر تحميل الطلبات.");setRows([])}
  finally{setLoading(false)}
 },[filter]);
 useEffect(()=>{void Promise.resolve().then(load);},[load]);
 useEffect(()=>{
  void Promise.resolve().then(()=>{
   const value=new URLSearchParams(window.location.search).get("source");
   if(value==="cart")setSource("CART");
  });
 },[]);

 const filtered=useMemo(()=>rows.filter(x=>{
  if(source!=="ALL"&&source!==x.source)return false;
  const term=search.toLowerCase().trim();
  if(!term)return true;
  return [x.reference,x.customerName,x.customerPhone||"",x.customerEmail||"",x.service.nameAr,
   x.partner.tradeNameAr||x.partner.legalNameAr].some(v=>v.toLowerCase().includes(term));
 }),[rows,search,source]);
 const count=(k:string)=>k==="ALL"?counts.reduce((n,v)=>n+v.count,0):counts.find(x=>x.status===k)?.count||0;
 return <main dir="rtl" className="mx-auto max-w-7xl px-4 py-8 text-[#0D3B34]">
  <header className="flex flex-wrap items-center justify-between gap-3">
   <div><p className="text-xs font-bold text-[#B38A25]">AREES LOOP • PARTNER BOOKINGS</p>
    <h1 className="mt-2 text-2xl font-black sm:text-3xl">حجوزات وطلبات تجارب الشركاء</h1>
    <p className="mt-2 text-sm text-[#0D3B34]/65">الحجوزات الفعلية وطلبات السلة البنكية في قائمة واحدة، مع فصل واضح بين الحالات المالية والتنفيذ.</p>
   </div>
   <button type="button" onClick={()=>void load()} className="rounded-xl border border-[#D4AF37] bg-white px-4 py-2 text-sm font-bold">تحديث</button>
  </header>
  <div className="mt-6 flex flex-wrap gap-2">{statuses.map(([key,title])=>
   <button key={key} type="button" onClick={()=>{setFilter(key);setSelected(null)}}
    aria-pressed={filter===key}
    className={`rounded-full border px-3 py-2 text-xs font-bold ${filter===key?"border-[#0D3B34] bg-[#0D3B34] text-white":"border-[#D4AF37]/40 bg-white"}`}>
    {title} ({count(key)})</button>)}</div>
  <div className="mt-5 flex flex-wrap items-center gap-2">
   <span className="text-xs font-bold">نوع الطلب:</span>
   {([["ALL","الكل"],["BOOKING","حجوزات الشركاء"],["CART","طلبات السلة والتحويل"]] as const).map(([key,title])=>
    <button key={key} aria-pressed={source===key} onClick={()=>setSource(key)}
     className={`rounded-xl border px-3 py-2 text-xs font-bold ${source===key?"border-[#A7842C] bg-[#FFF0CC]":"border-[#DED0AD] bg-white"}`}>
     {title}</button>)}
  </div>
  <div className="mt-4 rounded-2xl border border-[#D4AF37]/30 bg-white p-4">
   <input aria-label="بحث حجوزات وتجارب الشركاء" value={search} onChange={e=>setSearch(e.target.value)}
    placeholder="ابحث برقم الطلب أو اسم العميل أو الجوال أو التجربة أو الشريك..."
    className="w-full rounded-xl border border-[#D4AF37]/30 p-3 text-sm"/>
  </div>
  {info?.cartScanLimited&&<p className="mt-3 rounded-xl bg-[#FFF5DA] p-3 text-xs">تنبيه: سجل السلة بلغ حد البحث الأخير؛ يلزم توسيع الاستعلام لعرض جميع الطلبات القديمة.</p>}
  {error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
  {loading?<p className="mt-6 text-sm">جارٍ تحميل الطلبات...</p>:filtered.length===0?
   <div className="mt-5 rounded-2xl border border-[#D4AF37]/30 bg-white px-5 py-14 text-center">
    <p className="text-lg font-bold">لا توجد طلبات مطابقة للفلاتر</p>
    <p className="mt-2 text-sm text-[#0D3B34]/60">طلبات السلة تظهر بعد إنشاء مرجع التحويل، ولا تعتبر حجوزات مؤكدة قبل الاعتماد.</p>
   </div>:
   <div className="mt-5 space-y-2">{filtered.map(b=>
    <button key={b.id} type="button" onClick={()=>setSelected(b)}
     className="grid w-full grid-cols-1 items-center gap-2 rounded-xl border border-[#D4AF37]/25 bg-white px-4 py-3 text-right transition hover:border-[#D4AF37] md:grid-cols-[1.15fr_1.6fr_.7fr_.85fr_1fr]">
     <span className="min-w-0"><strong className="block truncate text-sm">{b.customerName}</strong>
      <small dir="ltr" className="mt-1 block break-all text-right font-mono text-[10px] text-[#557068]">{b.reference}</small></span>
     <span className="min-w-0 truncate text-sm">{b.service.nameAr}
      <small className="block truncate text-[#0D3B34]/60">{b.partner.tradeNameAr||b.partner.legalNameAr}</small></span>
     <span className="text-xs">{new Date(b.createdAt).toLocaleDateString("ar-SA")}</span>
     <strong className="text-sm">{b.totalAmount.toLocaleString("ar-SA")} ر.س</strong>
     <span className="flex flex-wrap items-center gap-1.5"><span className={`rounded-full px-3 py-1 text-xs font-bold ${bg[b.status]||"bg-[#EDF2EB]"}`}>
      {labels[b.status]||b.status}</span>
      <small className="rounded-full border border-[#E8D7AC] px-2 py-1 text-[10px]">{b.source==="CART"?"طلب سلة":"حجز"}</small>
      <span aria-hidden="true" className="text-xs text-[#AA852D]">فتح ←</span></span>
    </button>)}</div>}
  {selected&&<PartnerBookingDetail key={selected.id} row={selected} onClose={()=>setSelected(null)} onUpdated={load}/>}
 </main>;
}
