import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  const user = session?.user;

  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ success: false, message: "غير مصرح." }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      adminPermissions: user.adminPermissions,
      profileImageUrl: user.profileImageUrl,
    },
  });
}
