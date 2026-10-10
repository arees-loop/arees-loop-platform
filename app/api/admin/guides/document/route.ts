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
 const kind=request.nextUrl.searchParams.get("kind");
 if(!id||!["license","photo"].includes(kind||""))return new Response("Not found",{status:404});
 const guide=await prisma.guideApplication.findUnique({where:{id},select:{licensePath:true,photoPath:true}});
 const path=kind==="license"?guide?.licensePath:guide?.photoPath;
 if(!path)return new Response("Not found",{status:404});
 const file=await get(path,{access:"private"});
 if(!file||file.statusCode!==200)return new Response("Not found",{status:404});
 return new Response(file.stream,{headers:{"Content-Type":file.blob.contentType||"application/octet-stream","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"sandbox"}});
}
