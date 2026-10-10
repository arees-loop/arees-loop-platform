import {hasAdminPermission} from "@/lib/admin-permissions";
import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const session=await getCurrentSession();
 if(!session||!hasAdminPermission(session.user,"PARTNER_REQUESTS"))return NextResponse.json({success:false,message:"غير مصرح"},{status:403});
 const [partners,guides]=await Promise.all([
  prisma.licenseRenewalRequest.count({where:{status:"UNDER_REVIEW"}}),
  prisma.guideLicenseRenewal.count({where:{status:"UNDER_REVIEW"}})
 ]);
 return NextResponse.json({success:true,counts:{partners,guides,total:partners+guides}});
}
