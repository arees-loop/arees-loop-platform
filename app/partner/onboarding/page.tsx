import type { Metadata } from "next";
import { Suspense } from "react";
import PartnerOnboardingClient from "./PartnerOnboardingClient";
import { buildPageMetadata } from "@/lib/seo-metadata";
type Props={searchParams:Promise<{type?:string}>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{
 const {type}=await searchParams,individual=type==="individual",government=type==="government";
 const title=individual?"سجّل كفرد وحرفي محلي":government?"سجّل كجهة حكومية":"انضم كشريك في أريس لوب";
 const description=individual?"اعرض منتجاتك وأعمالك الحرفية المحلية للزوار، واستقبل طلبات المهتمين عبر منصة أريس لوب.":government?"أبرزوا وجهاتكم وفعالياتكم الرسمية، ووسّعوا وصولها للزوار عبر أريس لوب. مسار مخصص للجهات الحكومية وغير الربحية.":"ابدأ تسجيل منشأتك كشريك سياحي، وأدرج خدماتك وتجاربك أمام زوار المملكة.";
 const path=individual?"/partner/onboarding?type=individual":government?"/partner/onboarding?type=government":"/partner/onboarding";
 const image=individual?"/Image/social/arees-individual-share.webp":government?"/api/og/partner?type=government":"/Image/social/arees-partner-share.webp";
 return buildPageMetadata({title,description,path,image,imageWidth:government?1200:1254,imageHeight:government?630:1254,imageType:government?"image/png":"image/webp",imageAlt:individual?"سجّل كفرد وحرفي محلي في أريس لوب":government?"الجهات الحكومية وغير الربحية في أريس لوب":"سجّل كشريك في أريس لوب"});
}
export default function PartnerOnboardingPage(){return <Suspense fallback={<main dir="rtl" className="min-h-screen bg-[#F7F4ED] pt-32 text-center">جاري تحميل نموذج التسجيل...</main>}><PartnerOnboardingClient/></Suspense>;}
