import type { NextConfig } from "next";

const privatePaths=[
  "/admin/:path*",
  "/partner/:path*",
  "/login",
  "/auth",
  "/profile",
  "/notifications",
  "/my-requests/:path*",
  "/bookings/:path*",
  "/cart",
  "/favorites",
  "/onboarding",
  "/missions",
  "/map-test",
  "/sd",
  "/api/:path*",
  // Preview/mock experiences and guides are not verified live offers.
  "/experience/:path*",
  "/guide/:path*",
] as const;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.8.108"],
  async headers(){
    return privatePaths.map(source=>({
      source,
      headers:[{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}],
    }));
  },
};

export default nextConfig;
