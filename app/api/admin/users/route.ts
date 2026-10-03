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
    select:{ id:true,email:true,firstName:true,lastName:true,role:true,status:true,adminPermissions:true,profileImageUrl:true,createdAt:true }
  });
  return NextResponse.json({ success:true, data:users });
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success:false, message:"يجب تسجيل الدخول أولاً." }, { status:401 });
  if (session.user.role !== "SUPER_ADMIN") return NextResponse.json({ success:false, message:"غير مصرح." }, { status:403 });

  try {
    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId : "";
    const action = body.action;
    if (!userId || !["ACTIVATE","DISABLE"].includes(action)) {
      return NextResponse.json({ success:false, message:"الإجراء غير صالح." }, { status:400 });
    }

    const target = await prisma.user.findUnique({ where:{ id:userId }, select:{ id:true,role:true,status:true } });
    if (!target || !["ADMIN","SUPER_ADMIN"].includes(target.role)) {
      return NextResponse.json({ success:false, message:"المستخدم الإداري غير موجود." }, { status:404 });
    }
    if (target.role === "SUPER_ADMIN" && action === "DISABLE") {
      return NextResponse.json({ success:false, message:"لا يمكن تعطيل حساب Super Admin من هذه القائمة." }, { status:409 });
    }

    const status = action === "ACTIVATE" ? "ACTIVE" : "DISABLED";
    const updated = await prisma.user.update({ where:{id:userId}, data:{status}, select:{id:true,status:true} });
    await prisma.auditLog.create({ data:{ userId:session.user.id, action:action === "ACTIVATE" ? "ADMIN_USER_ACTIVATED" : "ADMIN_USER_DISABLED", entityType:"User", entityId:userId, beforeData:{status:target.status}, afterData:{status} } });
    return NextResponse.json({ success:true, message:action === "ACTIVATE" ? "تم تنشيط المستخدم بنجاح." : "تم تعطيل المستخدم بنجاح.", data:updated });
  } catch (error) {
    console.error("PATCH /api/admin/users error:", error);
    return NextResponse.json({ success:false, message:"تعذر تنفيذ الإجراء." }, { status:500 });
  }
}
