import { createHash } from "crypto";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!token) return NextResponse.json({success:false,message:"رابط الدعوة غير صالح."},{status:400});
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return NextResponse.json({success:false,message:"كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حروف وأرقام."},{status:400});
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const invitation = await prisma.verificationToken.findUnique({where:{tokenHash},include:{user:true}});
    if (!invitation || invitation.type !== "ADMIN_INVITATION" || invitation.consumedAt || invitation.expiresAt <= new Date()) return NextResponse.json({success:false,message:"رابط الدعوة منتهي أو غير صالح."},{status:400});
    if (invitation.user.role !== "ADMIN") return NextResponse.json({success:false,message:"الدعوة غير صالحة لهذا الحساب."},{status:400});
    const passwordHash = await hash(password,12);
    await prisma.$transaction([
      prisma.user.update({where:{id:invitation.userId},data:{passwordHash,status:"ACTIVE",emailVerifiedAt:new Date()}}),
      prisma.verificationToken.update({where:{id:invitation.id},data:{consumedAt:new Date()}})
    ]);
    return NextResponse.json({success:true,message:"تم تفعيل الحساب الإداري بنجاح."});
  } catch(error) {
    console.error("POST /api/admin/users/invite/accept error:",error);
    return NextResponse.json({success:false,message:"تعذر تفعيل الحساب."},{status:500});
  }
}