"use client";

import Link from "next/link";
import SavedAreesServices from "@/app/components/SavedAreesServices";
import { useCallback, useEffect, useState } from "react";
import { savedExperiencesEvent, type SavedExperience } from "@/app/components/SaveExperienceButton";

export default function FavoritesPage() {
  const [items, setItems] = useState<SavedExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/customer/saved-experiences", { cache: "no-store" });
      if (response.status === 401) { setNeedsLogin(true); return; }
      if (!response.ok) throw new Error("LOAD_FAILED");
      const result = await response.json();
      if (!result.success || !Array.isArray(result.data)) throw new Error("LOAD_FAILED");
      setItems(result.data);
      setError("");
    } catch {
      setError("تعذر تحميل اهتماماتك من الحساب حالياً.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    window.addEventListener(savedExperiencesEvent, refresh);
    return () => window.removeEventListener(savedExperiencesEvent, refresh);
  }, [refresh]);

  async function remove(id: string) {
    if (busyId) return;
    setBusyId(id);
    try {
      const response = await fetch("/api/customer/saved-experiences", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: id }),
      });
      if (!response.ok) throw new Error("DELETE_FAILED");
      const result = await response.json();
      if (!result.success) throw new Error("DELETE_FAILED");
      setItems(current => current.filter(item => item.id !== id));
      window.dispatchEvent(new Event(savedExperiencesEvent));
      setError("");
    } catch {
      setError("تعذر إزالة البرنامج من الاهتمامات.");
    } finally {
      setBusyId(null);
    }
  }

  return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] px-5 pb-24 pt-32 text-[#0D3B34]">
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-bold tracking-widest text-[#A87917]">AREES LOOP · INTERESTS</p>
      <h1 className="mt-2 text-4xl font-black">الاهتمامات</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#0D3B34]/70">برامجك وتجاربك وخدمات أريس المحفوظة في حسابك. إشعارات تغير السعر والتوفر ستُفعّل بعد تجهيز نظام التنبيهات.</p>
      <SavedAreesServices />
      {error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <p className="mt-10">جارٍ تحميل الاهتمامات…</p> : needsLogin ? <section className="mt-10 rounded-3xl bg-white p-8 text-center"><p>سجّل دخولك لعرض اهتمامات حسابك.</p><Link className="mt-4 inline-flex rounded-full bg-[#0D3B34] px-6 py-3 text-white" href="/login">تسجيل الدخول</Link></section> : error ? null : items.length === 0 ? <section className="mt-10 rounded-3xl bg-white p-10 text-center"><p>ما حفظت أي تجربة من برامج الشركاء حتى الآن.</p><Link className="mt-4 inline-flex rounded-full bg-[#0D3B34] px-6 py-3 text-white" href="/discover">استكشف البرامج</Link></section> :
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map(item => <article key={item.id} className="overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-white shadow-sm">
          <div className="relative aspect-[4/3] bg-[#EDE9DC]">{item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm">لا توجد صورة</div>}</div>
          <div className="p-5"><span className="text-xs font-bold text-[#A87917]">{item.category}</span><h2 className="mt-2 text-lg font-black">{item.name}</h2><p className="mt-2 text-sm text-[#0D3B34]/65">📍 {item.city || "الموقع غير محدد"}</p>
          <Link href={`/services/${encodeURIComponent(item.id)}`} className="mt-5 block rounded-xl bg-[#0D3B34] px-4 py-3 text-center text-sm font-bold text-white">عرض التفاصيل</Link>
          <button type="button" disabled={busyId === item.id} onClick={() => remove(item.id)} className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 px-4 py-2 text-sm disabled:opacity-50">إزالة من الاهتمامات</button>
          </div></article>)}</section>}
    </div>
  </main>;
}
