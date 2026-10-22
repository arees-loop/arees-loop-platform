"use client";
import type {ReactNode} from "react";

export type StatusTone="new"|"working"|"attention"|"done"|"neutral";
const newStatuses=new Set(["NEW","PENDING","CART_BANK_CREATED","QUOTE_READY"]);
const attentionStatuses=new Set(["CART_BANK_REJECTED","REJECTED","CANCELED","CANCELLED","CLOSED","DOCUMENTS_REQUESTED","CUSTOMER_ACTION_REQUIRED","REFUNDED","FAILED"]);
const doneStatuses=new Set(["COMPLETED","DONE","CONFIRMED","ACTIVE","CART_COMPLETED"]);
const workingStatuses=new Set(["PROCESSING","IN_PROGRESS","EXECUTING","PAID","CART_BANK_VERIFIED","CART_BANK_RECEIPT_SUBMITTED","QUOTE_SENT","CONTACTED","QUOTED","UNDER_REVIEW","DOCUMENTS_SUBMITTED","AWAITING_CONFIRMATION"]);
export function orderStatusTone(status:string):StatusTone {
 const key=status.toUpperCase();
 if(attentionStatuses.has(key))return "attention";
 if(doneStatuses.has(key))return "done";
 if(newStatuses.has(key))return "new";
 if(workingStatuses.has(key))return "working";
 return "neutral";
}
const classes:Record<StatusTone,string>={
 new:"border-[#D1A225] bg-[#FFF2BE] text-[#73520B]",
 working:"border-[#E8A14C] bg-[#FFF0D8] text-[#9A4D06]",
 attention:"border-[#D84B4B] bg-[#FFE8E8] text-[#A51E24]",
 done:"border-[#0F7045] bg-[#E0F3E8] text-[#10563B]",
 neutral:"border-[#B9C7C0] bg-[#F3F5F2] text-[#35534A]"
};
export function orderStatusClass(status:string){return classes[orderStatusTone(status)];}
export default function OrderStatusBadge({status,children,attention=false}:{status:string;children?:ReactNode;attention?:boolean}){
 return <span className={"inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black "+classes[attention?"attention":orderStatusTone(status)]}>
 {attention&&<span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-[#C12230]"/>}{children||status}</span>;
}
export function RequiredActionButton({onClick,children,disabled=false}:{onClick:()=>void;children?:ReactNode;disabled?:boolean}){
 return <button type="button" onClick={onClick} disabled={disabled} className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#AD1C2A] bg-gradient-to-b from-[#FFF0F1] to-[#FFC9CD] px-4 py-3 text-sm font-black text-[#921323] shadow-[0_4px_0_#AB2935,0_7px_12px_rgba(130,22,38,0.18)] transition-all hover:brightness-[0.97] active:translate-y-[3px] active:shadow-[0_1px_0_#AB2935] disabled:opacity-50">
 <span aria-hidden="true">📎</span>{children||"مستندات إضافية مطلوبة — اضغط هنا"}<span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">←</span></button>;
}
