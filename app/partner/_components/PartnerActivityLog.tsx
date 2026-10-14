"use client";

import { useEffect, useState } from "react";

type Activity = {
  id: string; kind: "LOGIN" | "OPERATION"; action: string; employee: string; email: string;
  createdAt: string; lastUsedAt: string | null; ipAddress: string | null; userAgent: string | null;
  details: { entityType?: string; beforeData?: unknown; afterData?: unknown } | null;
};

const actionNames: Record<string, string> = {
  PARTNER_MEMBER_ADDED: "إضافة موظف", PARTNER_MEMBER_UPDATED: "تعديل موظف أو صلاحيات",
  PARTNER_MEMBER_INVITED: "دعوة موظف",
  PARTNER_USER_LOGIN: "تسجيل دخول",
  PARTNER_SERVICE_CREATED: "إضافة خدمة", PARTNER_SERVICE_UPDATED: "تعديل خدمة",
  PARTNER_SERVICE_HIDDEN: "إخفاء خدمة", PARTNER_SERVICE_REPUBLISHED: "إعادة نشر خدمة",
  PARTNER_SERVICE_DELETED: "حذف خدمة", GOVERNMENT_PARTNER_LOGO_UPLOADED: "رفع شعار الجهة",
};

export default function PartnerActivityLog() {
  const [items, setItems] = useState<Activity[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/partner/team/activity", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.success) throw new Error(data?.message || "تعذر تحميل سجل النشاط.");
        if (alive) setItems(Array.isArray(data.activity) ? data.activity : []);
      })
      .catch((reason) => { if (alive) setError(reason instanceof Error ? reason.message : "تعذر تحميل سجل النشاط."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return <section dir="rtl" className="rounded-3xl border border-[#D4AF37]/25 bg-white p-5 shadow-sm">
    <div><h2 className="text-xl font-bold text-[#0D3B34]">سجل الدخول والعمليات</h2><p className="mt-2 text-sm leading-6 text-[#0D3B34]/60">يعرض جلسات الدخول والعمليات المسجلة على حسابات هذه المنشأة.</p></div>
    {loading ? <p className="mt-5 text-sm">جارٍ تحميل السجل...</p> : error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : items.length === 0 ? <p className="mt-5 rounded-xl bg-[#F7F4EA] p-4 text-sm text-[#0D3B34]/65">لا توجد جلسات دخول أو عمليات مسجلة حتى الآن.</p> : <div className="mt-5 overflow-x-auto rounded-2xl border border-[#0D3B34]/10"><table className="w-full min-w-[760px] text-right text-sm"><thead className="bg-[#0D3B34] text-white"><tr>{["النوع","المستخدم","العملية","التاريخ والوقت","آخر نشاط / تفاصيل"].map((title)=><th key={title} className="p-3 font-bold">{title}</th>)}</tr></thead><tbody>{items.map((item)=><tr key={item.id} className="border-t border-[#0D3B34]/8"><td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.kind === "LOGIN" ? "bg-[#E8F3EC] text-[#17614F]" : "bg-[#F8F0D9] text-[#806315]"}`}>{item.kind === "LOGIN" ? "دخول" : "عملية"}</span></td><td className="p-3"><b className="block">{item.employee}</b><span dir="ltr" className="mt-1 block text-xs text-[#0D3B34]/55">{item.email}</span></td><td className="p-3">{actionNames[item.action] || item.action}</td><td className="p-3">{new Date(item.createdAt).toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" })}{item.ipAddress && <span dir="ltr" className="mt-1 block text-xs text-[#0D3B34]/50">IP: {item.ipAddress}</span>}</td><td className="max-w-xs p-3 text-xs text-[#0D3B34]/65">{item.kind === "LOGIN" ? `آخر نشاط: ${new Date(item.lastUsedAt || item.createdAt).toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" })}` : item.details?.entityType || "—"}</td></tr>)}</tbody></table></div>}
  </section>;
}
