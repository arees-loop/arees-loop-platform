"use client";

import { useEffect, useState } from "react";

type AdminUser={id:string;email:string;firstName:string|null;lastName:string|null;role:string;status:string;adminPermissions:unknown;profileImageUrl?:string|null};

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
 const [open,setOpen]=useState(false);
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [selected,setSelected]=useState<string[]>([]);
 const [sending,setSending]=useState(false);
 const [notice,setNotice]=useState("");
 const [users,setUsers]=useState<AdminUser[]>([]);
 const [actionUserId,setActionUserId]=useState<string|null>(null);
 const [actionNotice,setActionNotice]=useState("");
 async function loadUsers(){try{const r=await fetch("/api/admin/users",{cache:"no-store"});const d=await r.json();if(r.ok&&d.success)setUsers(d.data||[]);}catch{}}
 useEffect(()=>{void loadUsers();},[]);
 const permissionCodes=["PARTNER_REQUESTS","ACTIVE_PARTNERS","CONTENT_EXPERIENCES","BOOKINGS","PAYMENTS_SETTLEMENTS","REPORTS_ANALYTICS","PLATFORM_SETTINGS"];
 async function setUserStatus(userId:string,action:"ACTIVATE"|"DISABLE"){
  setActionNotice("");
  const r=await fetch("/api/admin/users",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId,action})});
  const d=await r.json(); setActionNotice(d.message||"تعذر تنفيذ الإجراء.");
  if(r.ok&&d.success){await loadUsers();setActionUserId(null);}
 }
 async function uploadProfileImage(userId:string,file:File){
  setActionNotice(""); const form=new FormData(); form.append("userId",userId); form.append("file",file);
  const r=await fetch("/api/admin/users/profile-image",{method:"POST",body:form}); const d=await r.json(); setActionNotice(d.message||"تعذر رفع الصورة.");
  if(r.ok&&d.success) await loadUsers();
 }
 async function sendInvite(){
  setNotice(""); setSending(true);
  try{
   const res=await fetch("/api/admin/users/invite",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,permissions:selected})});
   const data=await res.json(); setNotice(data.message||"تعذر إرسال الدعوة.");
   if(res.ok&&data.success){setName("");setEmail("");setSelected([]);await loadUsers();setTimeout(()=>setOpen(false),700);}
  }catch{setNotice("تعذر الاتصال بالخادم.");}
  finally{setSending(false);}
 }
 return <main dir="rtl" className="min-h-screen bg-[#FCFAF5] px-6 py-10 text-[#171717] md:px-10 xl:px-12">
  <div className="mx-auto max-w-[1500px]">
   <div className="flex items-center justify-between gap-4">
    <div><p className="text-xs font-bold tracking-[.18em] text-[#B68A21]">ADMIN ACCESS</p><h1 className="mt-2 text-3xl font-bold">المستخدمين والصلاحيات</h1><p className="mt-2 text-sm text-black/50">إدارة حسابات فريق الإدارة والتحكم في صلاحيات الوصول.</p></div>
    <button onClick={()=>setOpen(true)} className="arees-primary-action rounded-xl border border-[#B68A21] !bg-[#C99A1B] px-6 py-3 text-sm font-extrabold !text-[#073F35] shadow-[0_6px_18px_rgba(182,138,33,.25)] transition hover:!bg-[#B68A21] hover:shadow-[0_8px_22px_rgba(182,138,33,.35)]">+ إضافة مستخدم</button>
   </div>
   <section className="mt-8 w-full overflow-hidden rounded-[26px] border border-[#D8C79D]/45 bg-white/70 shadow-[0_18px_55px_rgba(61,50,25,.07)] backdrop-blur-xl">
    <div className="flex items-center justify-between border-b border-[#D8C79D]/30 bg-gradient-to-l from-[#FBF6EA]/90 to-white/70 px-7 py-5">
     <div><h2 className="text-base font-extrabold text-[#103F38]">فريق الإدارة</h2><p className="mt-1 text-xs text-black/40">{users.length} مستخدم إداري</p></div>
     <div className="rounded-full border border-[#D5B65B]/30 bg-white/70 px-3 py-1.5 text-[11px] font-bold text-[#8D6B16]">AREES LOOP</div>
    </div>
    <div className="hidden grid-cols-[1.25fr_1.55fr_.8fr_.8fr_1.15fr_.3fr] gap-4 border-b border-black/[.045] px-7 py-3.5 text-[11px] font-extrabold text-black/35 md:grid">
     <span>المستخدم</span><span>البريد الإلكتروني</span><span>الدور</span><span>الحالة</span><span>الصلاحيات</span><span></span>
    </div>
    <div className="divide-y divide-[#D8C79D]/25">
     {users.map((user)=>{
      const fullName=[user.firstName,user.lastName].filter(Boolean).join(" ")||"مستخدم إداري";
      const perms=Array.isArray(user.adminPermissions)?user.adminPermissions.length:0;
      const active=user.status==="ACTIVE";
      const initials=fullName.split(" ").filter(Boolean).map(x=>x[0]).slice(0,2).join("").toUpperCase();
      return <div key={user.id} className="group relative grid gap-4 px-7 py-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.006] hover:rounded-[18px] hover:bg-[#FFFDF7] hover:shadow-[0_14px_38px_rgba(182,138,33,.24),0_0_30px_rgba(214,177,78,.20)] md:grid-cols-[1.25fr_1.55fr_.8fr_.8fr_1.15fr_.3fr] md:items-center">
       <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D7BE78]/55 bg-gradient-to-br from-[#FFF9EA] to-[#F1E5C8] text-xs font-black text-[#0D4A40] shadow-sm">{user.profileImageUrl?<img src={user.profileImageUrl} alt={fullName} className="h-full w-full object-cover"/>:<span>{initials}</span>}</div><div><b className="block text-sm text-[#103F38]">{fullName}</b><span className="mt-0.5 block text-[10px] text-black/30">{user.role==="SUPER_ADMIN"?"الإدارة الرئيسية":"فريق الإدارة"}</span></div></div>
       <span className="text-sm text-black/60">{user.email}</span>
       <span><i className="not-italic rounded-full border border-[#D5B65B]/30 bg-[#FBF5E6] px-3 py-1.5 text-[11px] font-extrabold text-[#8D6B16]">{user.role==="SUPER_ADMIN"?"Super Admin":"Admin"}</i></span>
       <span><i className={`inline-flex items-center gap-1.5 not-italic rounded-full px-3 py-1.5 text-[11px] font-bold ${active?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}><i className={`h-1.5 w-1.5 rounded-full ${active?"bg-emerald-500":"bg-amber-500"}`}></i>{active?"نشط":"تم إرسال الدعوة"}</i></span>
       <span className="text-xs font-medium text-black/45">{user.role==="SUPER_ADMIN"?"كامل الصلاحيات":Array.isArray(user.adminPermissions)?user.adminPermissions.map(String).map(x=>x.replace("PARTNER_REQUESTS","طلبات الشركاء").replace("ACTIVE_PARTNERS","الشركاء المعتمدين").replace("CONTENT_EXPERIENCES","المحتوى والتجارب").replace("BOOKINGS","الحجوزات").replace("PAYMENTS_SETTLEMENTS","المدفوعات والتسويات").replace("REPORTS_ANALYTICS","التقارير").replace("PLATFORM_SETTINGS","إعدادات المنصة")).join(" • "):perms+" صلاحيات"}</span>
       <div className="relative">
        <button onClick={()=>setActionUserId(v=>v===user.id?null:user.id)} aria-label="اتخاذ إجراء" title="اتخاذ إجراء" className="flex h-9 items-center justify-center gap-1 rounded-full border border-transparent px-3 text-xs font-extrabold text-[#0D4A40] transition-all hover:border-[#D5B65B]/45 hover:bg-white hover:shadow-[0_5px_18px_rgba(182,138,33,.22)]">•••<span className="hidden xl:inline">اتخاذ إجراء</span></button>
        {actionUserId===user.id&&<div className="absolute left-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-[#D8C79D]/50 bg-white/95 p-1.5 text-right shadow-[0_18px_45px_rgba(50,40,20,.16)] backdrop-blur-xl">
         {user.role==="SUPER_ADMIN"?<>
          <div className="px-3 py-2 text-[11px] font-bold text-[#8D6B16]">Super Admin</div>
          <button disabled className="w-full cursor-not-allowed rounded-xl px-3 py-2.5 text-right text-xs text-black/35">كامل الصلاحيات — محمي</button>
         </>:<>
          <label className="block w-full cursor-pointer rounded-xl px-3 py-2.5 text-right text-xs font-bold text-[#103F38] hover:bg-[#FBF5E6]">تغيير الصورة الشخصية<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>{const file=e.target.files?.[0];if(file)void uploadProfileImage(user.id,file)}}/></label>
          <button className="w-full rounded-xl px-3 py-2.5 text-right text-xs font-bold text-[#103F38] hover:bg-[#FBF5E6]">تعديل الصلاحيات</button>
          {!active&&<button className="w-full rounded-xl px-3 py-2.5 text-right text-xs font-bold text-[#103F38] hover:bg-[#FBF5E6]">إعادة إرسال الدعوة</button>}
          <div className="my-1 border-t border-black/[.06]"/>
          {active?<button onClick={()=>void setUserStatus(user.id,"DISABLE")} className="w-full rounded-xl px-3 py-2.5 text-right text-xs font-bold text-red-600 hover:bg-red-50">تعطيل المستخدم</button>:<button onClick={()=>void setUserStatus(user.id,"ACTIVATE")} className="w-full rounded-xl px-3 py-2.5 text-right text-xs font-bold text-emerald-700 hover:bg-emerald-50">تنشيط المستخدم</button>}
         </>}
        </div>}
       </div>
      </div>
     })}
     {users.length===0&&<div className="px-7 py-12 text-center text-sm text-black/35">لا يوجد مستخدمين إداريين لعرضهم.</div>}
    </div>
   </section>
   {actionNotice&&<div className="mt-4 rounded-xl border border-[#D8C79D]/40 bg-white px-5 py-3 text-xs font-bold text-[#103F38]">{actionNotice}</div>}
   <div className="mt-4 rounded-xl bg-[#F7F0E2] px-5 py-4 text-xs text-black/55">الـ Super Admin يملك كامل الصلاحيات. الأدمن العادي تظهر له فقط الأقسام الممنوحة له.</div>
  </div>
  {open&&<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm" onClick={()=>setOpen(false)}>
   <div onClick={e=>e.stopPropagation()} className="w-full max-w-2xl rounded-[24px] bg-white p-7 shadow-2xl">
    <div className="flex items-start justify-between"><div><h2 className="text-2xl font-bold">إضافة مستخدم إداري</h2><p className="mt-1 text-sm text-black/45">سيتم إرسال دعوة إلى البريد الإلكتروني لإنشاء كلمة المرور وتفعيل الحساب.</p></div><button onClick={()=>setOpen(false)} className="text-2xl text-black/40">×</button></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">الاسم<input className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal outline-none focus:border-[#B68A21]" placeholder="اسم الموظف" value={name} onChange={e=>setName(e.target.value)}/></label><label className="text-sm font-bold">البريد الإلكتروني<input type="email" className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-normal outline-none focus:border-[#B68A21]" placeholder="name@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></label></div>
    <div className="mt-6"><p className="text-sm font-bold">الصلاحيات</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{permissions.map(([name,desc])=><label key={name} className="group flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 bg-[#FCFAF5] px-4 py-3 transition-all duration-200 hover:border-[#B68A21] hover:bg-[#D7A928] hover:shadow-sm"><input type="checkbox" checked={selected.includes(permissionCodes[permissions.findIndex(p=>p[0]===name)])} onChange={()=>{const code=permissionCodes[permissions.findIndex(p=>p[0]===name)];setSelected(v=>v.includes(code)?v.filter(x=>x!==code):[...v,code])}} className="mt-1 accent-[#B68A21]"/><span><b className="block text-sm text-[#073F35]">{name}</b><small className="mt-1 block leading-5 text-black/50 group-hover:text-[#073F35]">{desc}</small></span></label>)}</div></div>
    {notice&&<p className={`mt-4 text-sm font-bold ${notice.includes("بنجاح")?"text-emerald-700":"text-red-600"}`}>{notice}</p>}<div className="mt-7 flex gap-3"><button onClick={sendInvite} disabled={sending} className="arees-primary-action rounded-xl border border-[#B68A21] !bg-[#C99A1B] px-7 py-3 text-sm font-extrabold !text-[#073F35] shadow-[0_6px_18px_rgba(182,138,33,.25)] transition hover:!bg-[#B68A21] disabled:opacity-50">{sending?"جاري الإرسال...":"إرسال الدعوة"}</button><button onClick={()=>setOpen(false)} className="rounded-xl border border-black/10 px-6 py-3 text-sm font-bold">إلغاء</button></div>
   </div>
  </div>}
 </main>
}