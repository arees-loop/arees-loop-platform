import type { Metadata } from "next";
import LoginClient from "./LoginClient";
import { buildPageMetadata } from "@/lib/seo-metadata";
export const metadata: Metadata = buildPageMetadata({title:"سجّل كعميل في أريس لوب",description:"أنشئ حسابك أو سجّل الدخول لتكتشف الرحلات والخدمات السياحية وتتابع طلباتك وحجوزاتك.",path:"/login",image:"/Image/social/arees-customer-share.webp",imageWidth:1254,imageHeight:1254,imageType:"image/webp",imageAlt:"ابدأ تجربتك كعميل في أريس لوب"});
export default function LoginPage(){return <LoginClient/>;}
