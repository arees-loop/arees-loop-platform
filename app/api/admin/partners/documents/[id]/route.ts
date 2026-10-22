import { NextRequest } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export const runtime = "nodejs";

const PREVIEW_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return new Response("Unauthorized", { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const { id } = await context.params;
  if (!id || id.length > 128) return new Response("Not found", { status: 404 });

  const document = await prisma.partnerDocument.findUnique({
    where: { id },
    select: { partnerId: true, fileUrl: true, mimeType: true },
  });
  if (!document || !document.mimeType || !PREVIEW_TYPES.has(document.mimeType)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const blobUrl = new URL(document.fileUrl);
    if (blobUrl.protocol !== "https:") return new Response("Not found", { status: 404 });
    const pathname = decodeURIComponent(blobUrl.pathname.replace(/^\\/+/, ""));
    if (!pathname.startsWith(`partners/${document.partnerId}/`) || pathname.includes("..")) {
      return new Response("Not found", { status: 404 });
    }
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || result.blob.contentType !== document.mimeType) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(result.stream, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch {
    return new Response("Document preview unavailable", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
