"use client";

import { useEffect, useState, type FormEvent } from "react";

type PermissionKey = "dashboard" | "bookings" | "services" | "coupons" | "loyalty" | "settlements" | "invoices" | "reports" | "business";
type PermissionSet = Record<PermissionKey, boolean>;
type Member = { id: string; userId: string; jobTitle: string | null; permissions: PermissionSet; isActive: boolean; isOwner: boolean; invitationPending?: boolean; user: { firstName: string | null; lastName: string | null; email: string; phone: string | null } };
const permissionOptions: Array<[PermissionKey, string]> = [
  ["dashboard", "الرئيسية"], ["bookings", "الحجوزات"], ["services", "الخدمات"],
  ["coupons", "الكوبونات"], ["loyalty", "النقاط والمكافآت"], ["settlements", "التسويات"],
  ["invoices", "الفواتير"], ["reports", "التقارير"], ["business", "المنشأة والتراخيص"],
];
const blankPermissions = (): PermissionSet => ({ dashboard:false, bookings:false, services:false, coupons:false, loyalty:false, settlements:false, invoices:false, reports:false, business:false });

export default function PartnerTeamManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [permissions, setPermissions] = useState<PermissionSet>(blankPermissions);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<PermissionSet>(blankPermissions);
  const [editTitle, setEditTitle] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const response = await fetch("/api/partner/team", { credentials: "include", cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success) throw new Error(data?.message || "تعذر تحميل الموظفين.");
    setMembers(data.members || []);
  }
  useEffect(() => { refresh().catch((e) => setError(e.message)); }, []);

  function toggle(key: PermissionKey) { setPermissions((current) => ({ ...current, [key]: !current[key] })); }
  function toggleEdit(key: PermissionKey) { setEditPermissions((current) => ({ ...current, [key]: !current[key] })); }
  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/partner/team", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email, jobTitle, permissions }) });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.message || "تعذرت إضافة الموظف.");
      setEmail(""); setJobTitle(""); setPermissions(blankPermissions()); setNotice(data.message || "تمت إضافة الموظف بالصلاحيات المحددة."); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذرت إضافة الموظف."); }
    finally { setBusy(false); }
  }
  async function saveMember(member: Member, patch?: { isActive?: boolean }) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/partner/team", { method:"PATCH", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify(patch ? { id:member.id, ...patch } : { id:member.id, jobTitle:editTitle, permissions:editPermissions, isActive:member.isActive }) });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.message || "تعذر حفظ التعديلات.");
      setEditing(null); setNotice("تم حفظ صلاحيات الموظف."); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر حفظ التعديلات."); }
    finally { setBusy(false); }
  }

  return <section className="mt-6 space-y-5">
    <div className="rounded-3xl border border-[#D4AF37]/30 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">إضافة موظف</h2>
      <p className="mt-2 text-sm leading-7 text-[#0D3B34]/70">أدخل بريد الموظف وحدد الصفحات التي يحتاجها. إذا ما عنده حساب، حنرسل ليه رابطاً يؤكد به بريده ويختار كلمة مروره بنفسه. الصلاحيات الجديدة تكون مغلقة افتراضياً.</p>
      <form onSubmit={addMember} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold">البريد الإلكتروني<input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 bg-[#FCFAF4] p-3 font-normal" placeholder="employee@example.com" dir="ltr" /></label>
        <label className="text-sm font-bold">المسمى الوظيفي<input maxLength={100} value={jobTitle} onChange={(e)=>setJobTitle(e.target.value)} className="mt-2 w-full rounded-xl border border-[#0D3B34]/15 bg-[#FCFAF4] p-3 font-normal" placeholder="مثال: مسؤول حجوزات" /></label>
        <fieldset className="md:col-span-2"><legend className="mb-2 text-sm font-bold">صلاحيات الوصول</legend><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{permissionOptions.map(([key,label])=><label key={key} className="flex items-center gap-2 rounded-xl border border-[#0D3B34]/10 bg-[#FCFAF4] px-3 py-2.5 text-sm"><input type="checkbox" checked={permissions[key]} onChange={()=>toggle(key)} className="accent-[#0D3B34]" />{label}</label>)}</div></fieldset>
        <div className="md:col-span-2"><button disabled={busy} className="rounded-full bg-[#0D3B34] px-7 py-3 font-bold text-white disabled:opacity-50">{busy?"جارٍ الحفظ...":"إضافة الموظف"}</button></div>
      </form>
    </div>

    {error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">{error}</p>}
    {notice&&<p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800">{notice}</p>}
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm"><div className="border-b border-black/5 px-5 py-4"><h2 className="font-bold">الموظفون المرتبطون بالمنشأة</h2></div>{members.length===0?<p className="p-6 text-sm text-[#0D3B34]/60">ما تمت إضافة موظفين حتى الآن.</p>:<div className="divide-y divide-black/5">{members.map((member)=><article key={member.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{[member.user.firstName,member.user.lastName].filter(Boolean).join(" ")||member.user.email}</p><p dir="ltr" className="mt-1 text-right text-sm text-[#0D3B34]/65">{member.user.email}{member.user.phone?` · ${member.user.phone}`:""}</p><p className="mt-1 text-xs text-[#0D3B34]/65">{member.jobTitle||"بدون مسمى"} · {member.invitationPending?"بانتظار تفعيل الدعوة":member.isActive?"نشط":"موقوف"}{member.isOwner?" · مالك/مدير":""}</p></div>{!member.isOwner&&!member.invitationPending&&<div className="flex gap-2"><button type="button" onClick={()=>{setEditing(editing===member.id?null:member.id);setEditPermissions(member.permissions||blankPermissions());setEditTitle(member.jobTitle||"");}} className="rounded-full border border-[#B99124]/45 px-4 py-2 text-xs font-bold">{editing===member.id?"إغلاق التعديل":"تعديل الصلاحيات"}</button><button type="button" disabled={busy} onClick={()=>void saveMember(member,{ isActive:!member.isActive })} className="rounded-full border border-[#0D3B34]/20 px-4 py-2 text-xs font-bold disabled:opacity-50">{member.isActive?"إيقاف الوصول":"إعادة التفعيل"}</button></div>}</div>{editing===member.id&&!member.isOwner&&!member.invitationPending&&<div className="mt-4 rounded-2xl bg-[#F7F4ED] p-4"><label className="text-xs font-bold">المسمى الوظيفي<input value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} maxLength={100} className="mt-2 w-full rounded-lg border border-[#0D3B34]/15 bg-white p-2.5 text-sm font-normal" /></label><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{permissionOptions.map(([key,label])=><label key={key} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm"><input type="checkbox" checked={editPermissions[key]} onChange={()=>toggleEdit(key)} className="accent-[#0D3B34]" />{label}</label>)}</div><button type="button" disabled={busy} onClick={()=>void saveMember(member)} className="mt-4 rounded-full bg-[#0D3B34] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">حفظ التعديلات</button></div>}</article>)}</div>}</div>
  </section>;
}
