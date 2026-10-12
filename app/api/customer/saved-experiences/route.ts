import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";

function unavailable() {
  return NextResponse.json({ success: false, error: "SAVED_EXPERIENCES_UNAVAILABLE" }, { status: 503 });
}

export async function GET() {
  if (!process.env.DATABASE_URL) return unavailable();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false, error: "UNAUTHENTICATED" }, { status: 401 });
  try {
    const { prisma } = await import("@/lib/prisma");
    const items = await prisma.savedExperience.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { serviceId: true, createdAt: true, service: { select: {
        id: true, nameAr: true, city: true, category: true, status: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      } } },
    });
    return NextResponse.json({ success: true, data: items.filter(item => item.service.status === "PUBLISHED").map(item => ({
      id: item.serviceId, name: item.service.nameAr, city: item.service.city ?? "",
      category: item.service.category, image: item.service.images[0]?.url ?? null,
      savedAt: item.createdAt,
    })) });
  } catch (error) {
    console.error("GET /api/customer/saved-experiences failed", error);
    return unavailable();
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) return unavailable();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false, error: "UNAUTHENTICATED" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const serviceId = body?.serviceId;
  if (typeof serviceId !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(serviceId)) {
    return NextResponse.json({ success: false, error: "INVALID_SERVICE_ID" }, { status: 400 });
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    const service = await prisma.service.findFirst({ where: { id: serviceId, status: "PUBLISHED" }, select: { id: true } });
    if (!service) return NextResponse.json({ success: false, error: "SERVICE_NOT_AVAILABLE" }, { status: 404 });
    await prisma.savedExperience.upsert({
      where: { userId_serviceId: { userId: session.user.id, serviceId } },
      create: { userId: session.user.id, serviceId }, update: {},
    });
    return NextResponse.json({ success: true, saved: true });
  } catch (error) {
    console.error("POST /api/customer/saved-experiences failed", error);
    return unavailable();
  }
}

export async function DELETE(request: NextRequest) {
  if (!process.env.DATABASE_URL) return unavailable();
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false, error: "UNAUTHENTICATED" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const serviceId = body?.serviceId;
  if (typeof serviceId !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(serviceId)) {
    return NextResponse.json({ success: false, error: "INVALID_SERVICE_ID" }, { status: 400 });
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.savedExperience.deleteMany({ where: { userId: session.user.id, serviceId } });
    return NextResponse.json({ success: true, saved: false });
  } catch (error) {
    console.error("DELETE /api/customer/saved-experiences failed", error);
    return unavailable();
  }
}
