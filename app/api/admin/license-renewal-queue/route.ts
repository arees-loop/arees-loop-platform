import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const session=await getCurrentSession();
 if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role))return NextResponse.json({success:false,message:"غير مصرح"},{status:403});
 const [partnerRenewals,guideRenewals]=await Promise.all([
  prisma.licenseRenewalRequest.findMany({where:{status:"UNDER_REVIEW"},select:{id:true,partnerId:true,licenseId:true,createdAt:true,requestedExpiryDate:true},orderBy:{createdAt:"asc"},take:100}),
  prisma.guideLicenseRenewal.findMany({where:{status:"UNDER_REVIEW"},select:{id:true,applicationId:true,userId:true,createdAt:true,requestedExpiryDate:true},orderBy:{createdAt:"asc"},take:100})
 ]);
 return NextResponse.json({success:true,partnerRenewals,guideRenewals,counts:{partners:partnerRenewals.length,guides:guideRenewals.length,total:partnerRenewals.length+guideRenewals.length}});
}
