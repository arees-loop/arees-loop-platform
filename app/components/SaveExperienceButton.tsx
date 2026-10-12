"use client";

import { useEffect, useState } from "react";

export type SavedExperience = {
  id: string; name: string; city: string; image: string | null; category: string;
};

export const savedExperiencesEvent = "arees:saved-experiences-updated";

/** Server-authoritative saved programs. No local fallback that could mislead customers. */
export default function SaveExperienceButton({ experience }: { experience: SavedExperience }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(true);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/customer/saved-experiences", { cache: "no-store" })
      .then(async response => {
        if (response.status === 401) return { unauthenticated: true };
        if (!response.ok) throw new Error("UNAVAILABLE");
        return response.json();
      })
      .then(result => {
        if (!active) return;
        if (result.unauthenticated) {
          setAvailable(true);
          return;
        }
        if (!result.success || !Array.isArray(result.data)) throw new Error("UNAVAILABLE");
        setSaved(result.data.some((item: { id: string }) => item.id === experience.id));
      })
      .catch(() => { if (active) { setAvailable(false); setError("الاهتمامات غير متاحة حالياً"); } })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [experience.id]);

  async function toggle() {
    if (busy || !available) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/customer/saved-experiences", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: experience.id }),
      });
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) throw new Error("SAVE_FAILED");
      setSaved(result.saved === true);
      window.dispatchEvent(new Event(savedExperiencesEvent));
    } catch {
      setError("تعذر حفظ الاهتمام، حاول لاحقاً");
    } finally {
      setBusy(false);
    }
  }

  return <div className="absolute left-3 top-3 z-10">
    <button type="button" disabled={busy || !available} onClick={toggle}
      aria-pressed={saved} aria-label={saved ? "إزالة من الاهتمامات" : "إضافة إلى الاهتمامات"}
      title={error || (saved ? "إزالة من الاهتمامات" : "إضافة إلى الاهتمامات")}
      className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-xl text-[#0D3B34] shadow-md transition hover:scale-105 disabled:opacity-60">
      {saved ? "♥" : "♡"}
    </button>
    {error && <span role="status" className="mt-1 block w-28 rounded bg-white p-1 text-center text-[9px] text-red-700 shadow">{error}</span>}
  </div>;
}
