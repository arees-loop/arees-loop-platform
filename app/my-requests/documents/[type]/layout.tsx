import type {Metadata} from "next";
export async function generateMetadata({params}:{params:Promise<{type:string}>}):Promise<Metadata>{
 const {type}=await params;
 return {title:type==="quote"?"عرض سعر العميل":type==="confirmed"?"تفاصيل الحجز المؤكد":"مستند الطلب",robots:{index:false,follow:false}};
}
export default function Layout({children}:{children:React.ReactNode}){return children;}
