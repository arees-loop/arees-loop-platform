import {NextResponse} from "next/server";
import {get} from "@vercel/blob";
import {getCurrentSession} from "@/lib/session";
import {prisma} from "@/lib/prisma";
export const runtime="nodejs";
export async function GET(_request:Request,context:{params:Promise<{reference:string}>}){
 const session=await getCurrentSession();
 if(session?.user.role!=="SUPER_ADMIN")return new Response("Forbidden",{status:403});
 const {reference}=await context.params;
 const order=await prisma.bankTransferOrder.findUnique({where:{reference},select:{receiptPath:true}});
 if(!order?.receiptPath)return new Response("Not found",{status:404});
 const result=await get(order.receiptPath,{access:"private"});
 if(!result||result.statusCode!==200)return new Response("Not found",{status:404});
 return new NextResponse(result.stream,{headers:{"Content-Type":result.blob.contentType||"application/octet-stream","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Disposition":"attachment; filename=bank-transfer-receipt"}});
}
