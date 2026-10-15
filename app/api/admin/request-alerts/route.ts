import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canManageTransport } from "@/lib/transport-permissions";
import { canManageHotel } from "@/lib/hotel-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Counts represent NEW requests visible to the signed-in administrator.
// Staff must only see requests assigned to their own account.
export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({success:false,message:"يلزم تسجيل الدخول."},{status:401});
  const user = session.user;
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    return NextResponse.json({success:false,message:"غير مصرح."},{status:403});
  }

  const isSuper = user.role === "SUPER_ADMIN";
  const visibleToStaff = isSuper ? {} : {assignedToId:user.id};
  const transport = [
    {kind:"FERRY",key:"ferries",enabled:canManageTransport(user,"FERRY")},
    {kind:"FLIGHT",key:"flights",enabled:canManageTransport(user,"FLIGHT")},
    {kind:"DRIVING_LICENSE",key:"drivingLicenses",enabled:canManageTransport(user,"DRIVING_LICENSE")}
  ] as const;
  try {
    const results = await Promise.all([
      ...transport.map(item => item.enabled ?
        prisma.transportRequest.count({where:{kind:item.kind,status:"NEW",...visibleToStaff}}) :
        Promise.resolve(null)
      ),
      canManageHotel(user) ?
        prisma.hotelInquiry.count({where:{status:"NEW",...visibleToStaff}}) :
        Promise.resolve(null)
    ]);
    return NextResponse.json({
      success:true,
      counts:{
        ferries:results[0],
        flights:results[1],
        drivingLicenses:results[2],
        hotels:results[3]
      },
      updatedAt:new Date().toISOString()
    },{headers:{"Cache-Control":"private, no-store"}});
  } catch (error) {
    console.error("Admin request alert counts failed",error);
    return NextResponse.json({success:false,message:"تعذر تحديث إشعارات الطلبات."},{status:503});
  }
}
