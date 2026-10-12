"use client";

import { useEffect, useState } from "react";

type Coords = { latitude?: number | null; longitude?: number | null };
let cachedLocation: { lat: number; lng: number } | null = null;
let pendingLocation: Promise<{ lat: number; lng: number } | null> | null = null;

function getLocation(): Promise<{ lat: number; lng: number } | null> {
  if (cachedLocation) return Promise.resolve(cachedLocation);
  if (pendingLocation) return pendingLocation;
  if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.resolve(null);
  pendingLocation = new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      position => { cachedLocation = { lat: position.coords.latitude, lng: position.coords.longitude }; resolve(cachedLocation); },
      () => resolve(null),
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false },
    );
  }).finally(() => { pendingLocation = null; });
  return pendingLocation;
}

function kilometers(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = Math.PI / 180;
  const a = Math.sin((lat2 - lat1) * rad / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon1) * rad / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ExperienceDistance({ latitude, longitude }: Coords) {
  const [distance, setDistance] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    if (latitude == null || longitude == null || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return;
    void getLocation().then(location => {
      if (active && location) setDistance(kilometers(location.lat, location.lng, latitude, longitude));
    });
    return () => { active = false; };
  }, [latitude, longitude]);
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D3B34]/70" title="المسافة التقريبية بخط مستقيم، وليست مسافة الطريق">
    <span aria-hidden="true">📍</span>
    {distance === null ? "المسافة غير متاحة" : distance < 1 ? `يبعد منك ${Math.round(distance * 1000)} متر` : `يبعد منك ${distance.toFixed(1)} كم`}
  </span>;
}
