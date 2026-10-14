import type { Metadata } from "next";
import { Suspense } from "react";
import PartnerOnboardingClient from "./PartnerOnboardingClient";
import { buildPageMetadata } from "@/lib/seo-metadata";
type Props={searchParams:Promise<{type?:string}>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
 const {type}=await searchParams,individual=type==="individual";
 return buildPageMetadata({title:individual?"سجّل كفرد وحرفي محلي":"انضم كشريك في أريس لوب",description:individual?"اعرض منتجاتك وأعمالك الحرفية المحلية للزوار، واستقبل الطلبات عبر منصة أريس لوب.":"ابدأ تسجيل منشأتك كشريك سياحي، وأدرج خدماتك وتجاربك أمام زوار المملكة.",path:individual?"/partner/onboarding?type=individual":"/partner/onboarding",image:individual?"/Image/social/arees-individual-share.webp":"/Image/social/arees-partner-share.webp",imageWidth:1254,imageHeight:1254,imageType:"image/webp",imageAlt:individual?"سجّل كفرد وحرفي محلي في أريس لوب":"سجّل كشريك في أريس لوب"});
}
export default function PartnerOnboardingPage(){return <Suspense fallback={<main dir="rtl" className="min-h-screen bg-[#F7F4ED] pt-32 text-center">جاري تحميل نموذج التسجيل...</main>}><PartnerOnboardingClient/></Suspense>;}
