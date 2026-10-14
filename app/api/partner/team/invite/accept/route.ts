import { createHash } from "crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const firstName = typeof body?.firstName === "string" ? body.firstName.trim().slice(0, 80) : "";
    const lastName = typeof body?.lastName === "string" ? body.lastName.trim().slice(0, 80) : "";
    if (!token) return NextResponse.json({ success: false, message: "رابط الدعوة غير صالح." }, { status: 400 });
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return NextResponse.json({ success: false, message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حروف وأرقام." }, { status: 400 });
    if (!firstName) return NextResponse.json({ success: false, message: "أدخل اسمك الأول." }, { status: 400 });

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const invitation = await prisma.verificationToken.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!invitation || invitation.type !== "PARTNER_INVITATION" || invitation.consumedAt || invitation.expiresAt <= new Date()) return NextResponse.json({ success: false, message: "رابط الدعوة منتهي أو غير صالح." }, { status: 400 });
    const memberId = invitation.target?.split("|")[1];
    if (!memberId) return NextResponse.json({ success: false, message: "الدعوة غير مكتملة. اطلب رابطاً جديداً من مدير المنشأة." }, { status: 400 });
    const member = await prisma.partnerMember.findFirst({ where: { id: memberId, userId: invitation.userId, isActive: false }, select: { id: true } });
    if (!member) return NextResponse.json({ success: false, message: "الدعوة لم تعد مرتبطة بعضوية فعالة. تواصل مع مدير المنشأة." }, { status: 409 });

    const passwordHash = await hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: invitation.userId }, data: { passwordHash, firstName, lastName: lastName || null, role: "PARTNER_STAFF", status: "ACTIVE", emailVerifiedAt: new Date() } }),
      prisma.partnerMember.update({ where: { id: member.id }, data: { isActive: true } }),
      prisma.verificationToken.update({ where: { id: invitation.id }, data: { consumedAt: new Date() } }),
    ]);
    return NextResponse.json({ success: true, message: "تم تأكيد بريدك وتفعيل حساب الموظف. سجّل الدخول من صفحة الشريك." });
  } catch (error) {
    console.error("POST partner employee invitation accept failed:", error);
    return NextResponse.json({ success: false, message: "تعذر تفعيل الحساب حالياً." }, { status: 500 });
  }
}
