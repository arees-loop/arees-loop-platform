import type {Metadata} from "next";
import {buildPageMetadata} from "@/lib/seo-metadata";
import ProgramsListing from "../ProgramsListing";
export const dynamic="force-dynamic";
export const metadata:Metadata=buildPageMetadata({
 title:"البرامج السياحية المحلية داخل السعودية",
 description:"استكشف التجارب والخدمات السياحية المنشورة داخل المملكة العربية السعودية عبر أريس لوب مع روابط مباشرة لتفاصيل كل برنامج.",
 path:"/programs/local",image:"/api/og/discover?type=domestic",imageWidth:1200,imageHeight:630,imageType:"image/png",
 imageAlt:"البرامج السياحية المحلية في السعودية — أريس لوب"
});
export default function LocalPrograms(){return <ProgramsListing scope="local" title="البرامج السياحية المحلية في السعودية" intro="من التراث والثقافة إلى الأنشطة والجولات، اكتشف التجارب والخدمات المعتمدة المنشورة داخل المملكة، وتعرّف على كل برنامج قبل إرسال الطلب." banner="/Image/hero/alula.jpg"/>;}
