import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getCurrentSession} from "@/lib/session";
import PrintCartDocument from "../print-button";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"مستندات طلب السلة | أريس لوب",robots:{index:false,follow:false}};
type Props={params:Promise<{type:string}>;searchParams:Promise<{reference?:string}>};
type OrderItem={title?:string;quantity?:number;unitPriceSar?:number};
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
 const heading=type==="quote"?"عرض سعر / Quotation":"فاتورة / Invoice";
 const issueDate=type==="invoice"?(events.find(e=>e.action==="CART_BANK_VERIFIED")?.createdAt||order.createdAt):order.createdAt;
 return <main dir="rtl" className="min-h-screen bg-[#F6F5F1] px-4 py-8 text-[#123D35] print:bg-white print:p-0">
  <div className="mx-auto mb-4 flex max-w-[210mm] justify-end print:hidden"><PrintCartDocument/></div>
  <article className="mx-auto min-h-[275mm] max-w-[210mm] bg-white px-8 py-9 shadow-xl print:min-h-0 print:shadow-none md:px-12">
   <header className="flex items-start justify-between gap-4 border-b-2 border-[#B99444] pb-5">
    <div><h1 className="text-xl font-black">شركة أريس الحلول المتكاملة المحدودة</h1><p className="mt-1 text-xs">منصة Arees Loop — تجربة الزائر الذكية</p><p className="mt-1 text-[10px]">ترخيص وزارة السياحة رقم 73104550 — فئة وكالة سفر وسياحة</p></div>
    <img src="/Logo/arees-company-logo.png" alt="شعار شركة أريس" className="h-16 w-16 object-contain"/>
   </header>
   <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
    <div><h2 className="text-xl font-black text-[#8B6A21]">{heading}</h2><p className="mt-2 text-xs">{type==="quote"?"مستند تقديري، وليس إثبات سداد أو فاتورة ضريبية.":"فاتورة بعد اعتماد وصول التحويل البنكي من الإدارة. ليست فاتورة ضريبية."}</p></div>
    <div className="text-xs leading-7"><p><b>مرجع الطلب:</b> <span dir="ltr">{reference}</span></p><p><b>تاريخ المستند:</b> {new Intl.DateTimeFormat("ar-SA",{dateStyle:"medium",timeZone:"Asia/Riyadh"}).format(issueDate)}</p></div>
   </div>
   <section className="mt-6 rounded-xl border border-[#E0D3B7] p-4 text-sm leading-8"><h3 className="font-black">بيانات العميل</h3><p>{[customer?.firstName,customer?.lastName].filter(Boolean).join(" ")||"عميل أريس لوب"}</p><p dir="ltr" className="text-right text-xs">{customer?.email||""}</p></section>
   <table className="mt-6 w-full border-collapse text-right text-xs">
    <thead><tr className="bg-[#F7F1DF]"><th className="border border-[#E4D6B7] p-3">الخدمة</th><th className="border border-[#E4D6B7] p-3">العدد</th><th className="border border-[#E4D6B7] p-3">سعر الوحدة</th><th className="border border-[#E4D6B7] p-3">الإجمالي</th></tr></thead>
    <tbody>{items.map((item,i)=><tr key={i}><td className="border border-[#E4D6B7] p-3">{item.title||"خدمة"}</td><td className="border border-[#E4D6B7] p-3">{item.quantity||1}</td><td className="border border-[#E4D6B7] p-3" dir="ltr">{money(item.unitPriceSar)}</td><td className="border border-[#E4D6B7] p-3" dir="ltr">{money((item.quantity||1)*(item.unitPriceSar||0))}</td></tr>)}</tbody>
   </table>
   <div className="mr-auto mt-5 max-w-xs space-y-2 rounded-xl bg-[#FBF9F3] p-4 text-sm"><p className="flex justify-between gap-6"><span>الإجمالي قبل الخصم</span><b>{money(data.total)}</b></p><p className="flex justify-between gap-6"><span>الخصم</span><b>{money(data.discount)}</b></p><p className="flex justify-between gap-6 border-t border-[#D9C38D] pt-3 text-base font-black"><span>المبلغ المستحق</span><b>{money(data.amountSar)}</b></p></div>
   <p className="mt-7 rounded-lg border border-[#E8DAC1] bg-[#FFFBF2] p-4 text-xs leading-7">{type==="quote"?"يرجى استخدام مرجع الطلب عند التحويل البنكي. العرض يخضع لتأكيد متطلبات الخدمة وتوفرها. لا يعتبر المبلغ مدفوعاً إلا بعد مراجعة التحويل.":"تم اعتماد إيصال التحويل البنكي لدى الإدارة. يبدأ تنفيذ الخدمة حسب متطلباتها، ويتم توفير ملف الخدمة أو الفاوتشر عند صدوره. تفاصيل الضريبة والفاتورة الضريبية الرسمية تصدر منفصلة عند انطباق متطلباتها."}</p>
   <footer className="mt-10 border-t border-[#E3D2AC] pt-4 text-center text-[10px]">Arees Loop · www.areesloop.com</footer>
  </article>
 </main>;
}
