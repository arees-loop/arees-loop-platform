import {licenseValidity,licenseValidityLabel} from "@/lib/license-validity";
import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يرجى تسجيل الدخول."},{status:401});
 const applications=await prisma.guideApplication.findMany({where:{userId:session.user.id},select:{id:true,fullName:true,email:true,phone:true,gender:true,city:true,countries:true,licenseCategory:true,licenseNumber:true,licenseExpiresAt:true,languages:true,specialization:true,bio:true,photoPublicationConsent:true,status:true,reviewNotes:true,createdAt:true,reviewedAt:true},orderBy:{createdAt:"desc"},take:10});
 return NextResponse.json({success:true,applications:applications.map(item=>({...item,licenseValidity:licenseValidity(item.licenseExpiresAt),licenseValidityLabel:licenseValidityLabel(item.licenseExpiresAt)}))});
}
