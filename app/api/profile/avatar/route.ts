import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
export const runtime="nodejs";
const allowed:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
export async function POST(request:NextRequest){
 const session=await getCurrentSession();
 if(!session)return NextResponse.json({success:false,message:"يجب تسجيل الدخول"},{status:401});
 const form=await request.formData().catch(()=>null);
 const file=form?.get("image");
 if(!(file instanceof File)||!allowed[file.type]||file.size>2*1024*1024||file.size===0)return NextResponse.json({success:false,message:"اختر صورة JPG أو PNG أو WebP بحجم لا يتجاوز 2 ميجابايت"},{status:400});
 try{
  const bytes=Buffer.from(await file.arrayBuffer());
  const magicValid=file.type==="image/jpeg"?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:file.type==="image/png"?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP";
  if(!magicValid)return NextResponse.json({success:false,message:"ملف الصورة غير صالح"},{status:400});
  const blob=await put(`avatars/${session.user.id}/${crypto.randomUUID()}.${allowed[file.type]}`,bytes,{access:"public",contentType:file.type,addRandomSuffix:false});
  await prisma.user.update({where:{id:session.user.id},data:{profileImageUrl:blob.url}});
  return NextResponse.json({success:true,url:blob.url});
 }catch(e){console.error("avatar upload failed",e);return NextResponse.json({success:false,message:"تعذر حفظ الصورة. تحقق من إعداد تخزين الصور."},{status:500});}
}
