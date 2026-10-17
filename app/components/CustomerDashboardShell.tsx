"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import type {ReactNode} from "react";
const links=[
 {href:"/my-requests",icon:"📋",name:"طلباتي"},
 {href:"/bookings",icon:"🎫",name:"حجوزاتي"},
 {href:"/cart",icon:"🛒",name:"سلة الحجوزات"},
 {href:"/notifications",icon:"🔔",name:"الإشعارات"},
 {href:"/profile",icon:"👤",name:"حسابي"},
];
export default function CustomerDashboardShell({children}:{children:ReactNode}){
 const pathname=usePathname();
 return <div dir="rtl" className="min-h-screen bg-[#F7F4ED] px-3 pb-16 pt-28 text-[#0D3B34] md:px-6">
  <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-[245px_minmax(0,1fr)]">
   <aside className="self-start rounded-2xl border border-[#D4AF37]/25 bg-white p-4 shadow-sm lg:sticky lg:top-28">
    <div className="mb-4 border-b border-[#D4AF37]/20 pb-4"><p className="text-[10px] font-black tracking-widest text-[#A78231]">AREES LOOP</p><h2 className="mt-2 text-lg font-black">لوحة تحكم العميل</h2><p className="mt-1 text-xs text-[#0D3B34]/60">إدارة طلباتك وخدماتك</p></div>
    <nav aria-label="قائمة حساب العميل" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">{links.map(link=><Link key={link.href} href={link.href} aria-current={pathname===link.href?"page":undefined} className={`flex items-center gap-2 rounded-xl px-3 py-3 text-xs font-bold transition ${pathname===link.href?"bg-[#FFF1C9] text-[#0D3B34]":"hover:bg-[#F7F4ED]"}`}><span aria-hidden="true">{link.icon}</span>{link.name}</Link>)}</nav>
   </aside>
   <div className="min-w-0">{children}</div>
  </div>
 </div>;
}
