import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
export async function GET(){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"سجّل الدخول أولاً."},{status:401});
 const orders=await prisma.bankTransferOrder.findMany({where:{userId:session.user.id},orderBy:{createdAt:"desc"},take:100,select:{reference:true,items:true,amountSar:true,status:true,createdAt:true,updatedAt:true,receiptUploadedAt:true,reviewNotes:true}});
 return NextResponse.json({success:true,orders:orders.map(o=>({...o,amountSar:Number(o.amountSar)}))});
}
