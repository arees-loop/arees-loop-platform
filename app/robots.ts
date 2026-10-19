import type {MetadataRoute} from "next";

const host="https://www.areesloop.com";

/** Public discovery is allowed; private and unverified/demo areas are excluded. */
export default function robots():MetadataRoute.Robots {
 return {
  rules:[
   {userAgent:"*",allow:"/",disallow:[
    "/admin/","/partner/","/login","/auth","/profile",
    "/notifications","/my-requests/","/bookings/",
    "/cart","/favorites","/onboarding","/missions",
    "/map-test","/sd","/api/","/experience/","/guide/",
   ]},
  ],
  sitemap:host+"/sitemap.xml",
  host,
 };
}
