import {NextRequest,NextResponse} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export const runtime="nodejs";
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status});
export async function GET(){
 const session=await getCurrentSession();
 if(!session||session.user.role!=="SUPER_ADMIN")return fail("غير مصرح",403);
 const accounts=await prisma.bankTransferAccount.findMany({orderBy:{createdAt:"desc"},select:{id:true,bankName:true,beneficiaryName:true,iban:true,active:true,note:true}});
 return NextResponse.json({success:true,accounts},{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(req:NextRequest){
 const session=await getCurrentSession();
 if(!session||session.user.role!=="SUPER_ADMIN")return fail("غير مصرح",403);
 const data=await req.json().catch(()=>null);
 const bankName=String(data?.bankName||"").trim().slice(0,120),beneficiaryName=String(data?.beneficiaryName||"").trim().slice(0,160),iban=String(data?.iban||"").replace(/\s+/g,"").toUpperCase();
 if(!bankName||!beneficiaryName||!/^SA[0-9]{22}$/.test(iban))return fail("أدخل اسم البنك والمستفيد وآيبان سعودي صحيح الشكل.");
 const note=String(data?.note||"").trim().slice(0,1500);
 const account=await prisma.bankTransferAccount.create({data:{bankName,beneficiaryName,iban,note:note||null,active:false}});
 return NextResponse.json({success:true,id:account.id,message:"تم حفظ الحساب غير مفعل. راجع البيانات قبل التفعيل."});
}
export async function PATCH(req:NextRequest){
 const session=await getCurrentSession();
 if(!session||session.user.role!=="SUPER_ADMIN")return fail("غير مصرح",403);
 const data=await req.json().catch(()=>null),id=String(data?.id||"");
 const existing=await prisma.bankTransferAccount.findUnique({where:{id}});
 if(!existing)return fail("الحساب غير موجود",404);
 const updates:{active?:boolean;note?:string|null}={};
 if(typeof data?.active==="boolean")updates.active=data.active;
 if(typeof data?.note==="string")updates.note=data.note.trim().slice(0,1500)||null;
 if(!Object.keys(updates).length)return fail("لم يتم تحديد أي تغيير.");
 await prisma.bankTransferAccount.update({where:{id},data:updates});
 return NextResponse.json({success:true});
}
