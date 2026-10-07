import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<Array<{ table_name: string | null }>>`
      SELECT to_regclass('"PartnerLoyaltySetting"')::text AS table_name
    `;

    return NextResponse.json({
      ok: true,
      partnerLoyaltySettingExists: Boolean(rows[0]?.table_name),
    });
  } catch (error) {
    console.error("DB diagnostic failed", error);
    return NextResponse.json(
      { ok: false, error: "database_diagnostic_failed" },
      { status: 500 },
    );
  }
}
