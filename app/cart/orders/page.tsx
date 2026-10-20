"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import CustomerDashboardShell from "@/app/components/CustomerDashboardShell";
type Order={reference:string;amountSar:number;createdAt:string;status:string;rows:{title?:string;itemType?:string}[]};
const labels:Record<string,string>={CART_BANK_CREATED:"بانتظار تحويل المبلغ",CART_BANK_RECEIPT_SUBMITTED:"إيصال التحويل قيد المراجعة",CART_BANK_VERIFIED:"تم اعتماد السداد",CART_BANK_REJECTED:"الإيصال مرفوض — يرجى إعادة رفعه"};
export default function CartOrdersPage(){
 const [orders,setOrders]=useState<Order[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/cart/bank-checkout?history=true",{credentials:"include",cache:"no-store"}).then(async r=>{
  const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر تحميل الطلبات");
  setOrders(d.orders||[]);
 }).catch(e=>setError(e instanceof Error?e.message:"تعذر تحميل الطلبات")).finally(()=>setLoading(false))},[]);
 return <CustomerDashboardShell><main dir="rtl" className="min-h-screen bg-[#F7F5EF] px-4 pb-20 pt-32 text-[#0D3B34]"><div className="mx-auto max-w-4xl">
 <h1 className="text-2xl font-black">طلبات السلة ومستندات الدفع</h1><p className="mt-2 text-sm">تابع حالة التحويل البنكي والفاتورة ومستند تنفيذ الخدمة.</p>
 {loading?<p className="mt-6">جارٍ تحميل الطلبات...</p>:error?<p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>:orders.length===0?<div className="mt-6 rounded-xl bg-white p-6">ليس لديك طلبات سلة حتى الآن. <Link href="/discover" className="underline">استكشف الخدمات</Link></div>:<div className="mt-6 space-y-3">{orders.map(o=><article key={o.reference} className="rounded-2xl border border-[#DED3B3] bg-white p-5">
  <div className="flex flex-wrap justify-between gap-2"><p className="break-all font-mono text-xs">{o.reference}</p><b className="text-lg">{Number(o.amountSar).toLocaleString("ar-SA")} ر.س</b></div>
  <p className="mt-2 text-xs">{new Date(o.createdAt).toLocaleString("ar-SA")} — {labels[o.status]||o.status}</p>
  <p className="mt-2 text-xs">{(o.rows||[]).map(x=>x.title||"خدمة").join("، ")}</p>
  <div className="mt-4 flex flex-wrap gap-2">
   {o.status==="CART_BANK_VERIFIED"&&<a target="_blank" rel="noreferrer" href={"/cart/documents/invoice?reference="+encodeURIComponent(o.reference)} className="rounded-xl border border-[#B9974A] px-4 py-2 text-xs font-bold">فاتورة السداد PDF</a>}
   {o.status==="CART_BANK_VERIFIED"&&<a href={"/api/cart/service-voucher?download=true&reference="+encodeURIComponent(o.reference)} className="rounded-xl border border-[#B9974A] px-4 py-2 text-xs font-bold">ملف الخدمة (إن توفر)</a>}
   {o.status!=="CART_BANK_VERIFIED"&&<Link href={"/cart?reference="+encodeURIComponent(o.reference)} className="rounded-xl border border-[#B9974A] px-4 py-2 text-xs font-bold">استكمال التحويل / رفع الإيصال</Link>}
  </div>
 </article>)}</div>}
 </div></main></CustomerDashboardShell>;
}
