"use client";

import { useEffect, useState } from "react";

export type SavedExperience = {
  id: string; name: string; city: string; image: string | null; category: string;
};

export const savedExperiencesEvent = "arees:saved-experiences-updated";

type SavedResponse = { unauthenticated?: boolean; ids?: string[] };

// Multiple cards mount at the same time. Share only an IN-FLIGHT read request;
// never cache a previous user's account data across sign-in/out.
let pendingSavedRead: Promise<SavedResponse> | null = null;
function fetchSavedIds(): Promise<SavedResponse> {
  if (pendingSavedRead) return pendingSavedRead;
  pendingSavedRead = fetch("/api/customer/saved-experiences", { cache: "no-store" })
    .then(async response => {
      if (response.status === 401) return { unauthenticated: true };
      if (!response.ok) throw new Error("SAVED_EXPERIENCES_UNAVAILABLE");
      const result = await response.json();
      if (!result?.success || !Array.isArray(result.data)) throw new Error("SAVED_EXPERIENCES_UNAVAILABLE");
      return { ids: result.data.map((item: {id: string}) => item.id) };
    })
    .finally(() => { pendingSavedRead = null; });
  return pendingSavedRead;
}

/** Saved hearts are always server-authoritative; never award phantom saves. */
export default function SaveExperienceButton({ experience }: { experience: SavedExperience }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(true);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetchSavedIds()
      .then(result => {
        if (!active) return;
        setAvailable(true);
        setError("");
        if (!result.unauthenticated) setSaved((result.ids ?? []).includes(experience.id));
      })
      .catch(() => {
        if (active) {
          setAvailable(false);
          setError("الاهتمامات غير متاحة الآن. اضغط القلب لإعادة المحاولة.");
        }
      })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [experience.id]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (!available) {
        const result = await fetchSavedIds();
        setAvailable(true);
        if (!result.unauthenticated) {
          setSaved((result.ids ?? []).includes(experience.id));
          return; // A retry checks state only; don't unexpectedly save.
        }
      }
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
      setAvailable(false);
      setError("تعذر الاتصال بالاهتمامات. اضغط القلب لإعادة المحاولة.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="absolute left-3 top-3 z-10">
    <button type="button" disabled={busy} onClick={toggle}
      aria-pressed={saved} aria-label={available ? (saved ? "إزالة من الاهتمامات" : "إضافة إلى الاهتمامات") : "إعادة محاولة تحميل الاهتمامات"}
      title={error || (saved ? "إزالة من الاهتمامات" : "إضافة إلى الاهتمامات")}
      className="grid h-10 w-10 place-items-center rounded-full border border-[#D4AF37]/25 bg-white/95 text-[#0D3B34] shadow-md transition hover:scale-105 disabled:opacity-60">
      <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true" fill={saved ? "#D4AF37" : "none"} stroke={saved ? "#AB802C" : "#0D3B34"} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="transition-colors">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>
      </svg>
    </button>
    {error && <span role="status" className="mt-1 block w-32 rounded bg-white p-1 text-center text-[9px] text-red-700 shadow">{error}</span>}
  </div>;
}
