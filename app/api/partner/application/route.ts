import { NextRequest, NextResponse } from "next/server";



import { prisma } from "@/lib/prisma";

import { getCurrentSession } from "@/lib/session";
import { runPartnerApplicationWorkflow } from "@/lib/partners/application-workflow";



type PartnerApplicationBody = {

  legalNameAr?: string;

  legalNameEn?: string;

  tradeNameAr?: string;

  tradeNameEn?: string;



  partnerType?: string;

  applicantRole?: string;

  applicantJobTitle?: string;



  unifiedNumber?: string;

  commercialRegister?: string;

  proofType?: string;

  descriptionAr?: string;



  vatRegistered?: boolean;

  vatNumber?: string;



  websiteUrl?: string;



  country?: string;

  city?: string;

  address?: string;

  locationName?: string;

  formattedAddress?: string;

  placeId?: string;

  latitude?: number | string | null;

  longitude?: number | string | null;



  businessPhone?: string;

  businessEmail?: string;



  financeContactName?: string;

  financeContactEmail?: string;

  financeContactPhone?: string;



  mainContactName?: string;

  mainContactEmail?: string;

  mainContactPhone?: string;

  mainContactJobTitle?: string;



  operates24h?: boolean;

  operatingHours?: string;



  receivesPayments?: boolean;

  iban?: string;

  bankName?: string;

  swiftCode?: string;

  beneficiaryName?: string;



  publicName?: string;



  categories?: string[];



  licenses?: Array<{

    type?: string;

    issuer?: string;

    licenseNumber?: string;

    issueDate?: string | null;

    expiryDate?: string | null;

    documentUrl?: string | null;

  }>;

};



const clean = (value: unknown) => {

  if (typeof value !== "string") return null;



  const result = value.trim();



  return result || null;

};



const cleanRequired = (value: unknown) => {

  if (typeof value !== "string") return "";



  return value.trim();

};



const dateOrNull = (value: unknown) => {

  if (typeof value !== "string" || !value.trim()) {

    return null;

  }



  const date = new Date(value);



  return Number.isNaN(date.getTime()) ? null : date;

};



const decimalOrNull = (value: unknown) => {

  if (value === null || value === undefined || value === "") {

    return null;

  }



  const number = Number(value);



  return Number.isFinite(number) ? number : null;

};



const PARTNER_TYPE_MAP = {
  individual: "INDIVIDUAL",
  business: "BUSINESS",
  government: "GOVERNMENT_NONPROFIT",
  government_nonprofit: "GOVERNMENT_NONPROFIT",
} as const;

const APPLICANT_ROLE_MAP = {
  owner: "OWNER",
  representative: "REPRESENTATIVE",
} as const;

function normalizePartnerType(value: unknown) {
  if (typeof value !== "string") return null;

  return (
    PARTNER_TYPE_MAP[
      value.trim().toLowerCase() as keyof typeof PARTNER_TYPE_MAP
    ] ?? null
  );
}

function normalizeApplicantRole(value: unknown) {
  if (typeof value !== "string") return null;

  return (
    APPLICANT_ROLE_MAP[
      value.trim().toLowerCase() as keyof typeof APPLICANT_ROLE_MAP
    ] ?? null
  );
}


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



    const membership = await prisma.partnerMember.findFirst({

      where: {

        userId: session.user.id,

        isActive: true,

      },

      include: {

        partner: {

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

            agreements: {

              orderBy: {

                createdAt: "desc",

              },

              take: 1,

            },

          },

        },

      },

      orderBy: {

        createdAt: "desc",

      },

    });



    if (!membership) {

      return NextResponse.json(

        {

          success: true,

          application: null,

        },

        { status: 200 }

      );

    }



    return NextResponse.json(

      {

        success: true,

        application: membership.partner,

      },

      { status: 200 }

    );

  } catch (error) {

    console.error("GET /api/partner/application failed:", error);



    return NextResponse.json(

      {

        success: false,

        message: "تعذر تحميل طلب الشريك.",

      },

      { status: 500 }

    );

  }

}



