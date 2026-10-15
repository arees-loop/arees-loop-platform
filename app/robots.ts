import type {MetadataRoute} from "next";
const SITE_URL="https://www.areesloop.com";
export default function robots():MetadataRoute.Robots{
 if(process.env.VERCEL_ENV!=="production")return {rules:{userAgent:"*",disallow:"/"}};
 return {rules:{
  userAgent:"*",allow:"/",
  disallow:["/admin/","/partner/dashboard","/partner/services","/partner/settings",
    "/cart","/checkout/","/my-requests","/my-bank-transfers","/my-bookings",
    "/notifications","/profile","/login","/onboarding","/api/"]
 },sitemap:`${SITE_URL}/sitemap.xml`,host:SITE_URL};
}
