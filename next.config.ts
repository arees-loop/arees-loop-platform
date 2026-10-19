import type { NextConfig } from "next";
const privatePaths=[
 "/admin/:path*","/api/:path*","/auth","/login","/onboarding/:path*",
 "/profile","/bookings/:path*","/my-requests/:path*","/cart",
 "/notifications","/favorites","/missions","/map-test",
 "/partner/dashboard/:path*","/partner/bookings/:path*",
 "/partner/settlements/:path*","/partner/invoices/:path*","/partner/services/:path*",
 "/partner/loyalty/:path*","/partner/reports/:path*","/partner/team/:path*",
 "/partner/status/:path*","/partner/onboarding/:path*","/partner/login",
 "/partner/agreement","/partner/contracts/:path*","/partner/coupons",
 "/partner/business","/partner/invite","/partner/logout",
];
const nextConfig: NextConfig={
 allowedDevOrigins:["192.168.8.108"],
 async headers(){
   return privatePaths.map(source=>({source,headers:[{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}]}));
 },
};
export default nextConfig;
