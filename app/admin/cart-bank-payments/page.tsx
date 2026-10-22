"use client";
import Link from "next/link";
import {useCallback,useEffect,useMemo,useState} from "react";
type Item={title?:string;quantity?:number;unitPriceSar?:number};
type Order={reference:string;amountSar:number;status:string;workflowStatus:string;createdAt:string;rows:Item[];customer:{name:string;email:string;phone:string|null}|null};
const labels:Record<string,string>={CART_BANK_CREATED:"طلب جديد — بانتظار التحويل",CART_BANK_RECEIPT_SUBMITTED:"إيصال للتحقق",CART_BANK_VERIFIED:"تم تأكيد السداد",CART_BANK_REJECTED:"إيصال مرفوض",PAID:"تم السداد — تحت الإجراء",PROCESSING:"تحت التنفيذ",DOCUMENTS_REQUESTED:"مستندات إضافية مطلوبة",COMPLETED:"تم التنفيذ"};
const filters=[{id:"ALL",name:"كل الطلبات"},{id:"CART_BANK_CREATED",name:"طلبات جديدة"},{id:"CART_BANK_RECEIPT_SUBMITTED",name:"تحتاج تأكيد السداد"},{id:"PAID",name:"تم السداد"},{id:"PROCESSING",name:"تحت التنفيذ"},{id:"DOCUMENTS_REQUESTED",name:"مطلوب مستندات"},{id:"COMPLETED",name:"تم التنفيذ"},{id:"CART_BANK_REJECTED",name:"إيصال مرفوض"}];
export default function AdminCartBankPayments(){
 const [orders,setOrders]=useState<Order[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[query,setQuery]=useState(""),[filter,setFilter]=useState("ALL");
 const load=useCallback(async()=>{setLoading(true);try{const r=await fetch("/api/admin/cart-bank-payments",{cache:"no-store",credentials:"include"});const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر التحميل");setOrders(d.orders||[]);setError("");}catch(e){setError(e instanceof Error?e.message:"تعذر التحميل")}finally{setLoading(false)}},[]);
 useEffect(()=>{void load()},[load]);
 const visible=useMemo(()=>orders.filter(o=>{const s=o.workflowStatus||o.status;return (filter==="ALL"||s===filter||(filter==="PAID"&&s==="CART_BANK_VERIFIED"))&&[o.reference,o.customer?.name||"",o.customer?.phone||"",o.customer?.email||"",(o.rows||[]).map(x=>x.title||"").join(" ")].join(" ").toLowerCase().includes(query.toLowerCase());}),[orders,filter,query]);
 const amount=(n:number)=>Number(n||0).toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2})+" ر.س";
 return <main dir="rtl" className="mx-auto max-w-7xl px-4 py-7 text-[#0D3B34]">
   <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#B38A25]">AREES LOOP · CART ORDERS</p><h1 className="mt-2 text-2xl font-black">طلبات السلة</h1><p className="mt-2 text-sm opacity-70">إدارة طلبات البرامج والخدمات عبر السلة — السداد، المرفقات، العميل، والتنفيذ في مكان واحد.</p></div><div className="flex gap-2"><Link href="/admin/bookings" className="rounded-xl border px-4 py-2 text-sm">حجوزات الشركاء</Link><button onClick={()=>void load()} className="rounded-xl border border-[#B9974A] px-4 py-2 text-sm">تحديث</button></div></header>
   <div className="mt-5 grid gap-3 rounded-2xl border border-[#DFD3B7] bg-white p-4 md:grid-cols-[1fr_auto]"><input aria-label="ابحث عن الطلب أو العميل" value={query} onChange={e=>setQuery(e.target.value)} placeholder="اسم العميل أو الخدمة أو رقم الطلب أو الجوال..." className="w-full rounded-xl border border-[#D4AF37]/40 p-3 text-sm"/><select aria-label="تصفية حالة الطلب" value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border border-[#D4AF37]/40 p-3 text-sm">{filters.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
   <p className="my-3 text-xs text-[#758176]">{visible.length} طلب من أصل {orders.length}</p>
   {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
   {loading?<p className="mt-6">جارٍ تحميل الطلبات...</p>:visible.length===0?<p className="rounded-2xl bg-white p-6">لا توجد طلبات مطابقة.</p>:<div className="overflow-x-auto rounded-2xl border border-[#E0D2B1] bg-white">
    <table className="w-full min-w-[780px] border-collapse text-right text-xs"><thead className="bg-[#F8F4E9] text-[#34564A]"><tr>{["العميل","الخدمة / رقم الطلب","المبلغ","حالة الطلب","التاريخ","الإجراء"].map(x=><th key={x} className="px-4 py-4">{x}</th>)}</tr></thead><tbody>
     {visible.map(o=><tr key={o.reference} className="border-t border-[#EADFC9] hover:bg-[#FFFDF7]">
      <td className="px-4 py-4"><b className="block text-sm">{o.customer?.name||"عميل أريس لوب"}</b><span className="mt-1 block" dir="ltr">{o.customer?.phone||o.customer?.email||"—"}</span></td>
      <td className="max-w-[280px] px-4 py-4"><b className="block truncate">{(o.rows||[]).map(x=>x.title||"خدمة").join("، ")}</b><span className="block break-all font-mono text-[10px] text-[#788477]">{o.reference}</span></td>
      <td className="whitespace-nowrap px-4 py-4 font-bold">{amount(o.amountSar)}</td>
      <td className="px-4 py-4"><span className="rounded-full bg-[#F5F0E5] px-3 py-2 font-bold">{labels[o.workflowStatus||o.status]||o.workflowStatus||o.status}</span></td>
      <td className="whitespace-nowrap px-4 py-4">{new Date(o.createdAt).toLocaleDateString("ar-SA")}</td>
      <td className="px-4 py-4"><Link href={"/admin/cart-bank-payments/"+encodeURIComponent(o.reference)} className="inline-flex rounded-xl border border-[#B9974A] bg-[#FFF9E8] px-4 py-2 font-bold">فتح الطلب ←</Link></td>
     </tr>)}
    </tbody></table></div>}
 </main>;
}
