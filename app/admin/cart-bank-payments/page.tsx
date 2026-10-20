"use client";
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";
type Item={title?:string;quantity?:number;unitPriceSar?:number;itemType?:string};
type Order={reference:string;amountSar:number;status:string;createdAt:string;rows:Item[];customer:{name:string;email:string;phone:string|null}|null};
export default function AdminCartBankPayments(){
 const [orders,setOrders]=useState<Order[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[busy,setBusy]=useState("");
 const [files,setFiles]=useState<Record<string,File|null>>({});
 const load=useCallback(async()=>{setLoading(true);try{const r=await fetch("/api/admin/cart-bank-payments",{cache:"no-store"});const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر التحميل");setOrders(d.orders||[]);setError("");}catch(e){setError(e instanceof Error?e.message:"تعذر التحميل")}finally{setLoading(false)}},[]);
 useEffect(()=>{void Promise.resolve().then(load)},[load]);
 async function decide(reference:string,decision:"VERIFY"|"REJECT"){
  if(!window.confirm(decision==="VERIFY"?"هل تحققت من وصول المبلغ للحساب البنكي رسمياً؟":"هل تريد رفض الإيصال والسماح بإعادة إرساله؟"))return;
  setBusy(reference);setError("");
  try{const r=await fetch("/api/admin/cart-bank-payments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference,decision})});const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر التنفيذ");await load();}catch(e){setError(e instanceof Error?e.message:"تعذر التنفيذ")}finally{setBusy("")}
 }
 async function uploadVoucher(reference:string){
  const file=files[reference];if(!file)return;
  setBusy(reference);setError("");
  try{
   const form=new FormData();form.set("reference",reference);form.set("file",file);
   const r=await fetch("/api/cart/service-voucher",{method:"POST",body:form,credentials:"include"});
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر رفع الملف.");
   setFiles(prev=>({...prev,[reference]:null}));
   window.alert("تم حفظ ملف الخدمة وإتاحته للعميل.");
  }catch(e){setError(e instanceof Error?e.message:"تعذر رفع ملف الخدمة.");}finally{setBusy("")}
 }
 const label=(s:string)=>s==="CART_BANK_CREATED"?"بانتظار التحويل":s==="CART_BANK_RECEIPT_SUBMITTED"?"إيصال بانتظار المراجعة":s==="CART_BANK_VERIFIED"?"تم التحقق من التحويل":"إيصال مرفوض";
 return <main dir="rtl" className="mx-auto max-w-6xl px-4 py-8 text-[#0D3B34]">
  <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#B38A25]">AREES LOOP • BANK PAYMENTS</p><h1 className="mt-2 text-2xl font-black">تحويلات السلة البنكية</h1><p className="mt-2 text-sm opacity-75">طلبات الرخص الدولية والتجارب المسجلة عبر السلة. راجع الإيصال والحساب البنكي قبل اعتماد أي مبلغ.</p></div><div className="flex gap-2"><Link href="/admin/bookings" className="rounded-xl border px-4 py-2 text-sm">الحجوزات</Link><button onClick={()=>void load()} className="rounded-xl border border-[#B9974A] px-4 py-2 text-sm">تحديث</button></div></header>
  {error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
  {loading?<p className="mt-6">جارٍ تحميل الطلبات...</p>:orders.length===0?<p className="mt-6 rounded-xl bg-white p-6">لا توجد تحويلات في السلة.</p>:<div className="mt-6 space-y-3">{orders.map(order=><article key={order.reference} className="rounded-2xl border border-[#E0D2B1] bg-white p-5 shadow-sm">
   <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-mono text-xs">{order.reference}</p><p className="mt-1 font-bold">{order.customer?.name||order.customer?.email||"عميل"}</p><p className="text-xs opacity-75">{order.customer?.email} {order.customer?.phone}</p></div><div className="text-left"><strong className="text-lg">{Number(order.amountSar).toLocaleString("ar-SA")} ر.س</strong><p className="text-xs text-[#926A1F]">{label(order.status)}</p></div></div>
   <p className="mt-2 text-xs">{new Date(order.createdAt).toLocaleString("ar-SA")}</p>
   <ul className="mt-3 list-inside list-disc space-y-1 text-xs">{(order.rows||[]).map((x,i)=><li key={i}>{x.title||"خدمة"} × {x.quantity||1}</li>)}</ul>
   <div className="mt-3 flex flex-wrap gap-2">
    {order.status==="CART_BANK_VERIFIED"&&<a target="_blank" rel="noreferrer" href={"/cart/documents/invoice?reference="+encodeURIComponent(order.reference)} className="rounded-lg border border-[#E0CB91] px-3 py-2 text-xs font-bold">الفاتورة</a>}
   </div>
   {order.status==="CART_BANK_VERIFIED"&&<div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#E0CB91] bg-[#FFF9ED] p-3">
    <label className="text-xs font-bold">إرسال الفاوتشر أو مستند تنفيذ الخدمة إلى العميل<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="mt-1 block max-w-full text-xs" onChange={e=>setFiles(prev=>({...prev,[order.reference]:e.target.files?.[0]||null}))}/></label>
    <button type="button" disabled={!files[order.reference]||!!busy} onClick={()=>void uploadVoucher(order.reference)} className="rounded-lg bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">رفع ملف الخدمة</button>
   </div>}
   {order.status==="CART_BANK_RECEIPT_SUBMITTED"&&<div className="mt-4 flex flex-wrap gap-2"><a href={"/api/admin/cart-bank-payments?receipt=true&reference="+encodeURIComponent(order.reference)} className="rounded-xl border border-[#A88B4C] px-4 py-2 text-xs font-bold">تنزيل إثبات التحويل</a><button disabled={!!busy} onClick={()=>void decide(order.reference,"VERIFY")} className="rounded-xl bg-[#0D3B34] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">تأكيد وصول المبلغ</button><button disabled={!!busy} onClick={()=>void decide(order.reference,"REJECT")} className="rounded-xl border border-red-300 px-4 py-2 text-xs text-red-800 disabled:opacity-50">رفض الإيصال</button></div>}
  </article>)}</div>}
 </main>;
}
