import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime="nodejs";
export async function GET(){
  try{
    const now=new Date();
    const data=await prisma.hotelOffer.findMany({
      where:{deletedAt:null,isVisible:true,AND:[
        {OR:[{startsAt:null},{startsAt:{lte:now}}]},
        {OR:[{endsAt:null},{endsAt:{gte:now}}]},
      ]},
      orderBy:[{sortOrder:"asc"},{createdAt:"desc"}],take:30,
      select:{id:true,title:true,destination:true,hotelName:true,description:true,amountSar:true,priceUnit:true,bannerUrl:true,imageUrls:true,startsAt:true,endsAt:true},
    });
    return NextResponse.json({success:true,data:data.map(x=>({...x,imageUrls:Array.isArray(x.imageUrls)?x.imageUrls:(x.bannerUrl?[x.bannerUrl]:[]),amountSar:x.amountSar===null?null:Number(x.amountSar)}))},
      {headers:{"Cache-Control":"public, max-age=0, s-maxage=30"}});
  }catch(error){console.error("GET hotel offers failed",error);
    return NextResponse.json({success:false,message:"تعذر تحميل عروض الفنادق."},{status:503,headers:{"Cache-Control":"no-store"}});
  }
}
