import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime="nodejs";

export async function GET(request: NextRequest) {
  const kind=request.nextUrl.searchParams.get("kind");
  if(kind!=="FLIGHT"&&kind!=="FERRY") return NextResponse.json({success:false,message:"نوع الخدمة غير صالح."},{status:400});
  try {
    const offers=await prisma.transportOffer.findMany({
      where:{kind,isVisible:true,deletedAt:null,
        AND:[
          {OR:[{startsAt:null},{startsAt:{lte:new Date()}}]},
          {OR:[{endsAt:null},{endsAt:{gte:new Date()}}]},
        ],
      },
      select:{id:true,title:true,description:true,carrierName:true,origin:true,destination:true,travelDate:true,scheduleType:true,scheduleData:true,amountSar:true,adultPriceSar:true,childPriceSar:true,infantPriceSar:true,priceUnit:true,bannerUrl:true,operationStatus:true,operationNote:true},
      orderBy:[{sortOrder:"asc"},{createdAt:"desc"}],take:30,
    });
    return NextResponse.json({success:true,data:offers.map(x=>({...x,amountSar:x.amountSar===null?null:Number(x.amountSar),adultPriceSar:x.adultPriceSar===null?null:Number(x.adultPriceSar),childPriceSar:x.childPriceSar===null?null:Number(x.childPriceSar),infantPriceSar:x.infantPriceSar===null?null:Number(x.infantPriceSar)}))},
      {headers:{"Cache-Control":"public, max-age=0, s-maxage=30"}});
  } catch(error) {
    console.error("GET transport offers failed",error);
    return NextResponse.json({success:false,message:"العروض غير متاحة حالياً."},{status:503,headers:{"Cache-Control":"no-store"}});
  }
}
