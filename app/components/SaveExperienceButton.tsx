"use client";

import { useEffect, useState } from "react";

export type SavedExperience = {
  id: string;
  name: string;
  city: string;
  image: string | null;
  category: string;
};

const STORAGE_PREFIX = "arees-loop-customer-saved-experiences-";
export const savedExperiencesEvent = "arees:saved-experiences-updated";

export function readSavedExperiences(userId: string): SavedExperience[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_PREFIX + userId) || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is SavedExperience => Boolean(item) && typeof item.id === "string" && typeof item.name === "string" && typeof item.city === "string" && (item.image === null || typeof item.image === "string") && typeof item.category === "string").slice(0, 200);
  } catch { return []; }
}

export function writeSavedExperiences(userId: string, items: SavedExperience[]) {
  localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(items.slice(0, 200)));
  window.dispatchEvent(new Event(savedExperiencesEvent));
}

/** Local-browser save only, never represented as cloud-synced customer data. */
export default function SaveExperienceButton({ experience }: { experience: SavedExperience }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" }).then(async r => r.ok ? r.json() : null)
      .then(data => { if (!active) return; const id = data?.data?.user?.id; setUserId(typeof id === "string" ? id : null); setBusy(false); })
      .catch(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!userId) return;
    setSaved(readSavedExperiences(userId).some(item => item.id === experience.id));
  }, [userId, experience.id]);

  function toggle() {
    if (!userId) {
      window.location.assign("/login");
      return;
    }
    const items = readSavedExperiences(userId);
    const exists = items.some(item => item.id === experience.id);
    writeSavedExperiences(userId, exists ? items.filter(item => item.id !== experience.id) : [experience, ...items]);
    setSaved(!exists);
  }
  return <button type="button" disabled={busy} onClick={toggle} aria-pressed={saved} aria-label={saved ? "إزالة من الاهتمامات" : "إضافة إلى الاهتمامات"} title={saved ? "إزالة من الاهتمامات" : "حفظ ضمن الاهتمامات على هذا الجهاز"} className="absolute left-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-xl text-[#0D3B34] shadow-md transition hover:scale-105 disabled:opacity-60">{saved ? "♥" : "♡"}</button>;
}
