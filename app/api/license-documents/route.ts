import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {put,del} from "@vercel/blob";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";

export const runtime="nodejs";
const slots=["PASSPORT","LOCAL_LICENSE","PORTRAIT"] as const;
const limit=4*1024*1024;
const guarded=()=>process.env.AREES_LICENSE_PRIVATE_UPLOAD_ENABLED==="true";

function response(message:string,status:number){return NextResponse.json({success:false,message},{status,headers:{"Cache-Control":"private, no-store"}});}
export async function POST(request:NextRequest){
 if(!guarded())return response("رفع مستندات الرخصة قيد الاختبار الآمن، ولا يمكن إرسال طلب ناقص.",503);
 const session=await getCurrentSession();
 if(!session||session.user.status!=="ACTIVE")return response("سجّل الدخول لإرفاق مستندات الرخصة.",401);
 let path:string|undefined;
 try{
  const data=await request.formData(),file=data.get("file"),slot=data.get("slot");
  if(typeof slot!=="string"||!slots.includes(slot as typeof slots[number]))return response("نوع المستند غير صالح.",400);
  if(!(file instanceof File)||file.size<100||file.size>limit)return response("أرفق صورة بحد أقصى 4 ميجابايت.",400);
  const ext=file.type==="image/png"?"png":file.type==="image/jpeg"?"jpg":null;
  if(!ext)return response("الصور المدعومة JPG وPNG فقط.",415);
  const head=new Uint8Array(await file.slice(0,8).arrayBuffer());
  const image=(ext==="png"&&[137,80,78,71,13,10,26,10].every((v,i)=>head[i]===v))||
    (ext==="jpg"&&head[0]===255&&head[1]===216&&head[2]===255);
  if(!image)return response("محتوى الصورة غير مطابق لنوعها.",415);
  // New UUID path; never use passport name, customer name or device filename.
  const blob=await put(`license-applications/${session.user.id}/${randomUUID()}.${ext}`,file,{
   access:"private",contentType:file.type,addRandomSuffix:false
  });
  path=blob.pathname;
  const doc=await prisma.internationalLicenseDocument.create({data:{
   userId:session.user.id,slot,blobPath:blob.pathname,mimeType:file.type,byteSize:file.size
  },select:{id:true,slot:true,createdAt:true}});
  return NextResponse.json({success:true,document:doc},{status:201,headers:{"Cache-Control":"private, no-store"}});
 }catch(error){
  if(path)await del(path).catch(()=>{});
  console.error("International license private upload failed",error instanceof Error?error.name:"UNKNOWN");
  return response("تعذر رفع الملف بأمان. لم تتم الإضافة إلى السلة.",503);
 }
}
