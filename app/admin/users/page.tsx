"use client";

import { useState } from "react";

const permissions=[
 ["طلبات الشركاء","عرض طلبات الانضمام، مراجعة بيانات الشريك وطلب الاستكمال."],
 ["الشركاء المعتمدين","عرض الشركاء النشطين ومتابعة حالة حساباتهم."],
 ["المحتوى والتجارب","مراجعة وإدارة التجارب والخدمات المقدمة على المنصة."],
 ["الحجوزات","عرض الحجوزات ومتابعة حالتها وبيانات التنفيذ."],
 ["المدفوعات والتسويات","عرض المدفوعات والتسويات المالية للشركاء."],
 ["التقارير والإحصائيات","الوصول إلى التقارير ومؤشرات أداء المنصة."],
 ["إعدادات المنصة","تعديل إعدادات المنصة العامة؛ تمنح فقط للمخولين."]
];

export default function AdminUsersPage(){
 const [open,setOpen]=useState(false);\n const [name,setName]=useState("");\n const [email,setEmail]=useState("");\n const [selected,setSelected]=useState<string[]>([]);\n const [sending,setSending]=useState(false);\n const [notice,setNotice]=useState("");\n const permissionCodes=["PARTNER_REQUESTS","ACTIVE_PARTNERS","CONTENT_EXPERIENCES","BOOKINGS","PAYMENTS_SETTLEMENTS","REPORTS_ANALYTICS","PLATFORM_SETTINGS"];\n async function sendInvite(){\n  setNotice(""); setSending(true);\n  try{\n   const res=await fetch("/api/admin/users/invite",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,permissions:selected})});\n   const data=await res.json(); setNotice(data.message||"تعذر إرسال الدعوة.");\n   if(res.ok&&data.success){setName("");setEmail("");setSelected([]);}\n  }catch{setNotice("تعذر الاتصال بالخادم.");}\n  finally{setSending(false);}\n }
 return <main dir="rtl" className="min-h-screen bg-[#FCFAF5] px-6 py-10 text-[#171717] md:px-10 xl:px-12">
  <div className="mx-auto max-w-[1500px]">
   <div className="flex items-center justify-between gap-4">
    <div><p className="text-xs font-bold tracking-[.18em] text-[#B68A21]">ADMIN ACCESS</p><h1 className="mt-2 text-3xl font-bold">المستخدمين والصلاحيات</h1><p className="mt-2 text-sm text-black/50">إدارة حسابات فريق الإدارة والتحكم في صلاحيات الوصول.</p></div>
    <button onClick={()=>setOpen(true)} className="rounded-xl border border-[#B68A21] !bg-[#C99A1B] px-6 py-3 text-sm font-extrabold !text-[#073F35] shadow-[0_6px_18px_rgba(182,138,33,.25)] transition hover:!bg-[#B68A21] hover:shadow-[0_8px_22px_rgba(182,138,33,.35)]">+ إضافة مستخدم</button>
   </div>
   <section className="mt-8 max-w-5xl overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_10px_30px_rgba(70,60,40,.06)]">
    <div className="grid grid-cols-[1.4fr_1.5fr_.8fr_.8fr_.5fr] items-center gap-3 border-b border-black/5 bg-[#FFFCF6] px-6 py-4 text-xs font-bold text-black/45"><span>المستخدم</span><span>البريد الإلكتروني</span><span>الدور</span><span>الحالة</span><span>إجراءات</span></div>
    <div className="grid grid-cols-[1.4fr_1.5fr_.8fr_.8fr_.5fr] items-center gap-3 px-6 py-5 text-sm"><b className="whitespace-nowrap">Arees Admin</b><span className="whitespace-nowrap">admin@areesloop.com</span><span className="whitespace-nowrap font-bold text-[#B68A21]">Super Admin</span><span><i className="not-italic rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">نشط</i></span><button className="text-xl">•••</button></div>
   </section>
   <div className="mt-4 rounded-xl bg-[#F7F0E2] px-5 py-4 text-xs text-black/55">الـ Super Admin يملك كامل الصلاحيات. الأدمن العادي تظهر له فقط الأقسام الممنوحة له.</div>
  </div>
  {open&&<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm" onClick={()=>setOpen(false)}>
   <div onClick={e=>e.stopPropagation()} className="w-full max-w-2xl rounded-[24px] bg-white p-7 shadow-2xl">
    <div className="flex items-start justify-between"><div><h2 className="text-2xl font-bold">إضافة مستخدم إداري</h2><p className="mt-1 text-sm text-black/45">سيتم إرسال دعوة إلى البريد الإلكتروني لإنشاء كلمة المرور وتفعيل الحساب.</p></div><button onClick={()=>setOpen(false)} className="text-2xl text-black/40">×</button></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">الاسم<input className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal outline-none focus:border-[#B68A21]" placeholder="اسم الموظف" value={name} onChange={e=>setName(e.target.value)}/></label><label className="text-sm font-bold">البريد الإلكتروني<input type="email" className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal outline-none focus:border-[#B68A21]" placeholder="name@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></label></div>
    <div className="mt-6"><p className="text-sm font-bold">الصلاحيات</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{permissions.map(([name,desc])=><label key={name} className="group flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 bg-[#FCFAF5] px-4 py-3 transition-all duration-200 hover:border-[#B68A21] hover:bg-[#D7A928] hover:shadow-sm"><input type="checkbox" checked={selected.includes(permissionCodes[permissions.findIndex(p=>p[0]===name)])} onChange={()=>{const code=permissionCodes[permissions.findIndex(p=>p[0]===name)];setSelected(v=>v.includes(code)?v.filter(x=>x!==code):[...v,code])}} className="mt-1 accent-[#B68A21]"/><span><b className="block text-sm text-[#073F35]">{name}</b><small className="mt-1 block leading-5 text-black/50 group-hover:text-[#073F35]">{desc}</small></span></label>)}</div></div>
    {notice&&<p className={`mt-4 text-sm font-bold ${notice.includes("بنجاح")?"text-emerald-700":"text-red-600"}`}>{notice}</p>}<div className="mt-7 flex gap-3"><button onClick={sendInvite} disabled={sending} className="rounded-xl border border-[#B68A21] !bg-[#C99A1B] px-7 py-3 text-sm font-extrabold !text-[#073F35] shadow-[0_6px_18px_rgba(182,138,33,.25)] transition hover:!bg-[#B68A21] disabled:opacity-50">{sending?"جاري الإرسال...":"إرسال الدعوة"}</button><button onClick={()=>setOpen(false)} className="rounded-xl border border-black/10 px-6 py-3 text-sm font-bold">إلغاء</button></div>
   </div>
  </div>}
 </main>
}