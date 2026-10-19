import type {MetadataRoute} from "next";
export default function robots():MetadataRoute.Robots {
 return {
  rules:[{
   userAgent:"*",
   allow:"/",
   disallow:[
    "/admin/","/api/","/auth","/login","/onboarding/","/profile",
    "/bookings/","/my-requests","/cart","/notifications","/favorites",
    "/missions","/map-test","/partner/dashboard","/partner/bookings",
    "/partner/settlements","/partner/invoices","/partner/services",
    "/partner/loyalty","/partner/reports","/partner/team","/partner/status",
    "/partner/onboarding","/partner/login","/partner/agreement",
    "/partner/contracts","/partner/coupons","/partner/business",
    "/partner/invite","/partner/logout"
   ]
  }],
  sitemap:"https://www.areesloop.com/sitemap.xml",
  host:"https://www.areesloop.com",
 };
}
