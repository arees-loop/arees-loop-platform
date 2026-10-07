import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const wallet = await prisma.loyaltyWallet.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });
  const transactions = await prisma.loyaltyTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ success: true, wallet, transactions, pointValue: { points: 100, sar: 1 } });
}
