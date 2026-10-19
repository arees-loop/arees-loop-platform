import type {MetadataRoute} from "next";
export default function robots():MetadataRoute.Robots{
 return {
  rules:{
   userAgent:"*",
   allow:["/","/api/media"],
   disallow:[
    "/admin/","/api/","/auth/","/login","/profile",
    "/partner/dashboard","/partner/bookings","/partner/services",
    "/partner/invoices","/partner/settlements","/partner/reports",
    "/partner/contracts","/partner/coupons","/partner/loyalty",
    "/partner/team","/partner/business","/partner/login",
    "/partner/onboarding","/partner/status","/partner/agreement",
    "/bookings/","/cart","/my-requests","/favorites","/notifications",
    "/missions","/rewards","/onboarding","/map-test","/sd",
    "/experience/","/guide/"
   ]
  },
  sitemap:"https://www.areesloop.com/sitemap.xml",
  host:"https://www.areesloop.com"
 };
}
