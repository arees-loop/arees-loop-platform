"use client";

import { useState } from "react";
import { SAUDI_CITY_SUGGESTIONS, GUIDE_LICENSE_CATEGORIES } from "@/lib/guides/reference-data";

export default function GuideDirectoryFilters({ city, specialty, initiallyOpen = false }: { city: string; specialty: string; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);

  return <div className="mb-8">
    <div className="flex justify-center">
      <button type="button" aria-expanded={open} aria-controls="guide-directory-filters" onClick={() => setOpen(value => !value)} className="rounded-full border border-[#0D3B34]/20 bg-white/80 px-6 py-3 text-sm font-black text-[#0D3B34] shadow-sm backdrop-blur-xl transition hover:border-[#C49A37] hover:bg-white">
        {open ? "إخفاء الفلاتر" : "فلترة المرشدين"} <span aria-hidden="true" className="mr-2 text-[#A87917]">⌄</span>
      </button>
    </div>
    {open && <form id="guide-directory-filters" action="/guides/directory" className="mt-4 grid gap-3 rounded-[26px] border border-white/80 bg-white/75 p-5 text-[#0D3B34] shadow-[0_16px_45px_rgba(13,59,52,.12)] backdrop-blur-2xl md:grid-cols-[1fr_1fr_auto]">
      <label className="flex flex-col gap-2 text-sm font-bold">المنطقة أو المدينة<input list="guide-cities" name="city" defaultValue={city} placeholder="اختر مدينة أو اكتب للبحث" className="rounded-xl border border-[#0D3B34]/15 bg-white/80 px-4 py-3 font-normal outline-none focus:border-[#C49A37]"/></label>
      <label className="flex flex-col gap-2 text-sm font-bold">التخصص أو المسار<input list="guide-categories" name="specialty" defaultValue={specialty} placeholder="اختر فئة الترخيص أو ابحث" className="rounded-xl border border-[#0D3B34]/15 bg-white/80 px-4 py-3 font-normal outline-none focus:border-[#C49A37]"/></label>
      <button type="submit" className="self-end rounded-xl bg-[#0D3B34] px-8 py-3.5 font-bold text-white transition hover:bg-[#165B50]">ابحث عن مرشد</button>
      <datalist id="guide-cities">{SAUDI_CITY_SUGGESTIONS.map(c=><option key={c} value={c}/>)}</datalist>
      <datalist id="guide-categories">{GUIDE_LICENSE_CATEGORIES.map(c=><option key={c} value={c}/>)}</datalist>
    </form>}
  </div>;
}
