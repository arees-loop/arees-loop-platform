import LicensedTravelOperator from "@/app/components/LicensedTravelOperator";
import type { Metadata } from "next";
import RequestServicePage from "@/app/components/RequestServicePage";
import { buildPageMetadata } from "@/lib/seo-metadata";
export const metadata: Metadata = buildPageMetadata({title:"رخصة القيادة الدولية",description:"قدّم طلب إصدار رخصة القيادة الدولية مع أريس لوب، وتعرّف على خطوات الطلب والمتطلبات التي تنطبق على وجهتك.",path:"/international-driving-license",image:"/Image/social/arees-international-driving-license.webp",imageWidth:1254,imageHeight:1254,imageType:"image/webp",imageAlt:"رخصة القيادة الدولية من أريس لوب"});
export default function InternationalDrivingLicensePage(){return <><RequestServicePage kind="DRIVING_LICENSE"/><LicensedTravelOperator/></>;}
