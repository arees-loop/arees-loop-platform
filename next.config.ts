import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.8.108"],
  async headers(){
    const privateRoutes=[
      "/admin/:path*","/api/:path*","/auth/:path*","/login",
      "/partner/:path*","/bookings/:path*","/cart","/my-requests/:path*",
      "/favorites","/notifications","/profile","/onboarding/:path*",
      "/missions","/rewards","/map-test","/sd",
      "/experience/:path*","/guide/:path*"
    ];
    return privateRoutes.map(source=>({source,headers:[{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}]}));
  },
};

export default nextConfig;