import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import PrintCartDocument from "../print-button";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"مستند السداد | Arees Loop",robots:{index:false,follow:false}};
type Props={params:Promise<{type:string}>;searchParams:Promise<{reference?:string}>};
type OrderItem={title?:string;quantity?:number;unitPriceSar?:number;itemType?:string};
const object=(value:unknown):Record<string,unknown>=>value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
const amount=(value:unknown)=>Number(value||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const label=(ar:string,en:string)=> <><span className="block font-bold">{ar}</span><span dir="ltr" className="block text-[9px] font-medium tracking-[0.02em] text-[#60776F]">{en}</span></>;

export default async function CartOrderDocument({params,searchParams}:Props){
 const {type}=await params,{reference}=await searchParams;
 if(!["quote","invoice"].includes(type)||!reference||!/^CART-[0-9a-f-]{36}$/.test(reference))notFound();
 const session=await getCurrentSession();
 if(!session)notFound();
 const permissions=Array.isArray(session.user.adminPermissions)?session.user.adminPermissions.map(String):[];
 const staff=session.user.role==="SUPER_ADMIN"||(session.user.role==="ADMIN"&&permissions.includes("BOOKINGS"));
 const order=await prisma.auditLog.findFirst({
  where:{entityType:"CART_BANK_CHECKOUT",entityId:reference,action:"CART_BANK_CREATED",...(staff?{}:{userId:session.user.id})},
  select:{userId:true,createdAt:true,afterData:true}
 });
 if(!order)notFound();
 const events=await prisma.auditLog.findMany({where:{entityType:"CART_BANK_CHECKOUT",entityId:reference,
  action:{in:["CART_BANK_VERIFIED","CART_BANK_REJECTED","CART_BANK_RECEIPT_SUBMITTED"]}},
  orderBy:[{createdAt:"desc"},{id:"desc"}],select:{action:true,createdAt:true}});
 const verified=events.some(e=>e.action==="CART_BANK_VERIFIED");
 if(type==="invoice"&&!verified)notFound();
 const info=object(order.afterData);
 const items=Array.isArray(info.rows)?info.rows.map(object) as OrderItem[]:[];
 const priced=items.length>0&&items.every(x=>Number(x.unitPriceSar)>0);
 if(type==="quote"&&priced)notFound(); // Do not issue redundant quotes for fixed-price services.
 const customer=order.userId?await prisma.user.findUnique({where:{id:order.userId},
  select:{firstName:true,lastName:true,email:true,phone:true}}):null;
 const isLicenseOnly=items.length===1&&items[0].itemType==="DRIVING_LICENSE";
 const grand=Number(info.amountSar||0);
 const vat=isLicenseOnly?Math.round(grand*15/115*100)/100:null;
 const net=vat===null?null:Math.round((grand-vat)*100)/100;
 const issuedAt=type==="invoice"?(events.find(x=>x.action==="CART_BANK_VERIFIED")?.createdAt||order.createdAt):order.createdAt;
 const arDate=new Intl.DateTimeFormat("ar-SA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:"Asia/Riyadh"}).format(issuedAt);
 const enDate=new Intl.DateTimeFormat("en-GB",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:"Asia/Riyadh"}).format(issuedAt);
 const customerName=[customer?.firstName,customer?.lastName].filter(Boolean).join(" ")||"عميل أريس لوب";
 const receipt=type==="invoice";
 return <main dir="rtl" className="cart-document-page min-h-screen bg-[#F1F1EC] px-2 py-6 text-[#103D33] sm:px-5">
  <style>{`
   @page { size: A4; margin: 0; }
   @media print {
    html, body { background: white!important; width: 210mm!important; margin: 0!important; padding: 0!important; }
    body:has(.cart-document-page) > :not(.cart-document-page) { display: none!important; }
    body:has(.cart-document-page) .sbc-verify-seal,
    body:has(.cart-document-page) .arees-initial-splash,
    body:has(.cart-document-page) [data-position="bottom-left"] { display: none!important; }
    .cart-document-page { min-height: 0!important; padding: 0!important; margin: 0!important;
      width: 210mm!important; max-width: 210mm!important; background: #fff!important; }
    .cart-document-sheet { width: 210mm!important; min-height: 297mm!important; margin: 0!important;
      box-shadow: none!important; padding: 13mm 13mm 12mm!important; break-after: avoid!important; }
    .cart-document-sheet tr { break-inside: avoid!important; }
    .cart-document-sheet section,.cart-document-sheet header { break-inside: avoid!important; }
    .cart-document-toolbar { display: none!important; }
    * { -webkit-print-color-adjust: exact!important; print-color-adjust: exact!important; }
   }
  `}</style>
  <div className="cart-document-toolbar mx-auto mb-3 flex max-w-[210mm] justify-end"><PrintCartDocument/></div>
  <article className="cart-document-sheet mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white px-[6%] pb-10 pt-8 shadow-xl sm:px-[7%]">
   <div className="h-[5px] w-full rounded-full bg-gradient-to-l from-[#0D3B34] via-[#B99124] to-[#0D3B34]"/>
   <header className="mt-6 border-b-2 border-[#D5BB7A] pb-5">
    <div dir="ltr" className="grid grid-cols-[minmax(0,1fr)_minmax(120px,1.03fr)_minmax(0,1fr)] items-center gap-3 sm:gap-4">
     <section dir="ltr" className="min-w-0 text-left">
      <h1 className="text-[13px] font-black leading-snug tracking-[.025em] sm:text-[14px]">AREES INTEGRATED<br/>SOLUTIONS CO. LTD.</h1>
      <p className="mt-3 text-[9px] leading-[1.85] text-[#335B50]">CR No.: 7037003618<br/>VAT No.: 311897578200003<br/>Tourism License: 73104550<br/>Madinah, Saudi Arabia</p>
     </section>
     <div className="flex min-w-0 flex-col items-center justify-center">
      <img src="/Logo/arees-integrated-solutions-logo.png" alt="شعار شركة أريس الحلول المتكاملة المحدودة" className="h-[132px] w-full max-w-[183px] object-contain"/>
     </div>
     <section dir="rtl" className="min-w-0 text-right">
      <h1 className="text-[14px] font-black leading-[1.65] sm:text-[16px]">شركة أريس الحلول<br/>المتكاملة المحدودة</h1>
      <p className="mt-3 text-[9px] leading-[1.9] text-[#335B50]">السجل التجاري: 7037003618<br/>الرقم الضريبي: 311897578200003<br/>ترخيص وزارة السياحة: 73104550<br/>المدينة المنورة، المملكة العربية السعودية</p>
     </section>
    </div>
   </header>

   <section className="mt-6 flex flex-wrap items-start justify-between gap-4 border-b border-[#E6DDC7] pb-5">
    <div>
     <p className="text-[10px] font-bold tracking-[.22em] text-[#B99124]">AREES LOOP</p>
     <h2 className="mt-1 text-[23px] font-black text-[#0D3B34]">{receipt?"فاتورة سداد":"عرض سعر"}</h2>
     <p dir="ltr" className="text-[12px] font-semibold text-[#8C6A21]">{receipt?"Payment Invoice / Receipt":"Quotation"}</p>
    </div>
    <div className="max-w-full space-y-1.5 text-[10px] leading-5">
     <p><span className="text-[#677C73]">رقم المستند / Reference:</span> <strong dir="ltr" className="inline-block break-all text-[9px]">{reference}</strong></p>
     <p><span className="text-[#677C73]">التاريخ / Date:</span> <strong>{arDate}</strong><span dir="ltr" className="mr-2 inline-block text-[#677C73]">{enDate}</span></p>
    </div>
   </section>

   <section className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-[#E3D3AD] bg-[#FBF9F3] p-4 text-[11px]">
    <div className="min-w-0">
     <b className="text-[#0D3B34]">بيانات العميل</b><p className="mt-1">{customerName}</p><p className="break-all text-[10px]">{customer?.phone||""}</p>
    </div>
    <div dir="ltr" className="min-w-0 text-left">
     <b>Customer Details</b><p className="mt-1">{customerName}</p><p className="break-all text-[10px]">{customer?.email||""}</p>
    </div>
   </section>

   <section className="mt-6">
    <div className="mb-3 flex items-center justify-between"><h3 className="font-black">تفاصيل الخدمات</h3><span dir="ltr" className="text-[11px] font-semibold text-[#99772C]">SERVICES / ITEMS</span></div>
    <table className="w-full table-fixed border-collapse text-right text-[10px]">
     <thead><tr className="bg-[#0D3B34] text-white">
      <th className="w-[46%] border border-[#0D3B34] px-3 py-3">{label("الخدمة","Service")}</th>
      <th className="w-[10%] border border-[#0D3B34] px-2 py-3">{label("العدد","Qty")}</th>
      <th className="w-[22%] border border-[#0D3B34] px-2 py-3">{label("سعر الوحدة","Unit price")}</th>
      <th className="w-[22%] border border-[#0D3B34] px-2 py-3">{label("الإجمالي","Total")}</th>
     </tr></thead>
     <tbody>{items.map((item,i)=><tr key={i} className={i%2?"bg-[#F8F7F2]":"bg-white"}>
      <td className="break-words border border-[#E6DDC8] px-3 py-3 text-[11px] font-semibold">
       {item.title||"خدمة"}
       {item.itemType==="DRIVING_LICENSE"&&<small dir="ltr" className="mt-1 block text-[9px] font-normal text-[#5B766B]">International Driving Permit - 1 Year</small>}
      </td>
      <td className="border border-[#E6DDC8] px-2 py-3 text-center">{Number(item.quantity||1)}</td>
      <td dir="ltr" className="border border-[#E6DDC8] px-2 py-3 text-left">SAR {amount(item.unitPriceSar)}</td>
      <td dir="ltr" className="border border-[#E6DDC8] px-2 py-3 text-left font-bold">SAR {amount(Number(item.quantity||1)*Number(item.unitPriceSar||0))}</td>
     </tr>)}</tbody>
    </table>
   </section>

   <section className="mt-6 mr-auto max-w-[365px] rounded-xl border border-[#DCC894] p-4 text-[11px]">
    <div className="space-y-3">
     <div className="flex items-center justify-between gap-3"><div>{label("الإجمالي قبل الخصم","Subtotal")}</div><strong dir="ltr">SAR {amount(info.total)}</strong></div>
     <div className="flex items-center justify-between gap-3"><div>{label("الخصم","Discount")}</div><strong dir="ltr">SAR {amount(info.discount)}</strong></div>
     {isLicenseOnly&&<>
      <div className="flex items-center justify-between gap-3"><div>{label("المبلغ قبل الضريبة","Amount excluding VAT")}</div><strong dir="ltr">SAR {amount(net)}</strong></div>
      <div className="flex items-center justify-between gap-3"><div>{label("ضريبة القيمة المضافة 15% (مشمولة)","VAT 15% (included)")}</div><strong dir="ltr">SAR {amount(vat)}</strong></div>
     </>}
     <div className="flex items-center justify-between gap-3 border-t-2 border-[#B99124] pt-3 text-[14px] font-black">
      <div>{label("الإجمالي المستحق","Grand total")}</div><strong dir="ltr" className="whitespace-nowrap text-[#0D3B34]">SAR {amount(grand)}</strong>
     </div>
    </div>
   </section>
   <footer className="mt-14 border-t border-[#DCCBA1] pt-4 text-center text-[10px] text-[#5F7067]">
    <span className="font-bold">AREES LOOP</span> <span className="mx-2 text-[#B99124]">✦</span>
    <span dir="ltr">www.areesloop.com</span>
   </footer>
  </article>
 </main>;
}
