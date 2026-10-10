import {getCurrentSession} from "@/lib/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session=await getCurrentSession();
  if(session?.user.role!=="SUPER_ADMIN")return NextResponse.json({ok:false},{status:403});
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
