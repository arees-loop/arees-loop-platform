import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false, message: "يجب تسجيل الدخول أولاً." }, { status: 401 });

  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const points = Number(body.points);
  if (!email || !Number.isInteger(points) || points <= 0) {
    return NextResponse.json({ success: false, message: "أدخل البريد وعدد نقاط صحيح." }, { status: 400 });
  }
  if (email === session.user.email.toLowerCase()) {
    return NextResponse.json({ success: false, message: "لا يمكنك إهداء النقاط لنفسك." }, { status: 400 });
  }

  const recipient = await prisma.user.findUnique({ where: { email }, select: { id: true, firstName: true, lastName: true } });
  if (!recipient) return NextResponse.json({ success: false, message: "لا يوجد عميل مسجل بهذا البريد." }, { status: 404 });

  try {
    const transferId = crypto.randomUUID();
    await prisma.$transaction(async (tx) => {
      const sender = await tx.loyaltyWallet.upsert({ where: { userId: session.user.id }, update: {}, create: { userId: session.user.id } });
      if (sender.balance < points) throw new Error("INSUFFICIENT_POINTS");

      await tx.loyaltyWallet.update({ where: { userId: session.user.id }, data: { balance: { decrement: points } } });
      await tx.loyaltyWallet.upsert({ where: { userId: recipient.id }, update: { balance: { increment: points } }, create: { userId: recipient.id, balance: points } });
      await tx.loyaltyTransaction.createMany({ data: [
        { userId: session.user.id, type: "GIFT_SENT", points: -points, referenceId: transferId, description: `إهداء نقاط إلى ${email}` },
        { userId: recipient.id, type: "GIFT_RECEIVED", points, referenceId: transferId, description: "هدية نقاط من عميل Arees Loop" },
      ]});
    });
    return NextResponse.json({ success: true, message: `تم إهداء ${points} نقطة بنجاح.` });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_POINTS") return NextResponse.json({ success: false, message: "رصيد النقاط غير كافٍ." }, { status: 400 });
    console.error("POST /api/loyalty/gift failed:", error);
    return NextResponse.json({ success: false, message: "تعذر إتمام إهداء النقاط." }, { status: 500 });
  }
}
