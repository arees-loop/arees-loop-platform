import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import { canManageTransport } from "@/lib/transport-permissions";
import { canManageHotel } from "@/lib/hotel-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// These are actionable request counts, NOT unqualified "unread" claims.
// An action stays in attention until a subsequent administration event,
// payment verification, or a change of request status resolves it.
const MAX_ROWS = 1500;
const transportKinds = [
  {kind:"FLIGHT",key:"flights"},
  {kind:"FERRY",key:"ferries"},
  {kind:"VISA",key:"visas"},
  {kind:"DRIVING_LICENSE",key:"drivingLicenses"},
] as const;
type Key = (typeof transportKinds)[number]["key"] | "hotels";
const customerActions = new Set([
  "CUSTOMER_OFFER_ACCEPTED",
  "CUSTOMER_TRANSFER_SUBMITTED",
  "CUSTOMER_ATTACHMENT_UPLOADED",
  "CUSTOMER_MESSAGE_SENT",
]);
const processingStatuses = new Set(["PROCESSING","QUOTE_READY","QUOTE_SENT","PAID","EXECUTING","CONTACTED","QUOTED","UNDER_REVIEW"]);
const closedStatuses = ["DONE","CANCELED","CANCELLED","COMPLETED","CLOSED","REJECTED"];

function counts() {
  return {flights:0,ferries:0,hotels:0,visas:0,drivingLicenses:0};
}
const responseHeaders = {"Cache-Control":"private, no-store"};

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({success:false,message:"يلزم تسجيل الدخول."},{status:401,headers:responseHeaders});
  const user = session.user;
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")
    return NextResponse.json({success:false,message:"غير مصرح."},{status:403,headers:responseHeaders});
  const isSuper = user.role === "SUPER_ADMIN";
  const permitted = transportKinds.filter(item=>isSuper || canManageTransport(user,item.kind));
  const hotelPermitted = isSuper || canManageHotel(user);
  const assignedFilter = isSuper ? {} : {assignedToId:user.id};
  const newCounts = counts();
  const inProgress = counts();
  const needsAttention = counts();
  const failedEmails = counts();
  const visible = Object.fromEntries((Object.keys(newCounts) as Key[]).map(key=>[
    key,key==="hotels"?hotelPermitted:permitted.some(p=>p.key===key)
  ]));
  const recent:{reference:string;kind:string;action:string;createdAt:string;href:string}[] = [];

  try {
    const [transport, hotels] = await Promise.all([
      permitted.length ? prisma.transportRequest.findMany({
        where:{
          kind:{in:permitted.map(p=>p.kind)},
          status:{notIn:closedStatuses},
          ...assignedFilter,
        },
        select:{
          reference:true,kind:true,status:true,notificationStatus:true,
          events:{orderBy:[{createdAt:"desc"},{id:"desc"}],take:1,select:{action:true,createdAt:true}},
        },
        orderBy:{updatedAt:"desc"},
        take:MAX_ROWS,
      }) : Promise.resolve([]),
      hotelPermitted ? prisma.hotelInquiry.findMany({
        where:{status:{notIn:closedStatuses},...assignedFilter},
        select:{
          reference:true,status:true,notificationStatus:true,
          events:{orderBy:[{createdAt:"desc"},{id:"desc"}],take:1,select:{action:true,createdAt:true}},
        },
        orderBy:{updatedAt:"desc"},
        take:MAX_ROWS,
      }) : Promise.resolve([]),
    ]);
    for (const request of transport) {
      const key = transportKinds.find(item=>item.kind===request.kind)?.key;
      if (!key) continue;
      if (request.status==="NEW") newCounts[key]++;
      if (processingStatuses.has(request.status)) inProgress[key]++;
      if (request.notificationStatus==="FAILED") failedEmails[key]++;
      const last = request.events[0];
      if (last && customerActions.has(last.action)){
        needsAttention[key]++;
        recent.push({reference:request.reference,kind:request.kind,action:last.action,createdAt:last.createdAt.toISOString(),
          href:key==="flights"?"/admin/transport/flights?view=requests":
          key==="ferries"?"/admin/transport/ferries?view=requests":
          key==="visas"?"/admin/transport/visas?view=requests":
          "/admin/transport/driving-licenses?view=requests"});
      }
    }
    for (const request of hotels) {
      if (request.status==="NEW") newCounts.hotels++;
      if (processingStatuses.has(request.status)) inProgress.hotels++;
      if (request.notificationStatus==="FAILED") failedEmails.hotels++;
      const last = request.events[0];
      if (last && customerActions.has(last.action)){
        needsAttention.hotels++;
        recent.push({reference:request.reference,kind:"HOTEL",action:last.action,createdAt:last.createdAt.toISOString(),href:"/admin/hotels?view=requests"});
      }
    }
    recent.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const sum = (values:Record<Key,number>) => Object.values(values).reduce((a,b)=>a+b,0);
    return NextResponse.json({
      success:true,
      counts:Object.fromEntries((Object.keys(newCounts) as Key[]).map(key=>[key,visible[key]?newCounts[key]:null])),
      inProgress:Object.fromEntries((Object.keys(inProgress) as Key[]).map(key=>[key,visible[key]?inProgress[key]:null])),
      needsAttention:Object.fromEntries((Object.keys(needsAttention) as Key[]).map(key=>[key,visible[key]?needsAttention[key]:null])),
      failedEmails:Object.fromEntries((Object.keys(failedEmails) as Key[]).map(key=>[key,visible[key]?failedEmails[key]:null])),
      totals:{new:sum(newCounts),inProgress:sum(inProgress),attention:sum(needsAttention),failedEmails:sum(failedEmails)},
      recent:recent.slice(0,12),
      truncated:transport.length===MAX_ROWS||hotels.length===MAX_ROWS,
      updatedAt:new Date().toISOString(),
    },{headers:responseHeaders});
  } catch(error){
    console.error("Admin request alert counts failed",error);
    return NextResponse.json({success:false,message:"تعذر تحديث تنبيهات الإدارة. حاول لاحقاً."},{status:503,headers:responseHeaders});
  }
}
