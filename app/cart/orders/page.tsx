"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import CustomerDashboardShell from "@/app/components/CustomerDashboardShell";

type Item={title?:string;itemType?:string;application?:{requestReference?:string}};
type BankOrder={reference:string;amountSar:number;createdAt:string;status:string;hasVoucher:boolean;rows:Item[]};
type LicenseApplication={reference:string;createdAt:string;priceSar:number;status:string;serviceStatus:string;bankReference:string|null};
const labels:Record<string,string>={
 AWAITING_PAYMENT:"النموذج مسجل — بانتظار اختيار السداد",
 CART_BANK_CREATED:"بانتظار تحويل المبلغ",
 CART_BANK_RECEIPT_SUBMITTED:"إيصال التحويل قيد المراجعة",
 CART_BANK_VERIFIED:"تم اعتماد السداد",
 CART_BANK_REJECTED:"الإيصال مرفوض — يرجى إعادة رفعه"
};
function Reference({value,label}:{value:string;label:string}){
 return <div className="min-w-0"><p className="text-[11px] text-[#587368]">{label}</p>
  <p dir="ltr" className="mt-1 break-all text-right font-mono text-xs font-bold">{value}</p>
  <button type="button" onClick={()=>void navigator.clipboard.writeText(value)} className="mt-1 text-xs underline">نسخ الرقم</button>
 </div>;
}
export default function CartOrdersPage(){
 const [orders,setOrders]=useState<BankOrder[]>([]);
 const [licenseApplications,setLicenseApplications]=useState<LicenseApplication[]>([]);
 const [loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{
  let active=true;
  fetch("/api/cart/bank-checkout?history=true",{credentials:"include",cache:"no-store"}).then(async r=>{
   const d=await r.json();if(!r.ok||!d.success)throw Error(d.message||"تعذر تحميل الطلبات");
   if(active){setOrders(d.orders||[]);setLicenseApplications(d.licenseApplications||[]);}
  }).catch(e=>{if(active)setError(e instanceof Error?e.message:"تعذر تحميل الطلبات")})
    .finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[]);
 return <CustomerDashboardShell><main dir="rtl" className="min-h-screen bg-[#F7F5EF] px-4 pb-20 pt-32 text-[#0D3B34]">
  <div className="mx-auto max-w-4xl">
   <h1 className="text-2xl font-black">طلبات السلة ومستندات الدفع</h1>
   <p className="mt-2 text-sm">رقم طلب الرخصة يُنشأ عند حفظ النموذج، ومرجع التحويل يُنشأ فقط عند بدء السداد.</p>
   {loading?<p className="mt-6">جارٍ تحميل الطلبات...</p>:error?<p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>:<>
    {licenseApplications.length>0&&<section aria-label="طلبات الرخصة الدولية" className="mt-6">
     <h2 className="mb-3 text-lg font-black">طلبات الرخصة الدولية</h2>
     <div className="space-y-3">{licenseApplications.map(x=><article key={x.reference} className="rounded-2xl border border-[#D9C796] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
       <Reference value={x.reference} label="رقم طلب الرخصة"/>
       <b className="text-lg">{Number(x.priceSar).toLocaleString("ar-SA")} ر.س (السعر قبل الخصم)</b>
      </div>
      <p className="mt-3 text-xs">{new Date(x.createdAt).toLocaleString("ar-SA")} — {labels[x.status]||x.status} · حالة الخدمة: {x.serviceStatus==="EXECUTING"?"تحت التنفيذ":x.serviceStatus==="DONE"?"تم التنفيذ":x.serviceStatus==="PAID"?"تم السداد":x.serviceStatus==="CANCELED"?"ملغي":"جديد"}</p>
      {x.bankReference&&<div className="mt-3 rounded-lg bg-[#F8F5E9] p-3"><Reference value={x.bankReference} label="مرجع التحويل البنكي المرتبط"/></div>}
      {x.status!=="CART_BANK_VERIFIED"&&<Link href={x.bankReference?"/cart?reference="+encodeURIComponent(x.bankReference):"/cart"} className="mt-4 inline-flex rounded-xl border border-[#B9974A] px-4 py-2 text-xs font-bold">متابعة السداد من السلة</Link>}
     </article>)}</div>
    </section>}
    <section aria-label="سجل مدفوعات السلة" className="mt-8">
     <h2 className="mb-3 text-lg font-black">التحويلات ومدفوعات السلة</h2>
     {orders.length===0?<div className="rounded-xl bg-white p-6 text-sm">لم يتم إنشاء أي مرجع تحويل بنكي بعد. <Link href="/cart" className="font-bold underline">اذهب إلى السلة</Link></div>:
      <div className="space-y-3">{orders.map(o=><article key={o.reference} className="rounded-2xl border border-[#DED3B3] bg-white p-5">
       <div className="flex flex-wrap items-start justify-between gap-3"><Reference value={o.reference} label="مرجع التحويل"/><b className="text-lg">{Number(o.amountSar).toLocaleString("ar-SA")} ر.س</b></div>
       <p className="mt-2 text-xs">{new Date(o.createdAt).toLocaleString("ar-SA")} — {labels[o.status]||o.status}</p>
       <p className="mt-2 text-xs">{(o.rows||[]).map(x=>x.title||"خدمة").join("، ")}</p>
       <div className="mt-4 flex flex-wrap gap-2">
        {o.status==="CART_BANK_VERIFIED"&&<a target="_blank" rel="noreferrer" href={"/cart/documents/invoice?reference="+encodeURIComponent(o.reference)} className="rounded-xl border border-[#B9974A] px-4 py-2 text-xs font-bold">فاتورة السداد PDF</a>}
        {o.status==="CART_BANK_VERIFIED"&&o.hasVoucher&&<a href={"/api/cart/service-voucher?download=true&reference="+encodeURIComponent(o.reference)} className="rounded-xl border border-[#B9974A] px-4 py-2 text-xs font-bold">ملف الخدمة (إن توفر)</a>}
        {o.status!=="CART_BANK_VERIFIED"&&<Link href={"/cart?reference="+encodeURIComponent(o.reference)} className="rounded-xl border border-[#B9974A] px-4 py-2 text-xs font-bold">استكمال التحويل / رفع الإيصال</Link>}
       </div>
      </article>)}</div>}
    </section>
    {orders.length===0&&licenseApplications.length===0&&<p className="mt-4 text-sm">لا توجد طلبات مسجلة في الحساب حتى الآن.</p>}
   </>}
  </div>
 </main></CustomerDashboardShell>;
}
