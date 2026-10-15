import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { bankTransferWritesAllowed } from "@/lib/bank-transfer-launch-guard";
import { sendBankTransferOrderReceivedEmail } from "@/lib/email";

export async function POST(_request: Request, context: { params: Promise<{reference: string}> }) {
  if (!bankTransferWritesAllowed()) {
    return NextResponse.json({success: false, message: "نظام التحويل البنكي قيد التجهيز."}, {status: 503});
  }
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({success: false, message: "يلزم تسجيل الدخول."}, {status: 401});
  const {reference} = await context.params;
  const order = await prisma.bankTransferOrder.findFirst({
    where: {reference, userId: session.user.id},
    select: {id: true, reference: true, userId: true, customerEmail: true, amountSar: true,
             receiptPath: true, receiptUploadedAt: true, status: true}
  });
  if (!order) return NextResponse.json({success: false, message: "الطلب غير موجود."}, {status: 404});
  if (!["AWAITING_TRANSFER", "NEEDS_CORRECTION"].includes(order.status)) {
    return NextResponse.json({success: false, message: "سبق إرسال الطلب أو تغيّرت حالته."}, {status: 409});
  }
  if (!order.receiptPath || !order.receiptUploadedAt) {
    return NextResponse.json({success: false, message: "أرفق صورة إشعار الحوالة قبل إرسال الطلب."}, {status: 400});
  }
  // Compare-and-swap avoids two submissions (and duplicate notification emails).
  const updated = await prisma.bankTransferOrder.updateMany({
    where: {id: order.id, userId: session.user.id, status: order.status, receiptPath: order.receiptPath},
    data: {status: "RECEIPT_UNDER_REVIEW", reviewNotes: null}
  });
  if (updated.count !== 1) return NextResponse.json({success: false, message: "تم إرسال الطلب بالفعل أو تغيرت حالته."}, {status: 409});
  let emailSent = false;
  try {
    await sendBankTransferOrderReceivedEmail({
      to: order.customerEmail, reference: order.reference, amountSar: Number(order.amountSar)
    });
    emailSent = true;
  } catch (error) {
    console.error("Bank transfer submission email failed", error);
  }
  return NextResponse.json({success: true, emailSent, status: "RECEIPT_UNDER_REVIEW",
    message: "تم إرسال طلبك للتحقق من التحويل البنكي. يمكنك متابعة حالة الطلب من صفحة طلباتي."});
}
