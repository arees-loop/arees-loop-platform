import { createHash, randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { sendEmail } from "@/lib/notifications/email";

const ALLOWED_PERMISSIONS = ["PARTNER_REQUESTS","ACTIVE_PARTNERS","CONTENT_EXPERIENCES","BOOKINGS","PAYMENTS_SETTLEMENTS","REPORTS_ANALYTICS","PLATFORM_SETTINGS"] as const;

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
    if (session.user.role !== "SUPER_ADMIN") return NextResponse.json({success:false,message:"إرسال الدعوات متاح للـ Super Admin فقط."},{status:403});
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const fullName = typeof body.name === "string" ? body.name.trim().replace(/\s+/g," ") : "";
    const parts = fullName.split(" ");
    const firstName = parts.shift() || null;
    const lastName = parts.join(" ") || null;
    const permissions = Array.isArray(body.permissions) ? body.permissions.filter((p:unknown)=>typeof p==="string" && (ALLOWED_PERMISSIONS as readonly string[]).includes(p)) : [];
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({success:false,message:"أدخل بريداً إلكترونياً صحيحاً."},{status:400});
    if (!firstName) return NextResponse.json({success:false,message:"أدخل اسم المستخدم الإداري."},{status:400});
    if (!permissions.length) return NextResponse.json({success:false,message:"اختر صلاحية واحدة على الأقل."},{status:400});
    const existing = await prisma.user.findUnique({where:{email}});
    if (existing && existing.role !== "ADMIN") return NextResponse.json({success:false,message:"هذا البريد مرتبط بحساب موجود ولا يمكن تحويله تلقائياً إلى أدمن."},{status:409});
    if (existing?.status === "ACTIVE") return NextResponse.json({success:false,message:"هذا المستخدم الإداري مفعل بالفعل."},{status:409});
    const passwordHash = await hash(randomBytes(32).toString("base64url"),12);
    const user = existing
      ? await prisma.user.update({where:{id:existing.id},data:{firstName,lastName,adminPermissions:permissions,status:"PENDING_VERIFICATION"}})
      : await prisma.user.create({data:{email,firstName,lastName,passwordHash,role:"ADMIN",status:"PENDING_VERIFICATION",adminPermissions:permissions}});
    await prisma.verificationToken.deleteMany({where:{userId:user.id,type:"ADMIN_INVITATION",consumedAt:null}});
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.verificationToken.create({data:{userId:user.id,type:"ADMIN_INVITATION",tokenHash,target:email,expiresAt:new Date(Date.now()+86400000)}});
    const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/,"") || new URL(request.url).origin;
    const inviteUrl = origin + "/admin/invite?token=" + encodeURIComponent(token);
    const delivery = await sendEmail({to:email,subject:"دعوة للانضمام إلى إدارة Arees Loop",html:'<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8;color:#171717"><h2 style="color:#0D3B34">مرحباً '+firstName+'</h2><p>تمت دعوتك للانضمام إلى فريق إدارة Arees Loop.</p><p>أنشئ كلمة المرور وفعّل الحساب من الرابط التالي، وهو صالح لمدة 24 ساعة.</p><p><a href="'+inviteUrl+'" style="display:inline-block;background:#0D3B34;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none">تفعيل الحساب</a></p></div>'});
    if (!delivery.sent) return NextResponse.json({success:false,message:"تم إنشاء الدعوة لكن تعذر إرسال البريد. تحقق من إعدادات البريد ثم أعد المحاولة."},{status:502});
    return NextResponse.json({success:true,message:"تم إرسال الدعوة بنجاح."});
  } catch(error) {
    console.error("POST /api/admin/users/invite error:",error);
    return NextResponse.json({success:false,message:"تعذر إرسال الدعوة."},{status:500});
  }
}