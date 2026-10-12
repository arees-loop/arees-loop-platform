"use client";

import { useEffect, useState } from "react";

export default function ExperiencePhoto({
  src, alt, className = "", fallbackClassName = "",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  if (!src || failed) return <div role="img" aria-label={alt} className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0D3B34] via-[#205849] to-[#C4A154] p-4 text-center text-sm font-bold text-white ${fallbackClassName}`}>
    <span className="drop-shadow">{alt}</span>
  </div>;
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`h-full w-full object-cover ${className}`}/>;
}
