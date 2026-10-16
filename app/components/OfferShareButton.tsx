"use client";
import {useState} from "react";
export default function OfferShareButton({title,className=""}:{title:string;className?:string}){
 const [message,setMessage]=useState("");
 async function share(){
  const url=window.location.href;
  try{
   if(navigator.share){await navigator.share({title,url});return}
   await navigator.clipboard.writeText(url);
   setMessage("تم نسخ رابط العرض");
  }catch(e){if((e as Error).name!=="AbortError")setMessage("تعذر نسخ الرابط، يمكنك نسخه من شريط العنوان")}
 }
 return <div className={className}><button type="button" onClick={()=>void share()} className="rounded-xl border border-[#B99124]/40 bg-white px-4 py-2 text-sm font-bold text-[#0D3B34]">↗ مشاركة العرض</button>{message&&<span role="status" className="ms-2 text-xs text-[#0D3B34]">{message}</span>}</div>;
}
