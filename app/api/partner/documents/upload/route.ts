import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_DOCUMENT_TYPES = new Set([
  "IDENTITY",
  "BUSINESS_PROOF",
  "COMMERCIAL_REGISTER",
  "AUTHORIZATION",
  "VAT_CERTIFICATE",
  "IBAN_CERTIFICATE",
  "GOVERNMENT_LETTER",
  "OTHER",
]);

function safeFileName(name: string) {
  const extension = name.includes(".")
    ? `.${name.split(".").pop()?.toLowerCase()}`
    : "";

  return `${crypto.randomUUID()}${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "يجب تسجيل الدخول أولاً." },
        { status: 401 },
      );
    }

    if (
      session.user.role !== "PARTNER_OWNER" &&
      session.user.role !== "PARTNER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "هذا الحساب غير مخول لرفع مستندات الشريك.",
        },
        { status: 403 },
      );
    }

    const membership = await prisma.partnerMember.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      select: {
        partnerId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب إنشاء طلب الشراكة أولاً قبل رفع المستندات.",
        },
        { status: 409 },
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");
    const typeValue = formData.get("type");
    const labelValue = formData.get("label");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "الملف مطلوب." },
        { status: 400 },
      );
    }

    const documentType =
      typeof typeValue === "string"
        ? typeValue.trim().toUpperCase()
        : "";

    if (!ALLOWED_DOCUMENT_TYPES.has(documentType)) {
      return NextResponse.json(
        { success: false, message: "نوع المستند غير صالح." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "يسمح فقط بملفات PDF أو JPG أو PNG.",
        },
        { status: 415 },
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "حجم الملف يجب ألا يتجاوز 10 ميجابايت.",
        },
        { status: 413 },
      );
    }

    const pathname = [
      "partners",
      membership.partnerId,
      documentType.toLowerCase(),
      safeFileName(file.name),
    ].join("/");

    const blob = await put(pathname, file, {
      access: "private",
      addRandomSuffix: false,
    });

    const document = await prisma.partnerDocument.create({
      data: {
        partnerId: membership.partnerId,
        type: documentType as
          | "IDENTITY"
          | "BUSINESS_PROOF"
          | "COMMERCIAL_REGISTER"
          | "AUTHORIZATION"
          | "VAT_CERTIFICATE"
          | "IBAN_CERTIFICATE"
          | "GOVERNMENT_LETTER"
          | "OTHER",
        label:
          typeof labelValue === "string"
            ? labelValue.trim() || null
            : null,
        fileUrl: blob.url,
        fileName: file.name,
        mimeType: file.type,
        status: "PENDING",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "PARTNER_DOCUMENT_UPLOADED",
        entityType: "PartnerDocument",
        entityId: document.id,
        afterData: {
          partnerId: membership.partnerId,
          documentType,
          fileName: file.name,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "تم رفع المستند بنجاح.",
        document: {
          id: document.id,
          type: document.type,
          fileName: document.fileName,
          status: document.status,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/partner/documents/upload failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "تعذر رفع المستند حالياً.",
      },
      { status: 500 },
    );
  }
}
