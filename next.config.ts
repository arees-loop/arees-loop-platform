import type { NextConfig } from "next";

const privateNoIndex={key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"};
const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.8.108"],
  async headers() {
    return [
      {source:"/admin/:path*",headers:[privateNoIndex]},
      {source:"/partner/:path*",headers:[privateNoIndex]},
      {source:"/api/:path*",headers:[privateNoIndex]},
      {source:"/my-requests/:path*",headers:[privateNoIndex]},
      {source:"/my-requests",headers:[privateNoIndex]},
      {source:"/profile/:path*",headers:[privateNoIndex]},
      {source:"/profile",headers:[privateNoIndex]},
      {source:"/bookings/:path*",headers:[privateNoIndex]},
      {source:"/bookings",headers:[privateNoIndex]},
      {source:"/cart",headers:[privateNoIndex]},
      {source:"/auth",headers:[privateNoIndex]},
      {source:"/login",headers:[privateNoIndex]},
      {source:"/notifications",headers:[privateNoIndex]},
      {source:"/onboarding",headers:[privateNoIndex]},
      {source:"/favorites",headers:[privateNoIndex]},
      {source:"/missions",headers:[privateNoIndex]},
      {source:"/sd",headers:[privateNoIndex]},
      {source:"/map-test",headers:[privateNoIndex]},
      {source:"/experience/:id/booking/:path*",headers:[privateNoIndex]},
    ];
  },
};

export default nextConfig;
