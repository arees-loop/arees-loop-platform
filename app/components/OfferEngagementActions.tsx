"use client";

import { useEffect, useState } from "react";
import OfferShareButton from "@/app/components/OfferShareButton";

type Props = {
  id: string;
  title: string;
  url?: string;
  imageUrl?: string | null;
  shareText?: string;
  className?: string;
};

export default function OfferEngagementActions({ id, title, url, imageUrl, shareText, className = "" }: Props) {
  const [favorite, setFavorite] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try { setFavorite(JSON.parse(localStorage.getItem("arees-offer-favorites") || "[]").includes(id)); }
    catch { /* local favorites are optional */ }
  }, [id]);

  function toggle() {
    try {
      const current = JSON.parse(localStorage.getItem("arees-offer-favorites") || "[]");
      const next = favorite ? current.filter((x: string) => x !== id) : [...new Set([...current, id])];
      localStorage.setItem("arees-offer-favorites", JSON.stringify(next));
      setFavorite(!favorite);
    } catch { setNotice("تعذر حفظ المفضلة على هذا الجهاز"); }
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`} dir="rtl">
      <button type="button" aria-pressed={favorite} onClick={toggle} className="rounded-xl border border-[#D4AF37]/40 bg-white px-4 py-2 text-sm font-bold text-[#0D3B34]">
        {favorite ? "♥ في المفضلة" : "♡ أضف للمفضلة"}
      </button>
      <OfferShareButton title={title} imageUrl={imageUrl} text={shareText} url={url} />
      {notice && <span role="status" className="text-xs text-[#0D3B34]">{notice}</span>}
    </div>
  );
}
