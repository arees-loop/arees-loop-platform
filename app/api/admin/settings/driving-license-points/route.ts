import { NextRequest,NextResponse } from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
const key="DRIVING_LICENSE_REWARD_150";
export async function GET(){
 const session=await getCurrentSession();
 if(session?.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false},{status:403});
 const setting=await prisma.platformPaymentSetting.findUnique({where:{key}});
 return NextResponse.json({success:true,enabled:setting?.enabled??false,points:150});
}
export async function PUT(request:NextRequest){
 const session=await getCurrentSession();
 if(session?.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false},{status:403});
 let input:unknown;
 try{input=await request.json()}catch{return NextResponse.json({success:false},{status:400})}
 if(!input||typeof input!=="object"||typeof (input as {enabled?:unknown}).enabled!=="boolean")return NextResponse.json({success:false},{status:400});
 const enabled=(input as {enabled:boolean}).enabled;
 await prisma.platformPaymentSetting.upsert({where:{key},create:{key,enabled,updatedById:session.user.id},update:{enabled,updatedById:session.user.id}});
 return NextResponse.json({success:true,enabled,points:150});
}
