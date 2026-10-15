import { NextRequest,NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
export async function GET(){
 const session=await getCurrentSession();
 if(session?.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false},{status:403});
 const orders=await prisma.bankTransferOrder.findMany({orderBy:{createdAt:"desc"},take:100});
 return NextResponse.json({success:true,orders:orders.map(o=>({...o,amountSar:Number(o.amountSar)}))});
}
export async function PATCH(request:NextRequest){
 const session=await getCurrentSession();
 if(session?.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false},{status:403});
 let input:unknown;try{input=await request.json()}catch{return NextResponse.json({success:false},{status:400})}
 if(!input||typeof input!=="object")return NextResponse.json({success:false},{status:400});
 const data=input as Record<string,unknown>;
 const reference=String(data.reference||"");
 const action=String(data.action||"");
 const notes=String(data.notes||"").trim().slice(0,1500);
 if(!reference||!["CONFIRM_RECEIPT","REQUEST_CORRECTION","START_PROCESSING","START_DELIVERY","COMPLETE"].includes(action))return NextResponse.json({success:false},{status:400});
 const current=await prisma.bankTransferOrder.findUnique({where:{reference}});
 if(!current)return NextResponse.json({success:false},{status:404});
 let status:string;
 if(action==="CONFIRM_RECEIPT"&&current.status==="RECEIPT_UNDER_REVIEW"&&current.receiptPath)status="PAYMENT_CONFIRMED";
 else if(action==="REQUEST_CORRECTION"&&current.status==="RECEIPT_UNDER_REVIEW"&&notes)status="NEEDS_CORRECTION";
 else if(action==="START_PROCESSING"&&current.status==="PAYMENT_CONFIRMED")status="IN_PROGRESS";
 else if(action==="START_DELIVERY"&&current.status==="IN_PROGRESS"&&Array.isArray(current.items)&&(current.items as Array<{itemType?:string}>).some(x=>x.itemType==="DRIVING_LICENSE"))status="OUT_FOR_DELIVERY";
 else if(action==="COMPLETE"&&["IN_PROGRESS","OUT_FOR_DELIVERY"].includes(current.status) && (!Array.isArray(current.items) || !(current.items as Array<{itemType?:string}>).some(x=>x.itemType==="DRIVING_LICENSE") || current.status==="OUT_FOR_DELIVERY"))status="COMPLETED";
 else return NextResponse.json({success:false,message:"هذا الانتقال غير مسموح من حالة الطلب الحالية."},{status:409});
 const result=await prisma.$transaction(async(tx)=>{
   const changed=await tx.bankTransferOrder.updateMany({where:{id:current.id,status:current.status},data:{status,reviewedById:session.user.id,reviewedAt:new Date(),reviewNotes:notes||null}});
   if(changed.count!==1)return false;
   if(status==="COMPLETED" && Array.isArray(current.items) && (current.items as Array<{itemType?:string}>).some(item=>item.itemType==="DRIVING_LICENSE")){
     const setting=await tx.platformPaymentSetting.findUnique({where:{key:"DRIVING_LICENSE_REWARD_150"}});
     if(setting?.enabled){
       await tx.loyaltyWallet.upsert({where:{userId:current.userId},create:{userId:current.userId,balance:150},update:{balance:{increment:150}}});
       await tx.loyaltyTransaction.create({data:{userId:current.userId,type:"EARN",points:150,description:"إتمام طلب رخصة القيادة الدولية",referenceId:current.reference}});
     }
   }
   return true;
 });
 if(!result)return NextResponse.json({success:false,message:"تم تعديل الطلب بواسطة موظف آخر."},{status:409});
 return NextResponse.json({success:true,status});
}
