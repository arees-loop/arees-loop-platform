import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentSession();
  if (session?.user.role !== "SUPER_ADMIN") return NextResponse.json({success:false},{status:403});
  const account = await prisma.platformBankAccount.findUnique({where:{id:"primary"}});
  return NextResponse.json({success:true,account});
}

export async function PUT(request:NextRequest) {
  const session = await getCurrentSession();
  if (session?.user.role !== "SUPER_ADMIN") return NextResponse.json({success:false},{status:403});
  const fields = await request.json();
  const bankName = String(fields.bankName||"").trim();
  const beneficiaryName = String(fields.beneficiaryName||"").trim();
  const iban = String(fields.iban||"").replaceAll(" ","").toUpperCase();
  const qrImageUrl = String(fields.qrImageUrl||"").trim();
  if (!bankName || !beneficiaryName || !/^SA[0-9]{22}$/.test(iban)) return NextResponse.json({success:false,message:"تحقق من معلومات الحساب."},{status:400});
  if (qrImageUrl && !qrImageUrl.startsWith("https://")) return NextResponse.json({success:false,message:"رابط QR يجب أن يكون HTTPS."},{status:400});
  const account = await prisma.platformBankAccount.upsert({
    where:{id:"primary"},
    create:{id:"primary",bankName,beneficiaryName,iban,qrImageUrl:qrImageUrl||null,enabled:fields.enabled===true,updatedById:session.user.id},
    update:{bankName,beneficiaryName,iban,qrImageUrl:qrImageUrl||null,enabled:fields.enabled===true,updatedById:session.user.id}
  });
  return NextResponse.json({success:true,account});
}
