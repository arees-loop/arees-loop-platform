import type { Metadata } from "next";
import InternationalLicenseForm from "@/app/components/InternationalLicenseForm";
import { buildPageMetadata } from "@/lib/seo-metadata";
export const metadata: Metadata = buildPageMetadata({title:"استخراج رخصة قيادة دولية مع التوصيل",description:"اطلب رخصة قيادة دولية عبر أريس لوب مع خدمة التوصيل. راجع شروط الأهلية والوثائق المطلوبة ومدة الإصدار قبل إرسال الطلب.",path:"/international-driving-license",image:"/Image/social/arees-international-driving-license.webp",imageWidth:1254,imageHeight:1254,imageType:"image/webp",imageAlt:"رخصة القيادة الدولية من أريس لوب"});
export default function InternationalDrivingLicensePage(){return <InternationalLicenseForm/>;}
