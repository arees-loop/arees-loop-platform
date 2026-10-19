import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.8.108"],
  async headers(){
    const privateRoutes=[
      "/admin/:path*","/auth/:path*","/login",
      "/partner/login","/partner/dashboard/:path*","/partner/bookings/:path*",
      "/partner/services/:path*","/partner/invoices/:path*","/partner/settlements/:path*",
      "/partner/reports/:path*","/partner/contracts/:path*","/partner/coupons/:path*",
      "/partner/loyalty/:path*","/partner/team/:path*","/partner/business/:path*",
      "/partner/onboarding/:path*","/partner/status","/partner/agreement",
      "/bookings/:path*","/cart","/my-requests/:path*",
      "/favorites","/notifications","/profile","/onboarding/:path*",
      "/missions","/rewards","/map-test","/sd",
      "/experience/:path*","/guide/:path*"
    ];
    return privateRoutes.map(source=>({source,headers:[{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}]}));
  },
};

export default nextConfig;