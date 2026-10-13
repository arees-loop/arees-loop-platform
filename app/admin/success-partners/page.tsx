"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type SuccessPartner = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  sortOrder: number;
  isVisible: boolean;
};

export default function SuccessPartnersAdminPage() {
  const [partners, setPartners] = useState<SuccessPartner[]>([]);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/success-partners", { cache: "no-store", credentials: "include" });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setError(result.message || "تعذر تحميل شركاء النجاح.");
        return;
      }
      setPartners(result.data as SuccessPartner[]);
      setError("");
    } catch {
      setError("تعذر الاتصال ببيانات شركاء النجاح.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function addPartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || busy) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("حجم الشعار يجب ألا يزيد عن 3 ميجابايت.");
      return;
    }
    const form = new FormData();
    form.set("name", name.trim());
    form.set("websiteUrl", website.trim());
    form.set("file", file);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/success-partners", { method: "POST", body: form, credentials: "include" });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setError(result.message || "تعذر إضافة الشريك.");
        return;
      }
      setName("");
      setWebsite("");
      setFile(null);
      const picker = document.getElementById("success-partner-file") as HTMLInputElement | null;
      if (picker) picker.value = "";
      setNotice("تمت إضافة الشريك إلى الشريط المتحرك بنجاح.");
      await load();
    } catch {
      setError("تعذر رفع الشعار. تحقق من اتصال التخزين.");
    } finally {
      setBusy(false);
    }
  }

  function beginEdit(partner: SuccessPartner) {
    setEditing(partner.id);
    setEditName(partner.name);
    setEditWebsite(partner.websiteUrl || "");
    setEditFile(null);
    setError("");
    setNotice("");
  }

  async function updatePartner(partner: SuccessPartner, visible = partner.isVisible) {
    if (busy) return;
    const form = new FormData();
    form.set("id", partner.id);
    form.set("name", editing === partner.id ? editName : partner.name);
    form.set("websiteUrl", editing === partner.id ? editWebsite : partner.websiteUrl || "");
    form.set("isVisible", String(visible));
    if (editing === partner.id && editFile) form.set("file", editFile);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/success-partners", { method: "PATCH", body: form, credentials: "include" });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setError(result.message || "تعذر حفظ التعديل.");
        return;
      }
      setEditing(null);
      setEditFile(null);
      setNotice("تم حفظ تعديل الشريك بنجاح.");
      await load();
    } catch {
      setError("تعذر تعديل الشريك حالياً.");
    } finally {
      setBusy(false);
    }
  }

  async function movePartner(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= partners.length || busy) return;
    const ordered = partners.map(p => p.id);
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/success-partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ordered }),
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setError(result.message || "تعذر تعديل الترتيب.");
        return;
      }
      setNotice("تم حفظ ترتيب الشريط المتحرك.");
      await load();
    } catch {
      setError("تعذر حفظ ترتيب الشركاء.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main dir="rtl" className="mx-auto max-w-6xl px-5 py-8 text-[#0D3B34]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-widest text-[#A77A20]">SUPER ADMIN · AREES LOOP</p>
          <h1 className="mt-2 text-3xl font-black">إدارة شركاء النجاح</h1>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-[#0D3B34]/70">
            أضف شعارات شركاء النجاح، وحدد ترتيبها وإظهارها داخل الشريط المتحرك في الصفحة الرئيسية.
            هذه القائمة مستقلة عن طلبات انضمام الشركاء واعتماد خدماتهم.
          </p>
        </div>
        <Link href="/#partners" className="rounded-full border border-[#D4AF37] bg-white px-5 py-3 text-sm font-bold">
          معاينة شركاء النجاح ←
        </Link>
      </div>

      {error && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-800">{notice}</p>}

      <section className="mt-8 rounded-[26px] border border-[#D4AF37]/35 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">إضافة شريك نجاح</h2>
        <p className="mt-2 text-xs leading-6 text-[#0D3B34]/65">صورة الشعار الرسمي PNG أو JPG أو WEBP حتى 3 ميجابايت. يظهر في الموقع بعد الحفظ مباشرة عندما تكون الخدمة متصلة بقاعدة البيانات والتخزين.</p>
        <form onSubmit={addPartner} className="mt-5 grid gap-4 lg:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-semibold">
            اسم الشريك *
            <input required maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="اسم الشريك الرسمي" className="rounded-xl border border-[#D4AF37]/30 bg-[#FDFBF5] px-4 py-3 outline-[#B38A25]" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            الموقع الإلكتروني (اختياري)
            <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" dir="ltr" className="rounded-xl border border-[#D4AF37]/30 bg-[#FDFBF5] px-4 py-3 outline-[#B38A25]" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            صورة الشعار *
            <input id="success-partner-file" required type="file" accept=".png,.jpg,.jpeg,.webp" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full rounded-xl border border-[#D4AF37]/30 bg-[#FDFBF5] px-3 py-2.5 text-sm" />
          </label>
          <div className="lg:col-span-3">
            <button disabled={busy || !name.trim() || !file} type="submit" className="rounded-full bg-[#0D3B34] px-8 py-3.5 font-bold text-white shadow-md transition hover:bg-[#17584D] disabled:cursor-not-allowed disabled:opacity-40">
              {busy ? "جارٍ الحفظ..." : "＋ إضافة الشريك إلى الشريط"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 rounded-[26px] border border-[#D4AF37]/35 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-black">الشركاء في الشريط المتحرك</h2>
          <button type="button" onClick={() => void load()} disabled={loading || busy} className="rounded-full border border-[#D4AF37] px-4 py-2 text-sm font-bold disabled:opacity-40">تحديث القائمة</button>
        </div>
        {loading ? <p className="mt-6 text-sm text-[#0D3B34]/65">جاري تحميل الشركاء...</p> : partners.length === 0 ? <p className="mt-6 text-sm text-[#0D3B34]/65">لا توجد بيانات قابلة للعرض حالياً.</p> : (
          <div className="mt-5 grid gap-4">
            {partners.map((partner, index) => (
              <article key={partner.id} className="flex flex-col gap-4 rounded-[22px] border border-[#D4AF37]/25 bg-[#FDFBF5] p-4 md:flex-row md:items-center">
                <div className="flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#D4AF37]/25 bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={partner.logoUrl} alt={partner.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black">{partner.name}</h3>
                  <p className="mt-1 text-xs text-[#0D3B34]/60">الترتيب: {index + 1} · {partner.isVisible ? "ظاهر للزوار" : "مخفي عن الزوار"}</p>
                  {editing === partner.id && (
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <input aria-label="تعديل اسم الشريك" maxLength={120} value={editName} onChange={e => setEditName(e.target.value)} className="rounded-lg border border-[#D4AF37]/45 px-3 py-2 text-sm" />
                      <input aria-label="تعديل موقع الشريك" type="url" value={editWebsite} onChange={e => setEditWebsite(e.target.value)} placeholder="موقع الشريك (اختياري)" dir="ltr" className="rounded-lg border border-[#D4AF37]/45 px-3 py-2 text-sm" />
                      <label className="text-xs md:col-span-2">استبدال الصورة (اختياري)
                        <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={e => setEditFile(e.target.files?.[0] || null)} className="mt-2 block w-full rounded-lg border border-[#D4AF37]/45 p-2 text-sm" />
                      </label>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button title="تحريك لأعلى" aria-label={`نقل ${partner.name} للأعلى`} disabled={busy || index === 0} onClick={() => void movePartner(index, -1)} className="rounded-xl border border-[#D4AF37]/35 bg-white px-3 py-2 disabled:opacity-30">↑</button>
                  <button title="تحريك لأسفل" aria-label={`نقل ${partner.name} للأسفل`} disabled={busy || index === partners.length - 1} onClick={() => void movePartner(index, 1)} className="rounded-xl border border-[#D4AF37]/35 bg-white px-3 py-2 disabled:opacity-30">↓</button>
                  <button disabled={busy} onClick={() => void updatePartner(partner, !partner.isVisible)} className="rounded-xl border border-[#D4AF37]/35 bg-white px-4 py-2 text-sm font-bold disabled:opacity-40">{partner.isVisible ? "إخفاء" : "إظهار"}</button>
                  {editing === partner.id ? (
                    <>
                      <button disabled={busy || !editName.trim()} onClick={() => void updatePartner(partner)} className="rounded-xl bg-[#0D3B34] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">حفظ</button>
                      <button disabled={busy} onClick={() => setEditing(null)} className="rounded-xl border border-[#D4AF37]/35 px-4 py-2 text-sm">إلغاء</button>
                    </>
                  ) : (
                    <button disabled={busy} onClick={() => beginEdit(partner)} className="rounded-xl bg-[#EDE4CC] px-4 py-2 text-sm font-bold disabled:opacity-40">تعديل</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
