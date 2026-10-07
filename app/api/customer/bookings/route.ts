import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { service: { select: { id: true, nameAr: true, city: true, images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, bookings });
}
