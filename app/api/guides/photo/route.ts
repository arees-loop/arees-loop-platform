import {NextRequest} from "next/server";
import {get} from "@vercel/blob";
import {prisma} from "@/lib/prisma";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const id=request.nextUrl.searchParams.get("id")||"";
 if(!id||id.length>120)return new Response("Not found",{status:404});
 const guide=await prisma.guideApplication.findFirst({where:{id,status:"APPROVED",photoPublicationConsent:true,licenseExpiresAt:{gt:new Date()},photoPath:{not:null}},select:{photoPath:true}});
 if(!guide?.photoPath)return new Response("Not found",{status:404});
 const file=await get(guide.photoPath,{access:"private"});
 if(!file||file.statusCode!==200||!["image/jpeg","image/png","image/webp"].includes(file.blob.contentType))return new Response("Not found",{status:404});
 return new Response(file.stream,{headers:{"Content-Type":file.blob.contentType,"Cache-Control":"public, max-age=300","X-Content-Type-Options":"nosniff"}});
}
