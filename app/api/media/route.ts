import { NextRequest } from "next/server";
import { get } from "@vercel/blob";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname");
  if (!pathname || !pathname.startsWith("services/")) {
    return new Response("Not found", { status: 404 });
  }

  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
