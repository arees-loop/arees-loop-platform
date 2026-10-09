"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
type Counts={partners:number;guides:number;total:number};
export default function LicenseRenewalQueue(){
 const [counts,setCounts]=useState<Counts|null>(null),[error,setError]=useState("");
 useEffect(()=>{fetch("/api/admin/license-renewal-queue",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(d.success)setCounts(d.counts);else setError(d.message||"تعذر تحميل الطلبات")}).catch(()=>setError("تعذر تحميل الطلبات"))},[]);
 return <main dir="rtl" className="mx-auto min-h-screen max-w-4xl px-5 pt-36 text-[#0D3B34]"><h1 className="text-3xl font-black">مركز مراجعة تجديد التراخيص</h1><p className="mt-3 text-sm">طلبات الشركاء والمرشدين التي تنتظر قرار الإدارة.</p>{error&&<p role="alert">{error}</p>}{counts&&<p className="mt-5 text-lg font-bold">إجمالي الطلبات المعلقة: {counts.total}</p>}<div className="mt-6 grid gap-4 sm:grid-cols-2"><Link href="/admin/license-renewals" className="rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">تجديد تراخيص الشركاء</h2><p className="mt-3">{counts?counts.partners:"..."} طلب قيد المراجعة</p><p className="mt-3 underline">فتح المراجعة</p></Link><Link href="/admin/guide-license-renewals" className="rounded-xl border bg-white p-6"><h2 className="text-xl font-bold">تجديد تراخيص المرشدين</h2><p className="mt-3">{counts?counts.guides:"..."} طلب قيد المراجعة</p><p className="mt-3 underline">فتح المراجعة</p></Link></div></main>;
}
