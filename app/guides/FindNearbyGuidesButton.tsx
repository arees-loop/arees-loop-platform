"use client";

import { useState } from "react";

export default function FindNearbyGuidesButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);

  function findNearby() {
    if (!navigator.geolocation) {
      window.location.assign("/guides/directory?filters=1&locationDenied=1");
      return;
    }

    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude.toFixed(6);
        const lng = coords.longitude.toFixed(6);
        let area = "موقعك الحالي";
        try {
          const response = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`, { cache: "no-store" });
          const data = await response.json();
          if (response.ok) area = data.city || data.address || area;
        } catch {
          // The coordinates still let the directory sort nearby guides if geocoding is unavailable.
        }
        window.location.assign(`/guides/directory?lat=${lat}&lng=${lng}&welcome=1&area=${encodeURIComponent(area)}`);
      },
      () => window.location.assign("/guides/directory?filters=1&locationDenied=1"),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  }

  return <button type="button" onClick={findNearby} disabled={busy} className={className} aria-label={busy ? "جارٍ تحديد موقعك للبحث عن مرشد سياحي" : "ابحث عن مرشد سياحي"}>
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px] shrink-0">
      <circle cx="10.5" cy="10.5" r="6.3" stroke="currentColor" strokeWidth="2.3" />
      <path d="m15.3 15.3 5 5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
    <span>{busy ? "جارٍ تحديد موقعك…" : "ابحث عن مرشد سياحي"}</span>
  </button>;
}
