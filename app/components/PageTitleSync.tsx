"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";

// Client titles for private app routes with client-only pages. Public SEO uses
// server-rendered metadata instead; do not overwrite a public page's metadata.
const titles:Record<string,string>={
 "/admin":"لوحة تحكم الإدارة",
 "/admin/dashboard":"لوحة تحكم الإدارة",
 "/admin/login":"دخول الإدارة",
 "/admin/customer-reports":"العملاء والتقارير",
 "/admin/hotels":"إدارة طلبات الفنادق",
 "/admin/transport":"إدارة خدمات السفر",
 "/admin/transport/flights":"إدارة حجوزات الطيران",
 "/admin/transport/ferries":"إدارة حجوزات البواخر",
 "/admin/transport/visas":"إدارة التأشيرات",
 "/admin/transport/driving-licenses":"إدارة الرخص الدولية",
 "/admin/services":"مراجعة الخدمات",
 "/admin/bookings":"إدارة الحجوزات",
 "/admin/success-partners":"شركاء النجاح",
 "/admin/partners":"الشركاء",
 "/admin/settings":"إدارة المنصة",
 "/admin/settings/bank-accounts":"الحسابات البنكية",
 "/admin/navigation":"القائمة والروابط",
 "/admin/rewards":"نظام المكافآت",
 "/admin/users":"المستخدمون والصلاحيات",
 "/admin/invite":"دعوات الإدارة",
 "/partner":"بوابة الشركاء",
 "/partner/dashboard":"لوحة الشريك",
 "/partner/bookings":"حجوزات الشريك",
 "/partner/services":"خدمات الشريك",
 "/partner/reports":"تقارير الشريك",
 "/partner/contracts":"عقود الشريك",
 "/partner/settlements":"تسويات الشريك",
 "/partner/invoices":"فواتير الشريك",
 "/partner/coupons":"قسائم الشريك",
 "/partner/business":"بيانات المنشأة",
 "/partner/team":"فريق الشريك",
 "/partner/loyalty":"المكافآت",
 "/partner/public-events":"فعاليات الشريك",
 "/partner/login":"دخول الشركاء",
 "/partner/onboarding":"انضمام الشركاء",
 "/login":"تسجيل الدخول",
 "/auth":"الدخول والتحقق",
 "/profile":"حسابي",
 "/my-requests":"طلباتي",
 "/bookings":"حجوزاتي",
 "/cart":"سلة الحجوزات",
 "/favorites":"المفضلة",
 "/notifications":"الإشعارات",
 "/onboarding":"إنشاء حساب",
 "/missions":"مهامي",
 "/map-test":"تجربة الخريطة",
 "/sd":"خدمات السودان",
};
function routeTitle(path:string):string|null{
 if(titles[path])return titles[path];
 if(path.startsWith("/admin/transport/quote/"))return "عرض السعر — إدارة الطلبات";
 if(path.startsWith("/admin/transport/confirmed/"))return "تفاصيل الحجز المؤكد — الإدارة";
 if(path.startsWith("/admin/"))return titles[Object.keys(titles).filter(k=>k.startsWith("/admin/")&&path.startsWith(k+"/")).sort((a,b)=>b.length-a.length)[0]]||"لوحة تحكم الإدارة";
 if(path.startsWith("/partner/"))return titles[Object.keys(titles).filter(k=>k.startsWith("/partner/")&&path.startsWith(k+"/")).sort((a,b)=>b.length-a.length)[0]]||"بوابة الشركاء";
 if(path.startsWith("/my-requests/"))return "مستندات طلباتي";
 if(path.startsWith("/bookings/"))return "تفاصيل حجزي";
 return null;
}
export default function PageTitleSync(){
 const pathname=usePathname();
 useEffect(()=>{
  const title=routeTitle(pathname||"/");
  if(title)document.title=title+" | AREES LOOP";
 },[pathname]);
 return null;
}
