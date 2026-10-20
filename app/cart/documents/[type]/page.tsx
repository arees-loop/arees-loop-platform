import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import PrintCartDocument from "../print-button";
import LegalDocumentHeader from "@/app/components/LegalDocumentHeader";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"مستندات طلب السلة | أريس لوب",robots:{index:false,follow:false}};
type Props={params:Promise<{type:string}>;searchParams:Promise<{reference?:string}>};
type OrderItem={title?:string;quantity?:number;unitPriceSar?:number;itemType?:string};
function Dual({ar,en}:{ar:string;en:string}){return <span className="block text-right"><span className="block text-[11px] font-black">{ar}</span><span dir="ltr" className="mt-1 block text-right text-[9px] font-medium opacity-75">{en}</span></span>;}
const parse=(x:unknown):Record<string,unknown>=>x&&typeof x==="object"&&!Array.isArray(x)?x as Record<string,unknown>:{};
const money=(x:unknown)=>Number(x||0).toLocaleString("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2})+" ر.س";
export default async function CartOrderDocument({params,searchParams}:Props){
 const {type}=await params,{reference}=await searchParams;
 if(!["quote","invoice"].includes(type)||!reference||!/^CART-[0-9a-f-]{36}$/.test(reference))notFound();
 const session=await getCurrentSession();
 if(!session)notFound();
 const permission=Array.isArray(session.user.adminPermissions)?session.user.adminPermissions.map(String):[];
 const staff=session.user.role==="SUPER_ADMIN"||(session.user.role==="ADMIN"&&permission.includes("BOOKINGS"));
 const order=await prisma.auditLog.findFirst({
  where:{entityType:"CART_BANK_CHECKOUT",entityId:reference,action:"CART_BANK_CREATED",...(staff?{}:{userId:session.user.id})},
  select:{userId:true,createdAt:true,afterData:true}
 });
 if(!order)notFound();
 const events=await prisma.auditLog.findMany({where:{entityType:"CART_BANK_CHECKOUT",entityId:reference,action:{in:["CART_BANK_VERIFIED","CART_BANK_REJECTED","CART_BANK_RECEIPT_SUBMITTED"]}},orderBy:[{createdAt:"desc"},{id:"desc"}],select:{action:true,createdAt:true}});
 const verified=events.some(e=>e.action==="CART_BANK_VERIFIED");
 if(type==="invoice"&&!verified)notFound();
 const data=parse(order.afterData),items=Array.isArray(data.rows)?data.rows.map(parse) as OrderItem[]:[];
 const customer=order.userId?await prisma.user.findUnique({where:{id:order.userId},select:{firstName:true,lastName:true,email:true,phone:true}}):null;
 const isLicenseOnly=items.length===1&&items[0].itemType==="DRIVING_LICENSE";
 const fixedPrice=items.length>0&&items.every(i=>Number.isFinite(Number(i.unitPriceSar))&&Number(i.unitPriceSar)>0);
 // Publicly priced carts do not need an extra quotation document.
 if(type==="quote"&&fixedPrice)notFound();
 const gross=Number(data.amountSar||0);
 const standardVat=isLicenseOnly; // License price confirmed VAT inclusive; marketplace partner VAT remains unclassified.
 const vat=standardVat?Math.round(gross*15/115*100)/100:null;
 const net=vat===null?null:Math.round((gross-vat)*100)/100;
 const heading=type==="quote"?"عرض سعر":"فاتورة سداد";
 const issueDate=type==="invoice"?(events.find(e=>e.action==="CART_BANK_VERIFIED")?.createdAt||order.createdAt):order.createdAt;
 return <main dir="rtl" className="min-h-screen bg-[#F6F5F1] px-4 py-8 text-[#123D35] print:bg-white print:p-0">
  <style>{`@page{size:A4;margin:12mm} @media print{table{page-break-inside:auto}tr{page-break-inside:avoid}#arees-cart-print-sheet{box-shadow:none!important}}`}</style>
  <div className="mx-auto mb-4 flex max-w-[210mm] justify-end print:hidden"><PrintCartDocument/></div>
  <article id="arees-cart-print-sheet" className="mx-auto min-h-[270mm] w-full max-w-[210mm] bg-white px-8 py-9 shadow-xl print:min-h-0 print:shadow-none md:px-9">
   <LegalDocumentHeader/>
   <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
    <div><h2 className="font-[family-name:var(--font-el-messiri)] text-2xl font-bold text-[#9B7528]">{heading}</h2><p dir="ltr" className="text-right font-[Arial,sans-serif] text-xs font-bold">{type==="quote"?"Quotation / Estimate":"Payment Invoice / Receipt"}</p><p className="mt-1 text-[10px] text-[#63756D]">{type==="quote"?"العرض يخضع للاعتماد النهائي.":"إيصال سداد، وليس فاتورة ضريبية إلكترونية."}</p></div>
    <div className="text-xs leading-7"><p><b>رقم المرجع / Reference:</b> <span dir="ltr">{reference}</span></p><p><b>تاريخ المستند / Date:</b> {new Intl.DateTimeFormat("ar-SA",{dateStyle:"medium",timeZone:"Asia/Riyadh"}).format(issueDate)}</p></div>
   </div>
   <section className="mt-6 rounded-xl border border-[#E0D3B7] p-4 text-sm leading-8"><h3 className="font-black">بيانات العميل / Customer Details</h3><p>{[customer?.firstName,customer?.lastName].filter(Boolean).join(" ")||"عميل أريس لوب"}</p><p dir="ltr" className="text-right text-xs">{customer?.email||""}</p></section>
   <table className="mt-6 w-full border-collapse text-right text-xs">
    <thead><tr className="bg-[#F7F1DF]"><th className="border border-[#E4D6B7] p-3"><Dual ar="الخدمة" en="Service"/></th><th className="border border-[#E4D6B7] p-3"><Dual ar="العدد" en="Qty"/></th><th className="border border-[#E4D6B7] p-3"><Dual ar="سعر الوحدة" en="Unit Price"/></th><th className="border border-[#E4D6B7] p-3"><Dual ar="الإجمالي" en="Total"/></th></tr></thead>
    <tbody>{items.map((item,i)=><tr key={i}><td className="border border-[#E4D6B7] p-3">{item.title||"خدمة"}{item.itemType==="DRIVING_LICENSE"&&<p dir="ltr" className="mt-1 text-[10px]">International Driving Permit — 1 Year</p>}</td><td className="border border-[#E4D6B7] p-3">{item.quantity||1}</td><td className="border border-[#E4D6B7] p-3" dir="ltr">{money(item.unitPriceSar)}</td><td className="border border-[#E4D6B7] p-3" dir="ltr">{money((item.quantity||1)*(item.unitPriceSar||0))}</td></tr>)}</tbody>
   </table>
   <section className="mr-auto mt-5 max-w-sm space-y-3 rounded-xl border border-[#D4AF37]/40 bg-[#FBF9F3] p-4 text-sm">
    <div className="flex justify-between gap-6"><Dual ar="إجمالي قبل الخصم" en="Subtotal"/><b>{money(data.total)}</b></div>
    <div className="flex justify-between gap-6"><Dual ar="الخصم" en="Discount"/><b>{money(data.discount)}</b></div>
    {standardVat&&<><div className="flex justify-between gap-6"><Dual ar="السعر قبل ضريبة القيمة المضافة" en="Amount Excluding VAT"/><b>{money(net)}</b></div>
    <div className="flex justify-between gap-6"><Dual ar="ضريبة القيمة المضافة 15% (مشمولة)" en="VAT 15% (Included)"/><b>{money(vat)}</b></div></>}
    <div className="flex justify-between gap-6 border-t border-[#D9C38D] pt-3 text-base font-black"><Dual ar="الإجمالي شامل الضريبة عند انطباقها" en="Total Amount (VAT Inclusive Where Applicable)"/><b>{money(data.amountSar)}</b></div>
   </section>

   <footer className="mt-8 border-t border-[#E3D2AC] pt-3 text-center font-[Arial,sans-serif] text-[10px] text-[#59756B]">www.areesloop.com</footer>
  </article>
 </main>;
}
