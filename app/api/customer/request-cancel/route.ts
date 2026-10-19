import {NextRequest,NextResponse} from "next/server";
import {TRAVEL_REFERENCE_PATTERN} from "@/lib/request-reference";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"سجّل الدخول بنفس حساب صاحب الطلب."},{status:401});
 const body=await req.json().catch(()=>null);
 const reference=typeof body?.reference==="string"?body.reference:"";
 if(!TRAVEL_REFERENCE_PATTERN.test(reference))return NextResponse.json({success:false,message:"مرجع غير صالح."},{status:400});
 const request=await prisma.transportRequest.findFirst({where:{reference,userId:session.user.id},select:{id:true,status:true}});
 if(!request)return NextResponse.json({success:false,message:"الطلب غير موجود في حسابك."},{status:404});
 if(!["NEW","QUOTE_READY"].includes(request.status))return NextResponse.json({success:false,message:"لا يمكن إلغاء هذا الطلب بعد بدء الإجراءات أو السداد. تواصل مع الإدارة."},{status:409});
 const changed=await prisma.$transaction(async tx=>{
  const result=await tx.transportRequest.updateMany({where:{id:request.id,status:{in:["NEW","QUOTE_READY"]}},data:{status:"CANCELED",cancellationReason:"إلغاء بطلب العميل قبل بدء التنفيذ"}});
  if(result.count!==1)return false;
  await tx.transportRequestEvent.create({data:{requestId:request.id,actorId:session.user.id,actorName:"العميل",action:"CUSTOMER_CANCELED",fromStatus:request.status,toStatus:"CANCELED",details:{reason:"إلغاء بطلب العميل"}}});
  return true;
 });
 return NextResponse.json(changed?{success:true,message:"تم إلغاء الطلب وحفظه في السجل."}:{success:false,message:"تغيرت حالة الطلب، حدّث الصفحة."},{status:changed?200:409});
}
