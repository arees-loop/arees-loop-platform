"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NearbyGuideControls({ active, welcome = false, locationDenied = false, area = "موقعك الحالي" }: { active: boolean; welcome?: boolean; locationDenied?: boolean; area?: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(welcome || locationDenied);

  useEffect(() => {
    if (!noticeOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setNoticeOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [noticeOpen]);

  function locate() {
    if (!navigator.geolocation) { setError("المتصفح لا يدعم تحديد الموقع. اختر المدينة من الفلاتر."); return; }
    setBusy(true); setError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude.toFixed(6);
        const lng = coords.longitude.toFixed(6);
        let place = "موقعك الحالي";
        try {
          const response = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`, { cache: "no-store" });
          const data = await response.json();
          if (response.ok) place = data.city || data.address || place;
        } catch {
          // Location sorting still works when reverse geocoding is unavailable.
        }
        window.location.assign(`/guides/directory?lat=${lat}&lng=${lng}&welcome=1&area=${encodeURIComponent(place)}`);
      },
      () => { setBusy(false); setError("تعذر تحديد موقعك أو لم تمنح الإذن. اختر المدينة يدوياً من الفلاتر."); },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  }

  return <>
    <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-center">
      <button type="button" disabled={busy} onClick={locate} className="rounded-full bg-[#0D3B34] px-6 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-60">{busy ? "جارٍ تحديد موقعك…" : "📍 مرشدون قريبون مني"}</button>
      <Link href="/guides/directory?filters=1" className="rounded-full border border-[#D4AF37] bg-white/85 px-6 py-3 text-sm font-bold text-[#0D3B34] shadow-sm">جميع المرشدين</Link>
      {active && <p className="w-full text-sm font-bold text-[#0D3B34]">المرشدون الأقرب إلى موقعك حسب المواقع المسجلة لديهم</p>}
      {error && <p role="alert" className="w-full rounded-2xl border border-white/80 bg-white/75 p-4 text-sm font-semibold text-[#0D3B34] shadow-sm backdrop-blur-xl">{error}</p>}
    </div>

    {noticeOpen && <div className="fixed inset-0 z-[130] grid place-items-center bg-[#061B17]/45 p-4 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget) setNoticeOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="guide-location-title" dir="rtl" className="relative w-full max-w-lg overflow-hidden rounded-[30px] border border-white/65 bg-[#0B342D]/88 p-6 text-white shadow-[0_25px_90px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.28)] backdrop-blur-2xl sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[.13] via-transparent to-[#D4AF37]/[.08]" />
        <button type="button" aria-label="إغلاق الرسالة" onClick={() => setNoticeOpen(false)} className="absolute left-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/35 bg-white/10 text-xl leading-none text-white transition hover:bg-white/20">×</button>
        <div className="relative z-[1]">
          <p className="text-xs font-black tracking-widest text-[#F0D37D]">AREES LOOP GUIDES</p>
          <h2 id="guide-location-title" className="mt-3 text-2xl font-black">{locationDenied ? "ابحث عن مرشد في منطقتك" : `أنت الآن في ${area}`}</h2>
          <p className="mt-3 text-sm leading-7 text-white/90">{locationDenied ? "لم يتم تحديد الموقع. يمكنك متابعة البحث عن المرشدين واختيار المدينة أو التخصص يدوياً." : "تقدر تواصل للمرشدين الحولك، أو تبحث عن مرشدين في مدينة أو تخصص تختاره."}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {!locationDenied && <button type="button" onClick={() => setNoticeOpen(false)} className="rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#10342C] transition hover:bg-[#E6C45F]">متابعة للمرشدين حولي</button>}
            <Link href="/guides/directory?filters=1" onClick={() => setNoticeOpen(false)} className="rounded-full border border-white/70 bg-white/15 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-white/25">البحث عن مرشدين</Link>
          </div>
        </div>
      </section>
    </div>}
  </>;
}
