import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const session=await getCurrentSession();
 if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role))return NextResponse.json({success:false,message:"غير مصرح"},{status:403});
 const [partners,guides]=await Promise.all([
  prisma.licenseRenewalRequest.count({where:{status:"UNDER_REVIEW"}}),
  prisma.guideLicenseRenewal.count({where:{status:"UNDER_REVIEW"}})
 ]);
 return NextResponse.json({success:true,counts:{partners,guides,total:partners+guides}});
}
