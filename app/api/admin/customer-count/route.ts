import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false},{status:401});
 if(session.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false},{status:403});
 try{
  const count=await prisma.user.count({where:{role:"CUSTOMER"}});
  return NextResponse.json({success:true,count},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  console.error("Customer count failed",error);
  return NextResponse.json({success:false},{status:500});
 }
}
