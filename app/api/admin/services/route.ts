import {sanitizeServiceHtml} from "@/lib/service-html";
import {hasAdminPermission} from "@/lib/admin-permissions";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";


export async function GET() {
  const session = await getCurrentSession();
  if (!session || !hasAdminPermission(session.user,"CONTENT_EXPERIENCES")) {
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
      descriptionAr:sanitizeServiceHtml(service.descriptionAr),descriptionEn:sanitizeServiceHtml(service.descriptionEn),cancellationPolicy:sanitizeServiceHtml(service.cancellationPolicy),
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
