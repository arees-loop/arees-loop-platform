"use client";
import CustomerDashboardShell from "@/app/components/CustomerDashboardShell";

import Link from "next/link";
import OrderStatusBadge from "@/app/components/OrderStatusBadge";
import { useEffect, useState } from "react";

type CartAlert={reference:string;status:string;createdAt:string;rows:{title?:string}[];needsAttention:boolean;hasNewMessage?:boolean};
type BookingUpdate = {
  id: string;
  reference: string;
  status: string;
  bookingDate: string;
  service: { nameAr: string };
};
const statusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار", PAID: "مدفوع", CONFIRMED: "مؤكد",
  IN_PROGRESS: "قيد التنفيذ", COMPLETED: "مكتمل",
  CANCELLED: "ملغي", REFUNDED: "مسترد",
};

export default function NotificationsPage() {
  const [bookings, setBookings] = useState<BookingUpdate[]>([]);
  const [cartAlerts,setCartAlerts]=useState<CartAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/customer/bookings", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (response.status === 401) throw new Error("AUTH_REQUIRED");
        if (!response.ok) throw new Error("LOAD_FAILED");
        return response.json();
      })
      .then(result => {
        if (!result.success || !Array.isArray(result.bookings)) throw new Error("LOAD_FAILED");
        setBookings(result.bookings);
      })
      .catch(reason => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error && reason.message === "AUTH_REQUIRED" ? "يرجى تسجيل الدخول لعرض تحديثات حسابك." : "تعذر تحميل تحديثات الحجوزات حالياً.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/cart/bank-checkout?history=true",{credentials:"include",cache:"no-store",signal:controller.signal})
     .then(async r=>r.ok?r.json():null)
     .then(d=>{if(!controller.signal.aborted&&d?.success&&Array.isArray(d.orders))setCartAlerts(d.orders.filter((x:CartAlert)=>x.needsAttention));})
     .catch(()=>{});
    return()=>controller.abort();
  },[]);
  return <CustomerDashboardShell><main dir="rtl" className="min-h-screen bg-[#F7F5EF] px-5 pb-24 pt-32 text-[#0D3B34]">
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-bold tracking-widest text-[#A87917]">AREES LOOP · UPDATES</p>
      <h1 className="mt-2 text-4xl font-black">الإشعارات</h1>
      <p className="mt-3 text-sm leading-7 text-[#0D3B34]/70">تحديثات حالة حجوزاتك الفعلية. التنبيهات الفورية وإشعارات تغير الأسعار والاهتمامات لم تُفعّل بعد؛ لن نعرض رسائل تجريبية على أنها إشعارات حقيقية.</p>
      {cartAlerts.length>0&&<section role="region" aria-label="إجراءات مطلوبة" className="mt-6 space-y-3">
        <h2 className="text-lg font-black text-[#9C1A2B]">🔴 إجراءات تتطلب انتباهك ({cartAlerts.length})</h2>
        {cartAlerts.map(item=><article key={item.reference} className="rounded-2xl border-2 border-[#C73545] bg-[#FFF1F2] p-4 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><b>{(item.rows||[]).map(row=>row.title||"طلب خدمة").join("، ")}</b><OrderStatusBadge status={item.status} attention>{item.status==="DOCUMENTS_REQUESTED"?"مستندات مطلوبة":item.hasNewMessage?"رد جديد من الإدارة":"الطلب يحتاج متابعتك"}</OrderStatusBadge></div>
          <p className="mb-3 break-all font-mono text-[10px] text-[#79414B]">{item.reference}</p>
          <Link href={"/my-requests?reference="+encodeURIComponent(item.reference)} className="block"><span className="block rounded-xl border-2 border-[#AF2636] bg-[#FFE1E4] px-4 py-3 text-center text-sm font-black text-[#941729] shadow-[0_4px_0_#AF2636]">📎 {item.status==="DOCUMENTS_REQUESTED"?"مستندات إضافية مطلوبة — اضغط هنا لرفعها":"رسالة أو إجراء جديد — اضغط هنا"} ←</span></Link>
        </article>)}
      </section>}
      {loading ? <p className="mt-8 rounded-2xl bg-white p-7">جارٍ تحميل التحديثات…</p> : error ? <div className="mt-8 rounded-2xl bg-white p-7"><p>{error}</p>{error.includes("الدخول") && <Link href="/login" className="mt-3 inline-flex underline">تسجيل الدخول</Link>}</div> : bookings.length === 0 && cartAlerts.length===0 ? <div className="mt-8 rounded-2xl bg-white p-8 text-center"><p>لا توجد تحديثات حجوزات لعرضها حالياً.</p><Link href="/discover" className="mt-4 inline-flex rounded-xl bg-[#0D3B34] px-5 py-3 text-white">استكشف التجارب</Link></div> :
      <section className="mt-8 space-y-3">{bookings.map(item => <article key={item.id} className="rounded-2xl border border-[#D4AF37]/20 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-black">{item.service.nameAr}</h2><OrderStatusBadge status={item.status}>{statusLabels[item.status]||item.status}</OrderStatusBadge></div>
        <p className="mt-2 text-sm text-[#0D3B34]/70">الحجز {item.reference} · الحالة الحالية: {statusLabels[item.status] || item.status}</p>
        <p className="mt-2 text-xs text-[#0D3B34]/50">تاريخ إنشاء الحجز: {new Intl.DateTimeFormat("ar-SA", {dateStyle:"medium"}).format(new Date(item.bookingDate))}</p>
        <Link href="/bookings" className="mt-3 inline-flex text-sm font-bold text-[#996E13] underline">عرض حجوزاتي</Link>
      </article>)}</section>}
    </div>
  </main></CustomerDashboardShell>;
}
