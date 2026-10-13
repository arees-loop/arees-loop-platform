import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentSession } from "@/lib/session";
export const runtime="nodejs";
const types:Record<string,string>={"image/png":"png","image/jpeg":"jpg","image/webp":"webp"};
export async function POST(request:NextRequest){
  const session=await getCurrentSession();
  if(!session)return NextResponse.json({success:false,message:"يلزم تسجيل الدخول."},{status:401});
  if(session.user.role!=="SUPER_ADMIN")return NextResponse.json({success:false,message:"رفع عروض الصور للسوبر أدمن فقط."},{status:403});
  try{
    const form=await request.formData();
    const file=form.get("file");
    const kind=String(form.get("kind")||"");
    if(kind!=="FLIGHT"&&kind!=="FERRY")return NextResponse.json({success:false,message:"حدد القسم."},{status:400});
    if(!(file instanceof File)||file.size<=0||file.size>4*1024*1024)return NextResponse.json({success:false,message:"ملف الصورة مطلوب (بحد أقصى 4 ميجابايت)."}, {status:400});
    const ext=types[file.type];
    if(!ext)return NextResponse.json({success:false,message:"الصيغ المسموحة PNG وJPG وWEBP فقط."},{status:415});
    const h=new Uint8Array(await file.slice(0,16).arrayBuffer());
    const valid=file.type==="image/png"?[137,80,78,71,13,10,26,10].every((n,i)=>h[i]===n):
      file.type==="image/jpeg"?h[0]===255&&h[1]===216&&h[2]===255:
      String.fromCharCode(...h.slice(0,4))==="RIFF"&&String.fromCharCode(...h.slice(8,12))==="WEBP";
    if(!valid)return NextResponse.json({success:false,message:"محتوى الصورة غير متطابق مع امتدادها."},{status:415});
    const pathname=`transport-offers/${kind}/${crypto.randomUUID()}.${ext}`;
    const blob=await put(pathname,file,{access:"private",addRandomSuffix:false,contentType:file.type});
    return NextResponse.json({success:true,url:`/api/media?pathname=${encodeURIComponent(blob.pathname)}`});
  }catch(err){console.error("transport offer image upload failed",err);
    return NextResponse.json({success:false,message:"تعذر رفع الصورة. تحقق من اتصال Vercel Blob الخاص بالمشروع."},{status:503});
  }
}
