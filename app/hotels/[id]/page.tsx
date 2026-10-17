import Link from "next/link";
import {notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import OfferEngagementActions from "@/app/components/OfferEngagementActions";
import OfferImageCarousel from "@/app/components/OfferImageCarousel";
import {buildPageMetadata} from "@/lib/seo-metadata";
export const dynamic="force-dynamic";
async function getOffer(id:string){
 const now=new Date();
 return prisma.hotelOffer.findFirst({where:{id,deletedAt:null,isVisible:true,AND:[{OR:[{startsAt:null},{startsAt:{lte:now}}]},{OR:[{endsAt:null},{endsAt:{gte:now}}]}]},select:{id:true,title:true,description:true,hotelName:true,destination:true,bannerUrl:true,imageUrls:true,amountSar:true,priceUnit:true}});
}
export async function generateMetadata({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const offer=await getOffer(id);
 if(!offer)return {title:"العرض غير متاح",robots:{index:false,follow:false}};
 const images=Array.isArray(offer.imageUrls)?offer.imageUrls.filter((x):x is string=>typeof x==="string"):[];
 const image=images[0]||offer.bannerUrl||"/Image/social/arees-loop-whatsapp-preview.png";
 return buildPageMetadata({title:offer.title,description:offer.description||"تفاصيل عرض الفندق عبر أريس لوب",path:`/hotels/${encodeURIComponent(id)}`,image,imageWidth:1200,imageHeight:1200,imageType:image.includes(".png")?"image/png":image.includes(".jpg")?"image/jpeg":"image/webp",imageAlt:offer.title});
}
export default async function HotelOfferPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const offer=await getOffer(id);if(!offer)notFound();
 const images=Array.isArray(offer.imageUrls)?offer.imageUrls.filter((x):x is string=>typeof x==="string"):[];
 return <main dir="rtl" className="min-h-screen bg-[#F7F4EA] px-4 pb-16 pt-32 text-[#0D3B34]"><div className="mx-auto max-w-5xl"><Link href="/hotels" className="text-sm font-bold">← جميع عروض الفنادق</Link><div className="mt-6 grid gap-6 md:grid-cols-2"><section className="overflow-hidden rounded-3xl bg-white shadow"><div className="aspect-square"><OfferImageCarousel images={images} fallback={offer.bannerUrl} title={offer.title}/></div><OfferEngagementActions id={offer.id} title={offer.title} className="p-4"/></section><section className="rounded-3xl bg-white p-6 shadow"><h1 className="text-2xl font-bold text-[#947426]">{offer.title}</h1>{offer.hotelName&&<p className="mt-3">{offer.hotelName}</p>}{offer.destination&&<p className="mt-2">{offer.destination}</p>}{offer.description&&<p className="mt-6 whitespace-pre-line leading-8">{offer.description}</p>}{offer.amountSar!==null&&<p className="mt-6 text-xl font-bold">{Number(offer.amountSar).toLocaleString("ar-SA")} ر.س {offer.priceUnit||""}</p>}<Link href="/hotels" className="mt-6 inline-block rounded-xl bg-[#0D3B34] px-6 py-3 font-bold text-white">اطلب الحجز</Link></section></div></div></main>;
}
