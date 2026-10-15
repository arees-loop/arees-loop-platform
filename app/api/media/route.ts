import { NextRequest } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname");
  if (!pathname) return new Response("Not found", { status: 404 });
  const logoMatch = new RegExp("^partners/([^/]+)/logos/[a-f0-9-]+[.](png|jpg|webp)$").exec(pathname);
  const successMatch = new RegExp("^success-partners/([a-zA-Z0-9_-]+)/[a-f0-9-]+[.](png|jpg|webp)$").exec(pathname);
  const transportMatch = /^transport-offers\/(FLIGHT|FERRY|VISA|DRIVING_LICENSE)\/[a-f0-9-]+\.(png|jpg|webp)$/.exec(pathname);
  const hotelMatch = /^transport-offers\/HOTEL\/[a-f0-9-]+\.(png|jpg|webp)$/.exec(pathname);
  if (!pathname.startsWith("services/") && !logoMatch && !successMatch && !transportMatch && !hotelMatch) {
    return new Response("Not found", { status: 404 });
  }

  let publicAsset = !logoMatch && !successMatch && !transportMatch && !hotelMatch;
  if(hotelMatch){
    const offer=await prisma.hotelOffer.findFirst({
      where:{deletedAt:null,OR:[{bannerUrl:`/api/media?pathname=${encodeURIComponent(pathname)}`},{imageUrls:{array_contains:[`/api/media?pathname=${encodeURIComponent(pathname)}`]}}]},
      select:{isVisible:true,startsAt:true,endsAt:true},
    });
    if(!offer)return new Response("Not found",{status:404});
    const now=new Date();
    publicAsset=offer.isVisible&&(!offer.startsAt||offer.startsAt<=now)&&(!offer.endsAt||offer.endsAt>=now);
    if(!publicAsset){
      const session=await getCurrentSession();
      if(session?.user.role!=="SUPER_ADMIN")return new Response("Not found",{status:404});
    }
  }
  if (transportMatch) {
    const offer = await prisma.transportOffer.findFirst({
      where: { deletedAt:null,OR:[{bannerUrl:`/api/media?pathname=${encodeURIComponent(pathname)}`},{imageUrls:{array_contains:[`/api/media?pathname=${encodeURIComponent(pathname)}`]}}] },
      select: { isVisible: true,startsAt:true,endsAt:true },
    });
    if (!offer) return new Response("Not found", { status: 404 });
    const now=new Date();
    publicAsset = offer.isVisible && (!offer.startsAt||offer.startsAt<=now) && (!offer.endsAt||offer.endsAt>=now);
    if (!publicAsset) {
      const session = await getCurrentSession();
      if (session?.user.role !== "SUPER_ADMIN") return new Response("Not found", { status: 404 });
    }
  }
  if (successMatch) {
    const partner = await prisma.successPartner.findUnique({
      where: { id: successMatch[1] },
      select: { id: true, logoUrl: true, isVisible: true },
    });
    if (!partner || partner.logoUrl !== `/api/media?pathname=${encodeURIComponent(pathname)}`) {
      return new Response("Not found", { status: 404 });
    }
    publicAsset = partner.isVisible;
    if (!publicAsset) {
      const session = await getCurrentSession();
      if (session?.user.role !== "SUPER_ADMIN") {
        return new Response("Not found", { status: 404 });
      }
    }
  }
  if (logoMatch) {
    const partner = await prisma.partner.findUnique({
      where:{id:logoMatch[1]},
      select:{id:true,status:true,logoUrl:true},
    });
    if (!partner || partner.logoUrl !== `/api/media?pathname=${encodeURIComponent(pathname)}`) {
      return new Response("Not found", { status:404 });
    }
    publicAsset = partner.status === "ACTIVE";
    if (!publicAsset) {
      const session = await getCurrentSession();
      if (!session) return new Response("Not found", {status:404});
      const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
      if (!isAdmin) {
        const isMember = await prisma.partnerMember.findFirst({
          where:{userId:session.user.id,partnerId:partner.id,isActive:true},
          select:{id:true},
        });
        if (!isMember) return new Response("Not found", {status:404});
      }
    }
  }

  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Cache-Control": publicAsset ? "public, max-age=3600, s-maxage=86400" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
