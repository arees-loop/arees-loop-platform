"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const items = [
  ["/partner/dashboard","⌂","الرئيسية"],
  ["/partner/bookings","▣","الحجوزات"],
  ["/partner/services","◈","الخدمات"],
  ["/partner/settlements","﷼","التسويات"],
  ["/partner/invoices","▤","الفواتير"],
  ["/partner/reports","◫","التقارير"],
  ["/partner/team","◎","الموظفون والصلاحيات"],
  ["/partner/business","◇","المنشأة والتراخيص"],
  ["/partner/contracts/current","✓","الاتفاقيات والعقود"],
] as const;

export default function PartnerShell({children}:{children:ReactNode}) {
  const pathname=usePathname();
  const [open,setOpen]=useState(true);
  const [account,setAccount]=useState(false);
  const [partner,setPartner]=useState<{tradeName:string;email:string;status:string}>({tradeName:"جاري تحميل بيانات الشريك...",email:"",status:""});
  useEffect(()=>{let alive=true;fetch("/api/partner/application",{credentials:"include",cache:"no-store"}).then(r=>r.json()).then(data=>{if(!alive)return;const p=data?.application;if(p){setPartner({tradeName:p.tradeNameAr||p.legalNameAr||p.publicName||"شريك Arees Loop",email:p.businessEmail||p.mainContactEmail||"",status:p.status||""});}}).catch(()=>{});return()=>{alive=false};},[]);
  return <div dir="rtl" className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]" style={{fontFamily:"var(--font-ibm-plex-arabic), sans-serif"}}>
    <div className="flex min-h-screen">
      <aside className={`hidden shrink-0 border-l border-[#0D3B34]/8 bg-[#F9F7F0]/95 transition-all duration-300 xl:block ${open?"w-[235px] p-3":"w-[72px] p-2"}`}>
        <div className={`mb-5 py-2 ${open?"px-3":"px-0 text-center"}`}><p className="text-[10px] font-bold tracking-[.18em] text-[#B99124]">{open?"AREES LOOP PARTNER":"AL"}</p>{open&&<h2 className="mt-2 text-lg font-bold">لوحة الشريك</h2>}</div>
        <nav className="space-y-2">{items.map(([href,icon,label])=>{const active=pathname===href||pathname.startsWith(href+"/");return <Link key={href} href={href} title={!open?label:undefined} className={`flex items-center ${open?"gap-3 px-4":"justify-center px-2"} rounded-2xl py-3 text-sm font-bold transition ${active?"bg-[#0D3B34] text-white":"text-[#0D3B34]/65 hover:bg-white"}`}><span className={`shrink-0 text-base ${active?"text-[#E6C24D]":""}`}>{icon}</span>{open&&<span>{label}</span>}</Link>})}</nav>
        {open&&<div className="mt-8 rounded-[22px] bg-[#0D3B34] p-4 text-white"><p className="text-[10px] font-bold tracking-[.16em] text-[#E6C24D]">ACCOUNT STATUS</p><p className="mt-2 text-sm font-bold">{partner.status==="ACTIVE"?"معتمد ونشط":partner.status||"حساب الشريك"}</p><p className="mt-2 text-xs leading-6 text-white/50">الخدمات الجديدة تخضع للمراجعة قبل النشر.</p></div>}
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-50 border-b border-[#0D3B34]/8 bg-[#F9F7F0]/95 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-5 py-3 md:px-8">
            <div className="relative"><button type="button" onClick={()=>setAccount(v=>!v)} className="flex items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-white"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D3B34] font-bold text-[#D4AF37]">ت</span><span className="hidden text-right sm:block"><b className="block text-sm">{partner.tradeName}</b><small className="text-[10px] text-[#0D3B34]/45">{partner.email}</small></span><span>⌄</span></button>{account&&<div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-[#0D3B34]/10 bg-white p-2 shadow-lg"><Link href="/partner/profile" className="block rounded-xl px-4 py-3 text-xs font-bold hover:bg-[#F7F4EA]">الملف الشخصي</Link><Link href="/partner/logout" className="block rounded-xl px-4 py-3 text-xs font-bold text-red-700 hover:bg-red-50">تسجيل الخروج</Link></div>}</div>
            <div className="hidden rounded-full bg-[#0D3B34] px-5 py-2.5 text-[10px] font-bold tracking-[.14em] text-[#E6C24D] md:block">AREES LOOP PARTNER</div>
            <div className="flex items-center gap-2"><Link href="/" className="rounded-full border border-[#0D3B34]/10 bg-white px-4 py-2.5 text-xs font-semibold">العودة للمنصة</Link><button type="button" onClick={()=>setOpen(v=>!v)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D3B34] text-white" title={open?"إخفاء القائمة":"إظهار القائمة"} aria-label={open?"طي القائمة الجانبية":"فتح القائمة الجانبية"}>{open?"◀":"▶"}</button></div>
          </div>
        </header>
        <div className="partner-shell-content min-w-0">{children}</div>
        <style jsx global>{`
          .partner-shell-content > main > .relative.z-10.flex.min-h-screen > aside { display:none !important; }
          .partner-shell-content > main > .relative.z-10.flex.min-h-screen { display:block !important; min-height:auto !important; }
          .partner-shell-content > main > .relative.z-10.flex.min-h-screen > .min-w-0.flex-1 > header { display:none !important; }
          .partner-shell-content > main { min-height:calc(100vh - 65px) !important; }
        `}</style>
      </div>
    </div>
  </div>;
}
