import {NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export const runtime="nodejs";
export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"سجل الدخول"},{status:401});
 const banks=await prisma.bankTransferAccount.findMany({where:{active:true},orderBy:{createdAt:"desc"},select:{id:true,bankName:true,beneficiaryName:true,iban:true,note:true}});
 return NextResponse.json({success:true,banks},{headers:{"Cache-Control":"private, no-store"}});
}
