"use client";
import {usePathname} from "next/navigation";
import {useEffect} from "react";
/**
 * Client-only titles for account/admin dashboards that cannot export metadata
 * from their current client components. Public pages use server metadata.
 */
const titles:Record<string,string>={
 "/admin":"لوحة تحكم الإدارة",
 "/admin/dashboard":"لوحة تحكم الإدارة",
 "/admin/customer-reports":"العملاء والتقارير",
 "/admin/bookings":"إدارة الحجوزات",
 "/admin/hotels":"إدارة طلبات الفنادق",
 "/admin/transport":"إدارة طلبات السفر",
 "/admin/transport/flights":"إدارة حجوزات الطيران",
 "/admin/transport/ferries":"إدارة حجوزات البواخر",
 "/admin/transport/visas":"إدارة التأشيرات",
 "/admin/transport/driving-licenses":"إدارة الرخص الدولية",
 "/admin/settings":"إعدادات المنصة",
 "/admin/settings/bank-accounts":"الحسابات البنكية",
 "/admin/services":"مراجعة خدمات الشركاء",
 "/admin/partners":"إدارة الشركاء",
 "/admin/success-partners":"شركاء النجاح",
 "/admin/rewards":"إدارة المكافآت",
 "/admin/users":"المستخدمون والصلاحيات",
 "/admin/navigation":"إدارة التنقل",
 "/admin/login":"تسجيل دخول الإدارة",
 "/partner/dashboard":"لوحة تحكم الشريك",
 "/partner/bookings":"حجوزات الشريك",
 "/partner/services":"خدمات الشريك",
 "/partner/reports":"تقارير الشريك",
 "/partner/settlements":"تسويات الشريك",
 "/partner/invoices":"فواتير الشريك",
 "/partner/contracts":"عقود الشريك",
 "/partner/team":"فريق الشريك",
 "/partner/business":"بيانات المنشأة",
 "/partner/loyalty":"مكافآت الشريك",
 "/partner/coupons":"كوبونات الشريك",
 "/partner/public-events":"فعاليات الشريك",
 "/partner/login":"تسجيل دخول الشركاء",
 "/bookings":"حجوزاتي",
 "/my-requests":"طلباتي",
 "/cart":"سلة الحجوزات",
 "/profile":"حسابي",
 "/favorites":"المفضلة",
 "/notifications":"الإشعارات",
 "/missions":"المهام",
 "/rewards":"المكافآت",
 "/login":"تسجيل الدخول",
 "/auth":"الدخول والتحقق",
 "/onboarding":"بدء استخدام المنصة",
};
const prefixes=[
 ["/admin/transport/confirmed/","تفاصيل الحجز المؤكد"],
 ["/admin/transport/quote/","عرض سعر الرحلة"],
 ["/admin/","لوحة تحكم الإدارة"],
 ["/partner/bookings/","تفاصيل حجز الشريك"],
 ["/partner/services/","تفاصيل خدمات الشريك"],
 ["/partner/","بوابة الشركاء"],
 ["/my-requests/documents/","مستندات الطلب"],
 ["/bookings/","تفاصيل الحجز"],
] as const;
export default function RouteTabTitle(){
 const pathname=usePathname();
 useEffect(()=>{
  const title=titles[pathname]||prefixes.find(([p])=>pathname.startsWith(p))?.[1];
  if(title)document.title=title+" | AREES LOOP";
 },[pathname]);
 return null;
}
