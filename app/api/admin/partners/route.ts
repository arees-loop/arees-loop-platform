import {hasAdminPermission} from "@/lib/admin-permissions";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "يجب تسجيل الدخول أولاً.",
        },
        { status: 401 }
      );
    }

    if (
      !hasAdminPermission(session.user,"PARTNER_REQUESTS") && !hasAdminPermission(session.user,"ACTIVE_PARTNERS")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بالوصول إلى إدارة الشركاء.",
        },
        { status: 403 }
      );
    }

    const partners = await prisma.partner.findMany({
      where: hasAdminPermission(session.user,"PARTNER_REQUESTS") && hasAdminPermission(session.user,"ACTIVE_PARTNERS") ? {} : hasAdminPermission(session.user,"ACTIVE_PARTNERS") ? {status:"ACTIVE"} : {status:{not:"ACTIVE"}},
      orderBy: {
        createdAt: "desc",
      },

      include: {
        categories: {
          orderBy: {
            createdAt: "asc",
          },
        },

        licenses: {
          orderBy: {
            createdAt: "asc",
          },
        },

        members: {
          where: {
            isActive: true,
          },

          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                emailVerifiedAt: true,
                phoneVerifiedAt: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: partners,
      canVerifyOwners: session.user.role === "SUPER_ADMIN",
    });
  } catch (error) {
    console.error(
      "GET /api/admin/partners error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "تعذر تحميل طلبات الشركاء.",
      },
      { status: 500 }
    );
  }
}