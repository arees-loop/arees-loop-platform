import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const partners = await prisma.successPartner.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, logoUrl: true, websiteUrl: true },
      take: 100,
    });

    return NextResponse.json(
      { success: true, data: partners },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=60" } },
    );
  } catch (error) {
    console.error("GET /api/success-partners failed", error);
    return NextResponse.json(
      { success: false, message: "تعذر تحميل شركاء النجاح حالياً." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
