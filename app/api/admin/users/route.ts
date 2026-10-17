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
    if (!userId || !["ACTIVATE","DISABLE","SET_PERMISSIONS","REMOVE_ADMIN_ACCESS"].includes(action)) {
      return NextResponse.json({ success:false, message:"الإجراء غير صالح." }, { status:400 });
    }

    const target = await prisma.user.findUnique({ where:{ id:userId }, select:{ id:true,role:true,status:true } });
    if (!target || !["ADMIN","SUPER_ADMIN"].includes(target.role)) {
      return NextResponse.json({ success:false, message:"المستخدم الإداري غير موجود." }, { status:404 });
    }
    if (target.role === "SUPER_ADMIN" && action === "DISABLE") {
      return NextResponse.json({ success:false, message:"لا يمكن تعطيل حساب Super Admin من هذه القائمة." }, { status:409 });
    }

    if (action === "REMOVE_ADMIN_ACCESS") {
      if (target.role !== "ADMIN") return NextResponse.json({success:false,message:"حساب السوبر أدمن محمي من الإزالة."},{status:403});
      if (target.id === session.user.id) return NextResponse.json({success:false,message:"لا يمكنك إزالة صلاحيات حسابك الحالي."},{status:403});
      // Preserve user, bookings, requests, and audit trail; revoke administrative access.
      const updated = await prisma.$transaction(async tx => {
        const changed = await tx.user.updateMany({where:{id:userId,role:"ADMIN"},data:{role:"CUSTOMER",status:"DISABLED",adminPermissions:[]}});
        if(changed.count!==1) return false;
        await tx.auditLog.create({data:{userId:session.user.id,action:"ADMIN_ACCESS_REMOVED",entityType:"User",entityId:userId,beforeData:{role:target.role,status:target.status},afterData:{role:"CUSTOMER",status:"DISABLED",adminPermissions:[]} }});
        return true;
      });
      return NextResponse.json(updated?{success:true,message:"أُزيل المستخدم من فريق الإدارة، وسُحبت صلاحياته دون حذف سجلاته."}:{success:false,message:"تغيرت حالة المستخدم؛ حدّث الصفحة."},{status:updated?200:409});
    }
    if (action === "SET_PERMISSIONS") {
      if (target.role !== "ADMIN") return NextResponse.json({ success:false,message:"لا يمكن تعديل صلاحيات السوبر أدمن." },{status:403});
      const permitted = ["PARTNER_REQUESTS","ACTIVE_PARTNERS","CONTENT_EXPERIENCES","BOOKINGS","PAYMENTS_SETTLEMENTS","REPORTS_ANALYTICS","PLATFORM_SETTINGS","TRANSPORT_FLIGHTS","TRANSPORT_FERRIES","HOTEL_REQUESTS","TRANSPORT_VISAS"];
      if (!Array.isArray(body.permissions) || body.permissions.length > permitted.length ||
        body.permissions.some((x:unknown)=>typeof x!=="string" || !permitted.includes(x)) ||
        new Set(body.permissions).size!==body.permissions.length) return NextResponse.json({success:false,message:"الصلاحيات غير صحيحة."},{status:400});
      const before = await prisma.user.findUnique({where:{id:userId},select:{adminPermissions:true}});
      const updated = await prisma.user.update({where:{id:userId},data:{adminPermissions:body.permissions},select:{id:true,adminPermissions:true}});
      await prisma.auditLog.create({data:{userId:session.user.id,action:"ADMIN_PERMISSIONS_UPDATED",entityType:"User",entityId:userId,beforeData:{permissions:before?.adminPermissions},afterData:{permissions:updated.adminPermissions}}}).catch(err=>console.error("Admin permission audit failed",err));
      return NextResponse.json({success:true,message:"تم تحديث صلاحيات الموظف.",data:updated});
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
