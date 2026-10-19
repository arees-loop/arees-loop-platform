import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { BANK_NOTE_ACTION, BANK_NOTE_ENTITY, BANK_NOTE_MAX_LENGTH, findBankTransferNotes } from "@/lib/bank-transfer-notes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const fail = (message: string, status = 400) =>
  NextResponse.json({ success: false, message }, { status, headers: { "Cache-Control": "private, no-store" } });

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "SUPER_ADMIN") return fail("غير مصرح", 403);
  try {
    const accounts = await prisma.bankTransferAccount.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, bankName: true, beneficiaryName: true, iban: true, active: true },
    });
    const notes = await findBankTransferNotes(accounts.map((account) => account.id));
    return NextResponse.json({
      success: true,
      accounts: accounts.map((account) => ({ ...account, note: notes[account.id] || "" })),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Bank accounts retrieval failed", error);
    return fail("تعذر تحميل الحسابات البنكية وملاحظاتها. حاول مرة أخرى.", 503);
  }
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "SUPER_ADMIN") return fail("غير مصرح", 403);
  const data = await req.json().catch(() => null);
  const bankName = String(data?.bankName || "").trim().slice(0, 120);
  const beneficiaryName = String(data?.beneficiaryName || "").trim().slice(0, 160);
  const iban = String(data?.iban || "").replace(/\s+/g, "").toUpperCase();
  if (!bankName || !beneficiaryName || !/^SA[0-9]{22}$/.test(iban)) {
    return fail("أدخل اسم البنك والمستفيد وآيبان سعودي صحيح الشكل.");
  }
  if (data?.note !== undefined && typeof data.note !== "string") return fail("نص الملاحظة غير صحيح.");
  if (typeof data?.note === "string" && data.note.length > BANK_NOTE_MAX_LENGTH) {
    return fail("الحد الأقصى للملاحظات 1500 حرف.");
  }
  const note = typeof data?.note === "string" ? data.note.trim() : "";
  try {
    const account = await prisma.$transaction(async (tx) => {
      const created = await tx.bankTransferAccount.create({
        data: { bankName, beneficiaryName, iban, active: false },
        select: { id: true },
      });
      if (note) {
        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            entityType: BANK_NOTE_ENTITY,
            entityId: created.id,
            action: BANK_NOTE_ACTION,
            afterData: { note },
          },
        });
      }
      return created;
    });
    return NextResponse.json({
      success: true,
      id: account.id,
      message: "تم حفظ الحساب غير مفعّل. راجع البيانات قبل التفعيل.",
    }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Bank account creation failed", error);
    return fail("تعذر حفظ الحساب البنكي. لم يتم إجراء تفعيل تلقائي.", 503);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "SUPER_ADMIN") return fail("غير مصرح", 403);
  const data = await req.json().catch(() => null);
  const id = typeof data?.id === "string" ? data.id.trim() : "";
  if (!id || id.length > 120) return fail("معرّف الحساب غير صحيح.");
  const updateActive = typeof data?.active === "boolean";
  const updateNote = typeof data?.note === "string";
  if (!updateActive && !updateNote) return fail("لم يتم تحديد تغيير صالح.");
  if (updateNote && data.note.length > BANK_NOTE_MAX_LENGTH) {
    return fail("الحد الأقصى للملاحظات 1500 حرف.");
  }
  try {
    const current = await prisma.bankTransferAccount.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!current) return fail("الحساب غير موجود.", 404);
    await prisma.$transaction(async (tx) => {
      if (updateActive) {
        await tx.bankTransferAccount.update({ where: { id }, data: { active: data.active as boolean } });
      }
      if (updateNote) {
        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            entityType: BANK_NOTE_ENTITY,
            entityId: id,
            action: BANK_NOTE_ACTION,
            afterData: { note: (data.note as string).trim() },
          },
        });
      }
    });
    return NextResponse.json({ success: true, message: "تم حفظ التعديلات." }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Bank account update failed", error);
    return fail("تعذر تحديث الحساب البنكي. حاول مرة أخرى.", 503);
  }
}
