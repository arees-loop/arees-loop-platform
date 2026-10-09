import {hasAdminPermission} from "@/lib/admin-permissions";
import {NextRequest} from "next/server";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
import {get} from "@vercel/blob";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const session=await getCurrentSession();
 if(!session||!hasAdminPermission(session.user,"PARTNER_REQUESTS"))return new Response("Forbidden",{status:403});
 const id=request.nextUrl.searchParams.get("id")||"";
 if(!id||id.length>120)return new Response("Not found",{status:404});
 const renewal=await prisma.guideLicenseRenewal.findUnique({where:{id},select:{documentPath:true}});
 if(!renewal)return new Response("Not found",{status:404});
 const file=await get(renewal.documentPath,{access:"private"});
 if(!file||file.statusCode!==200)return new Response("Not found",{status:404});
 return new Response(file.stream,{headers:{"Content-Type":file.blob.contentType||"application/octet-stream","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"sandbox"}});
}
