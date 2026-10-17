import {NextRequest,NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export const runtime="nodejs";
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status});
export async function GET(){
 const session=await getCurrentSession();
 if(!session||session.user.role!=="SUPER_ADMIN")return fail("غير مصرح",403);
 const accounts=await prisma.bankTransferAccount.findMany({orderBy:{createdAt:"desc"},select:{id:true,bankName:true,beneficiaryName:true,iban:true,active:true}});
 return NextResponse.json({success:true,accounts},{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(req:NextRequest){
 const session=await getCurrentSession();
 if(!session||session.user.role!=="SUPER_ADMIN")return fail("غير مصرح",403);
 const data=await req.json().catch(()=>null);
 const bankName=String(data?.bankName||"").trim().slice(0,120),beneficiaryName=String(data?.beneficiaryName||"").trim().slice(0,160),iban=String(data?.iban||"").replace(/\s+/g,"").toUpperCase();
 if(!bankName||!beneficiaryName||!/^SA[0-9]{22}$/.test(iban))return fail("أدخل اسم البنك والمستفيد وآيبان سعودي صحيح الشكل.");
 const account=await prisma.bankTransferAccount.create({data:{bankName,beneficiaryName,iban,active:false}});
 return NextResponse.json({success:true,id:account.id,message:"تم حفظ الحساب غير مفعل. راجع البيانات قبل التفعيل."});
}
export async function PATCH(req:NextRequest){
 const session=await getCurrentSession();
 if(!session||session.user.role!=="SUPER_ADMIN")return fail("غير مصرح",403);
 const data=await req.json().catch(()=>null),id=String(data?.id||"");
 const existing=await prisma.bankTransferAccount.findUnique({where:{id}});
 if(!existing)return fail("الحساب غير موجود",404);
 await prisma.$transaction(async tx=>{
  if(data?.active===true)await tx.bankTransferAccount.updateMany({where:{active:true},data:{active:false}});
  await tx.bankTransferAccount.update({where:{id},data:{active:data?.active===true}});
 });
 return NextResponse.json({success:true});
}
