"use client";

import { useEffect, useState } from "react";

export default function PartnerLogoutPage() {
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      .catch(() => setError(true))
      .finally(() => { window.location.replace("/partner/login"); });
  }, []);
  return <main dir="rtl" className="grid min-h-screen place-items-center bg-[#F7F4EA] p-6 text-[#0D3B34]"><p role="status" className="rounded-2xl bg-white px-6 py-4 text-sm font-bold shadow-sm">{error?"جارٍ تحويلك إلى دخول الشريك...":"جارٍ تسجيل الخروج..."}</p></main>;
}
