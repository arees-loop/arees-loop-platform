import type { Metadata } from "next";
import RequestServicePage from "@/app/components/RequestServicePage";
import { buildPageMetadata } from "@/lib/seo-metadata";
export const metadata: Metadata = buildPageMetadata({title:"رخصة القيادة الدولية",description:"قدّم طلب إصدار رخصة القيادة الدولية مع أريس لوب، وتعرّف على خطوات الطلب والمتطلبات التي تنطبق على وجهتك.",path:"/international-driving-license",image:"/Image/social/arees-loop-whatsapp-preview.png",imageWidth:1734,imageHeight:907,imageType:"image/png",imageAlt:"خدمات أريس لوب السياحية"});
export default function InternationalDrivingLicensePage(){return <RequestServicePage kind="DRIVING_LICENSE"/>;}
