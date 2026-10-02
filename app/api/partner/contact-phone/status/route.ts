import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { isSmsVerificationEnabled } from "@/lib/sms";

export async function GET() {
  const enabled =
    isSmsVerificationEnabled();

  const session =
    await getCurrentSession();

  if (!session) {
    return NextResponse.json({
      success: true,
      enabled,
      verification: null,
    });
  }

  const verification =
    await prisma.partnerContactVerification.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        phone: true,
        verifiedAt: true,
      },
    });

  return NextResponse.json({
    success: true,
    enabled,
    verification,
  });
}
