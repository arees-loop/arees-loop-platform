import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

function isAdmin(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ success: false, message: "غير مصرح." }, { status: 401 });
  }

  const services = await prisma.service.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      partner: { select: { id: true, legalNameAr: true, tradeNameAr: true, publicName: true } },
      license: { select: { type: true, issuer: true, licenseNumber: true, expiryDate: true, status: true } },
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { bookings: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: services.map((service) => ({
      ...service,
      basePrice: Number(service.basePrice),
      vatRate: Number(service.vatRate),
      finalPrice: Number(service.finalPrice),
      latitude: service.latitude == null ? null : Number(service.latitude),
      longitude: service.longitude == null ? null : Number(service.longitude),
      partnerName: service.partner.tradeNameAr || service.partner.publicName || service.partner.legalNameAr,
      bookingCount: service._count.bookings,
    })),
  });
}
