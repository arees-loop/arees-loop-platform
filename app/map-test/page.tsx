"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: typeof google;
  }
}

export default function MapTestPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState("جاري تحميل الخريطة...");

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setStatus("مفتاح Google Maps غير موجود في .env.local");
      return;
    }

    const existingScript = document.querySelector(
      'script[data-arees-google-maps="true"]'
    );

    const initializeMap = () => {
      if (!mapRef.current || !window.google?.maps) {
        setStatus("تعذر تشغيل Google Maps");
        return;
      }

      const madinah = {
        lat: 24.4672,
        lng: 39.6024,
      };

      const map = new window.google.maps.Map(mapRef.current, {
        center: madinah,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      new window.google.maps.Marker({
        position: madinah,
        map,
        title: "Arees Loop - Madinah",
      });

      setStatus("Google Maps متصلة بنجاح");
    };

    if (existingScript) {
      if (window.google?.maps) {
        initializeMap();
      } else {
        existingScript.addEventListener("load", initializeMap, {
          once: true,
        });
      }

      return;
    }

    const script = document.createElement("script");

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.dataset.areesGoogleMaps = "true";

    script.onload = initializeMap;

    script.onerror = () => {
      setStatus("فشل تحميل Google Maps API");
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#0D3B34] md:px-8"
      style={{ fontFamily: "'DIN Next Arabic', sans-serif" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold tracking-[0.25em] text-[#B99124]">
            AREES LOOP / MAP TEST
          </p>

          <h1
            className="text-3xl font-bold md:text-4xl"
            style={{ fontFamily: "'Khebrat Musamim', sans-serif" }}
          >
            اختبار Google Maps
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#0D3B34]/65">
            اختبار اتصال منصة أريس لوب بخدمة Google Maps JavaScript API.
          </p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[#0D3B34]/10 bg-white/70 p-3">
          <div
            ref={mapRef}
            className="h-[65vh] min-h-[500px] w-full rounded-[22px] bg-[#EDE9DE]"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-[#0D3B34]/10 bg-white/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
            <span className="text-sm font-bold">{status}</span>
          </div>
        </div>
      </div>
    </main>
  );
}