export async function POST(request: NextRequest) {

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

      session.user.role !== "PARTNER_OWNER" &&

      session.user.role !== "PARTNER_ADMIN"

    ) {

      return NextResponse.json(

        {

          success: false,

          message: "هذا الحساب غير مخول لتقديم طلب شريك.",

        },

        { status: 403 }

      );

    }



    if (!session.user.emailVerifiedAt) {

      return NextResponse.json(

        {

          success: false,

          message: "يجب تأكيد البريد الإلكتروني قبل تقديم الطلب.",

        },

        { status: 403 }

      );

    }



    const existingMembership = await prisma.partnerMember.findFirst({

      where: {

        userId: session.user.id,

        isActive: true,

      },

      include: {

        partner: true,

      },

    });



    if (existingMembership) {

      return NextResponse.json(

        {

          success: false,

          message: "يوجد طلب شريك مرتبط بهذا الحساب بالفعل.",

          application: existingMembership.partner,

        },

        { status: 409 }

      );

    }



    const body = (await request.json()) as PartnerApplicationBody;



    const legalNameAr = cleanRequired(body.legalNameAr);



    if (!legalNameAr) {

      return NextResponse.json(

        {

          success: false,

          message: "الاسم القانوني بالعربية مطلوب.",

        },

        { status: 400 }

      );

    }



    const unifiedNumber = clean(body.unifiedNumber);

    const commercialRegister = clean(body.commercialRegister);



    if (unifiedNumber) {

      const duplicateUnifiedNumber = await prisma.partner.findUnique({

        where: {

          unifiedNumber,

        },

        select: {

          id: true,

        },

      });



      if (duplicateUnifiedNumber) {

        return NextResponse.json(

          {

            success: false,

            message: "الرقم الموحد مستخدم في طلب شريك آخر.",

          },

          { status: 409 }

        );

      }

    }



    if (commercialRegister) {

      const duplicateCommercialRegister = await prisma.partner.findUnique({

        where: {

          commercialRegister,

        },

        select: {

          id: true,

        },

      });



      if (duplicateCommercialRegister) {

        return NextResponse.json(

          {

            success: false,

            message: "رقم السجل التجاري مستخدم في طلب شريك آخر.",

          },

          { status: 409 }

        );

      }

    }



    const partnerType = normalizePartnerType(body.partnerType);



    const applicantRole = normalizeApplicantRole(body.applicantRole);




    if (!partnerType) {



      return NextResponse.json(



        {



          success: false,



          message: "نوع الشريك غير صالح.",



        },



        { status: 400 }



      );



    }




    if (!applicantRole) {



      return NextResponse.json(



        {



          success: false,



          message: "صفة مقدم الطلب غير صالحة.",



        },



        { status: 400 }



      );



    }





    const categories = Array.from(

      new Set(

        (body.categories ?? [])

          .map((category) => category.trim())

          .filter(Boolean)

      )

    );



    const licenses = (body.licenses ?? []).filter(

      (license) =>

        clean(license.type) ||

        clean(license.issuer) ||

        clean(license.licenseNumber)

    );



    const partner = await prisma.$transaction(async (tx) => {

      const createdPartner = await tx.partner.create({

        data: {

          legalNameAr,

          legalNameEn: clean(body.legalNameEn),

          tradeNameAr: clean(body.tradeNameAr),

          tradeNameEn: clean(body.tradeNameEn),



          partnerType,

          applicantRole,

          applicantJobTitle: clean(body.applicantJobTitle),



          unifiedNumber,

          commercialRegister,

          proofType: clean(body.proofType),

          descriptionAr: clean(body.descriptionAr),



          vatRegistered: Boolean(body.vatRegistered),

          vatNumber: clean(body.vatNumber),



          websiteUrl: clean(body.websiteUrl),



          country: clean(body.country),

          city: clean(body.city),

          address: clean(body.address),

          locationName: clean(body.locationName),

          formattedAddress: clean(body.formattedAddress),

          placeId: clean(body.placeId),

          latitude: decimalOrNull(body.latitude),

          longitude: decimalOrNull(body.longitude),



          businessPhone: clean(body.businessPhone),

          businessEmail: clean(body.businessEmail),



          financeContactName: clean(body.financeContactName),

          financeContactEmail: clean(body.financeContactEmail),

          financeContactPhone: clean(body.financeContactPhone),



          mainContactName: clean(body.mainContactName),

          mainContactEmail: clean(body.mainContactEmail),

          mainContactPhone: clean(body.mainContactPhone),

          mainContactJobTitle: clean(body.mainContactJobTitle),



          operates24h: Boolean(body.operates24h),

          operatingHours: clean(body.operatingHours),



          receivesPayments: Boolean(body.receivesPayments),

          iban: clean(body.iban),

          bankName: clean(body.bankName),

          swiftCode: clean(body.swiftCode),

          beneficiaryName: clean(body.beneficiaryName),



          publicName: clean(body.publicName),



          status: "SUBMITTED",

          submittedAt: new Date(),

          reviewedAt: null,



          categories:

            categories.length > 0

              ? {

                  create: categories.map((name) => ({

                    name,

                  })),

                }

              : undefined,



          licenses:

            licenses.length > 0

              ? {

                  create: licenses.map((license) => ({

                    type: cleanRequired(license.type) || "غير محدد",

                    issuer: cleanRequired(license.issuer) || "غير محدد",

                    licenseNumber:

                      cleanRequired(license.licenseNumber) || "غير محدد",

                    issueDate: dateOrNull(license.issueDate),

                    expiryDate: dateOrNull(license.expiryDate),

                    documentUrl: clean(license.documentUrl),

                    status: "PENDING",

                  })),

                }

              : undefined,



          members: {

            create: {

              userId: session.user.id,

              jobTitle: clean(body.applicantJobTitle),

              isActive: true,

            },

          },

        },

      });



      await tx.auditLog.create({

        data: {

          userId: session.user.id,

          action: "PARTNER_APPLICATION_SUBMITTED",

          entityType: "Partner",

          entityId: createdPartner.id,

          afterData: {

            status: "SUBMITTED",

            legalNameAr,

            tradeNameAr: clean(body.tradeNameAr),

          },

        },

      });



      return createdPartner;

    });
    runPartnerApplicationWorkflow({
      partnerId: partner.id,
      legalNameAr: partner.legalNameAr,
      tradeNameAr: partner.tradeNameAr,
      partnerEmail: session.user.email,
      status: partner.status,
      nextAction: "سيبدأ تدقيق الطلب ومراجعته، وسيتم إشعاركم بأي تحديث.",
    }).catch((error) => {
      console.error("Partner application workflow failed:", error);
    });


    return NextResponse.json(

      {

        success: true,

        message: "تم استلام طلب الشراكة وتحويله إلى التدقيق.",

        application: {

          id: partner.id,

          status: partner.status,

          legalNameAr: partner.legalNameAr,

          tradeNameAr: partner.tradeNameAr,

          submittedAt: partner.submittedAt,

        },

      },

      { status: 201 }

    );

  } catch (error) {

    console.error("POST /api/partner/application failed:", error);



    return NextResponse.json(

      {

        success: false,

        message: "حدث خطأ أثناء حفظ طلب الشريك.",

      },

      { status: 500 }

    );

  }

}