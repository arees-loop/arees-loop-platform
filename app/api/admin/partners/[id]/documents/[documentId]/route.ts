import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Streams one private applicant document only after per-request admin auth
 * and partner/document ownership checks. No file URLs or blob tokens exposed.
 */
export async function GET(_request: NextRequest, {params}:{params:Promise<{id:string;documentId:string}>}) {
  const session = await getCurrentSession();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN"))
    return new NextResponse("Forbidden",{status:403});
  const {id,documentId} = await params;
  const doc = await prisma.partnerDocument.findFirst({
    where:{id:documentId,partnerId:id},
    select:{fileUrl:true,fileName:true,mimeType:true}
  });
  if (!doc) return new NextResponse("Not found",{status:404});
  const mime = doc.mimeType;
  if (mime !== "application/pdf" && mime !== "image/jpeg" && mime !== "image/png")
    return new NextResponse("Unsupported file",{status:415});
  try {
    const blob = await get(doc.fileUrl,{access:"private"});
    if (!blob || blob.statusCode !== 200) return new NextResponse("Not found",{status:404});
    return new NextResponse(blob.stream,{
      headers:{
        "Content-Type":mime,
        "Content-Disposition":"inline",
        "Cache-Control":"private, no-store",
        "X-Content-Type-Options":"nosniff",
        "Content-Security-Policy":"default-src 'none'; sandbox",
        "X-Frame-Options":"SAMEORIGIN"
      }
    });
  } catch {
    return new NextResponse("Unable to preview file",{status:502});
  }
}
