import {prisma} from "@/lib/prisma";

export type ValidatedServiceImage={url:string;sortOrder:number};
type Result={valid:true;images:ValidatedServiceImage[]}|{valid:false;message:string};

/**
 * Validates image changes, never silently drops invalid entries.
 * Cross-partner private photos must not be attached to a published service.
 * Historical external HTTPS images stay supported for compatibility.
 */
export async function validatePartnerServiceImages(
  input:unknown,
  actorId:string,
  partnerId:string
):Promise<Result>{
 if(!Array.isArray(input))return {valid:false,message:"قائمة الصور غير صالحة."};
 if(input.length>10)return {valid:false,message:"يمكن إضافة 10 صور كحد أقصى لكل خدمة."};
 const urls=new Set<string>();
 const images:ValidatedServiceImage[]=[];
 for(let i=0;i<input.length;i++){
  const item=input[i] as Record<string,unknown>|null;
  if(!item||typeof item!=="object"||Array.isArray(item)||typeof item.url!=="string")
   return {valid:false,message:"بعض الصور غير صالحة."};
  const url=item.url.trim();
  if(url.length<8||url.length>2048||urls.has(url))
   return {valid:false,message:"أحد روابط الصور مكرر أو غير صالح."};
  urls.add(url);
  if(url.startsWith("/api/media?")){
   let path:string|null=null;
   try{
    const parsed=new URL(url,"https://www.areesloop.com");
    if(parsed.pathname!=="/api/media"||parsed.searchParams.size!==1)throw Error("INVALID_MEDIA_LINK");
    path=parsed.searchParams.get("pathname");
   }catch{return {valid:false,message:"رابط صورة الخدمة غير صالح."};}
   const match=/^services\/([a-zA-Z0-9_-]+)\/[^/]{1,230}$/.exec(path||"");
   if(!match)return {valid:false,message:"صيغة مسار صورة الخدمة غير مدعومة."};
   if(match[1]!==actorId){
    const ownerImage=await prisma.serviceImage.findFirst({
     where:{url,service:{partnerId}},select:{id:true}
    });
    if(!ownerImage)return {valid:false,message:"لا يمكن استخدام صورة خاصة بمنشأة أخرى."};
   }
  }else{
   try{
    const uri=new URL(url);
    if(uri.protocol!=="https:"||uri.username||uri.password)throw Error("INSECURE_URL");
   }catch{return {valid:false,message:"رابط الصورة الخارجية يجب أن يكون HTTPS صالحاً."};}
  }
  const desiredOrder=Number(item.sortOrder);
  images.push({url,sortOrder:Number.isFinite(desiredOrder)&&Math.abs(desiredOrder)<100000?Math.trunc(desiredOrder):i});
 }
 return {valid:true,images};
}
