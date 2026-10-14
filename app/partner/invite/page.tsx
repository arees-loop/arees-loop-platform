"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function PartnerEmployeeInvitePage() {
  const [token, setToken] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => { setToken(new URLSearchParams(window.location.search).get("token") || ""); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage("");
    if (password !== confirm) { setMessage("كلمتا المرور غير متطابقتين."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/partner/team/invite/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, firstName, lastName, password }) });
      const data = await response.json().catch(() => null);
      setMessage(data?.message || "تعذر تفعيل الحساب."); setSuccess(Boolean(response.ok && data?.success));
    } catch { setMessage("تعذر الاتصال بالخادم."); }
    finally { setBusy(false); }
  }

  return <main dir="rtl" className="grid min-h-screen place-items-center bg-[#F7F4EA] px-4 py-10 text-[#0D3B34]"><section className="w-full max-w-lg rounded-[30px] border border-[#D4AF37]/30 bg-white p-7 shadow-xl sm:p-9"><p className="text-center text-[11px] font-black tracking-[.24em] text-[#A78225]">AREES LOOP · PARTNER TEAM</p><h1 className="mt-3 text-center text-2xl font-black">تفعيل حساب الموظف</h1><p className="mt-2 text-center text-sm leading-7 text-[#0D3B34]/60">أكد بريدك واكتب اسمك واختر كلمة المرور بنفسك.</p>{success ? <div className="mt-6 text-center"><p role="status" className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{message}</p><Link href="/partner/login" className="mt-5 inline-flex rounded-xl bg-[#0D3B34] px-6 py-3 text-sm font-bold text-white">الدخول إلى حساب الشريك</Link></div> : <form onSubmit={submit} className="mt-6 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">الاسم الأول<input value={firstName} onChange={(event)=>setFirstName(event.target.value)} required maxLength={80} className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 px-4 py-3" /></label><label className="text-sm font-bold">اسم العائلة<input value={lastName} onChange={(event)=>setLastName(event.target.value)} maxLength={80} className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 px-4 py-3" /></label></div><label className="block text-sm font-bold">كلمة المرور<input type="password" autoComplete="new-password" value={password} onChange={(event)=>setPassword(event.target.value)} required className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 px-4 py-3" placeholder="8 أحرف على الأقل، حروف وأرقام" /></label><label className="block text-sm font-bold">تأكيد كلمة المرور<input type="password" autoComplete="new-password" value={confirm} onChange={(event)=>setConfirm(event.target.value)} required className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 px-4 py-3" /></label>{message&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{message}</p>}<button disabled={busy||!token} className="w-full rounded-xl bg-[#0D3B34] px-5 py-3 font-black text-white disabled:opacity-50">{busy?"جارٍ التفعيل...":"تأكيد البريد وتفعيل الحساب"}</button></form>}</section></main>;
}
