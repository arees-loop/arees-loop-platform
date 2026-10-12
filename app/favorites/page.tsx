"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readSavedExperiences, savedExperiencesEvent, writeSavedExperiences, type SavedExperience } from "@/app/components/SaveExperienceButton";

export default function FavoritesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<SavedExperience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async response => response.ok ? response.json() : null)
      .then(data => {
        if (!active) return;
        const id = data?.data?.user?.id;
        if (typeof id === "string") {
          setUserId(id);
          setItems(readSavedExperiences(id));
        }
      }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const refresh = () => setItems(readSavedExperiences(userId));
    window.addEventListener(savedExperiencesEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(savedExperiencesEvent, refresh); window.removeEventListener("storage", refresh); };
  }, [userId]);

  function remove(id: string) {
    if (!userId) return;
    const remaining = items.filter(item => item.id !== id);
    writeSavedExperiences(userId, remaining);
    setItems(remaining);
  }

  return <main dir="rtl" className="min-h-screen bg-[#F7F5EF] px-5 pb-24 pt-32 text-[#0D3B34]">
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-bold tracking-widest text-[#A87917]">AREES LOOP · INTERESTS</p>
      <h1 className="mt-2 text-4xl font-black">الاهتمامات</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#0D3B34]/70">البرامج التي حفظتها باستخدام علامة القلب. الحفظ حالياً على هذا الجهاز فقط ولا تصلك تنبيهات تلقائية قبل تفعيل المزامنة والإشعارات.</p>
      {loading ? <p className="mt-10">جارٍ تحميل الاهتمامات…</p> : !userId ? <section className="mt-10 rounded-3xl bg-white p-8 text-center"><p>سجّل دخولك لعرض اهتماماتك على هذا الجهاز.</p><Link className="mt-4 inline-flex rounded-full bg-[#0D3B34] px-6 py-3 text-white" href="/login">تسجيل الدخول</Link></section> : items.length === 0 ? <section className="mt-10 rounded-3xl bg-white p-10 text-center"><p>ما حفظت أي برنامج حتى الآن.</p><Link className="mt-4 inline-flex rounded-full bg-[#0D3B34] px-6 py-3 text-white" href="/discover">استكشف البرامج</Link></section> :
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map(item => <article key={item.id} className="overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-white shadow-sm">
          <div className="relative aspect-[4/3] bg-[#EDE9DC]">{item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm">لا توجد صورة</div>}</div>
          <div className="p-5"><span className="text-xs font-bold text-[#A87917]">{item.category}</span><h2 className="mt-2 text-lg font-black">{item.name}</h2><p className="mt-2 text-sm text-[#0D3B34]/65">📍 {item.city || "الموقع غير محدد"}</p>
          <Link href={`/services/${encodeURIComponent(item.id)}`} className="mt-5 block rounded-xl bg-[#0D3B34] px-4 py-3 text-center text-sm font-bold text-white">عرض التفاصيل</Link>
          <button type="button" onClick={() => remove(item.id)} className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 px-4 py-2 text-sm">إزالة من الاهتمامات</button>
          </div></article>)}</section>}
    </div>
  </main>;
}
