import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success:false, message:"يجب تسجيل الدخول أولاً." }, { status:401 });
  if (session.user.role !== "SUPER_ADMIN") return NextResponse.json({ success:false, message:"غير مصرح." }, { status:403 });

  const users = await prisma.user.findMany({
    where:{ role:{ in:["ADMIN","SUPER_ADMIN"] } },
    orderBy:{ createdAt:"asc" },
    select:{ id:true,email:true,firstName:true,lastName:true,role:true,status:true,adminPermissions:true,createdAt:true }
  });
  return NextResponse.json({ success:true, data:users });
}