import {NextRequest, NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {put, get} from "@vercel/blob";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import {customerTransportOwnership} from "@/lib/customer-transport-claim";
import {canManageTransport} from "@/lib/transport-permissions";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
const fail=(message:string,status=400)=>NextResponse.json({success:false,message},{status,headers});
const validReference=(value:string)=>/^AR-(AIR|SEA)-[A-F0-9]{10}$/.test(value);
type Meta={pathname?:string;name?:string;size?:number;contentType?:string};

async function access(req:NextRequest,reference:string,write=false){
  const session=await getCurrentSession();
  const staff=!!session&&["ADMIN","SUPER_ADMIN"].includes(session.user.role);
  if(write&&!staff)return null;
  const ownership=staff?null:customerTransportOwnership(req,session?.user.id);
  if(!staff&&!ownership)return null;
  const request=await prisma.transportRequest.findFirst({
    where:{reference,...(staff?{}:ownership||{})},
    select:{id:true,reference:true,kind:true,status:true,assignedToId:true}
  });
  if(!request||!["FLIGHT","FERRY"].includes(request.kind))return null;
  if(staff&&session!.user.role!=="SUPER_ADMIN"){
    if(request.assignedToId!==session!.user.id||!canManageTransport(session!.user,request.kind==="FERRY"?"FERRY":"FLIGHT"))return null;
  }
  return {request,session,staff};
}

export async function GET(req:NextRequest){
  const reference=req.nextUrl.searchParams.get("reference")||"";
  if(!validReference(reference))return fail("مرجع الطلب غير صحيح.");
  const auth=await access(req,reference);
  if(!auth)return fail("لا تملك صلاحية عرض التذكرة.",403);
  const all=await prisma.transportRequestEvent.findMany({
    where:{requestId:auth.request.id,action:"TICKET_PDF_DELIVERED"},
    orderBy:[{createdAt:"desc"},{id:"desc"}],take:20,
    select:{id:true,createdAt:true,details:true}
  });
  const tickets=all.map(event=>{
    const m=(event.details||{}) as Meta;
    return {id:event.id,name:m.name||"تذكرة سفر.pdf",size:m.size||null,createdAt:event.createdAt};
  });
  const id=req.nextUrl.searchParams.get("file");
  if(!id)return NextResponse.json({success:true,tickets,canComplete:auth.staff&&["PAID","EXECUTING"].includes(auth.request.status)&&tickets.length>0},{headers});
  const found=all.find(event=>event.id===id);
  if(!found)return fail("التذكرة غير موجودة.",404);
  const meta=(found.details||{}) as Meta;
  if(!meta.pathname?.startsWith("issued-tickets/"+auth.request.id+"/"))return fail("الملف غير متاح.",404);
  try{
    const blob=await get(meta.pathname,{access:"private"});
    if(!blob||blob.statusCode!==200)return fail("التذكرة غير موجودة في التخزين الخاص.",404);
    const disposition=req.nextUrl.searchParams.get("mode")==="preview"?"inline":"attachment";
    return new Response(blob.stream,{headers:{
      "Content-Type":"application/pdf",
      "Content-Disposition":disposition+'; filename="Arees-Ticket-'+reference+'.pdf"',
      "Cache-Control":"private, no-store",
      "X-Content-Type-Options":"nosniff",
      "Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; sandbox"
    }});
  }catch(error){
    console.error("Ticket pdf retrieval failed",error);
    return fail("تعذر عرض التذكرة من التخزين الخاص. حاول مرة أخرى.",503);
  }
}

export async function POST(req:NextRequest){
  const session=await getCurrentSession();
  if(!session||!["ADMIN","SUPER_ADMIN"].includes(session.user.role))
    return fail("رفع تذكرة السفر مخصص للإدارة فقط.",403);
  const data=await req.formData().catch(()=>null);
  if(!data)return fail("تعذر قراءة بيانات رفع التذكرة.");
  const reference=String(data.get("reference")||"");
  if(!validReference(reference))return fail("مرجع الطلب غير صحيح.");
  const auth=await access(req,reference,true);
  if(!auth)return fail("غير مصرح بتسليم تذكرة هذا الطلب.",403);
  const request=auth.request;
  if(!["PAID","EXECUTING"].includes(request.status))
    return fail("يجب اعتماد وصول السداد أولاً قبل إرسال التذكرة للعميل.",409);
  const verified=await prisma.transportRequestEvent.findFirst({
    where:{requestId:request.id,action:"ADMIN_PAYMENT_VERIFIED"},
    select:{id:true}
  });
  if(!verified)return fail("يجب مراجعة الحوالة وتأكيدها من قسم السداد أولاً.",409);
  const file=data.get("file");
  if(!(file instanceof File))return fail("اختر ملف التذكرة PDF.");
  if(file.size<20||file.size>10*1024*1024)
    return fail("حجم ملف التذكرة يجب ألا يتجاوز 10 ميجابايت.");
  if(file.type!=="application/pdf")return fail("نوع الملف يجب أن يكون PDF.");
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(String.fromCharCode(...bytes.slice(0,5))!=="%PDF-")
    return fail("محتوى الملف لا يطابق ملف PDF.");
  const pathname="issued-tickets/"+request.id+"/"+randomUUID()+".pdf";
  try{
    const stored=await put(pathname,Buffer.from(bytes),{
      access:"private",contentType:"application/pdf",addRandomSuffix:false
    });
    const event=await prisma.transportRequestEvent.create({
      data:{
        requestId:request.id,actorId:session.user.id,actorName:"إدارة أريس",
        action:"TICKET_PDF_DELIVERED",fromStatus:request.status,toStatus:request.status,
        details:{pathname:stored.pathname,name:file.name.slice(0,140),size:file.size,contentType:"application/pdf",deliveredVia:"customer_portal"}
      },select:{id:true,createdAt:true}
    });
    return NextResponse.json({success:true,eventId:event.id,message:"تم حفظ التذكرة وإتاحتها لصاحب الطلب في «طلباتي». لم تُرسل عبر واتساب تلقائياً."},{headers});
  }catch(error){
    console.error("Ticket delivery failed",error);
    return fail("تعذر حفظ أو إتاحة التذكرة للعميل. لم يتم تغيير حالة الطلب.",503);
  }
}
