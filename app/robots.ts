import type {MetadataRoute} from "next";
export default function robots():MetadataRoute.Robots{
 return {
  rules:{
   userAgent:"*",
   allow:"/",
   disallow:[
    "/admin/","/api/","/auth/","/login","/profile","/partner/",
    "/bookings/","/cart","/my-requests","/favorites","/notifications",
    "/missions","/rewards","/onboarding","/map-test","/sd",
    "/experience/","/guide/"
   ]
  },
  sitemap:"https://www.areesloop.com/sitemap.xml",
  host:"https://www.areesloop.com"
 };
}
