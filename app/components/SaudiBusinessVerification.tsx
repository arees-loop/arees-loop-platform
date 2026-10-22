"use client";

import Script from "next/script";
import {useEffect,useState} from "react";

/**
 * The official Saudi Business verification widget is floating. Do not mount
 * its third-party script on small screens where it could obstruct Account.
 * Mobile visitors instead get a regular official inquiry link below content.
 */
export default function SaudiBusinessVerification(){
  const [desktop,setDesktop]=useState(false);
  useEffect(()=>{
    const mq=window.matchMedia("(min-width: 768px)");
    const update=()=>setDesktop(mq.matches);
    update();
    mq.addEventListener("change",update);
    return()=>mq.removeEventListener("change",update);
  },[]);

  return <>
    <div dir="rtl" className="border-t border-[#D4AF37]/20 bg-[#F7F4ED] px-4 py-2 text-center md:hidden">
      <a href="https://eauthenticate.saudibusiness.gov.sa/inquiry"
         target="_blank" rel="noopener noreferrer"
         className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D4AF37]/35 bg-white/80 px-3 py-2 text-[11px] font-bold text-[#0D3B34] underline-offset-4 hover:underline">
        <span aria-hidden="true">✓</span>
        التحقق من التوثيق — المركز السعودي للأعمال
      </a>
    </div>
    {desktop&&<div className="hidden md:block" aria-label="ختم التوثيق الرسمي للمركز السعودي للأعمال">
      <div className="sbc-verify-seal" data-token="bHNZMFR6VHFRQ095M3RmMzcwbU02QT09" data-position="bottom-left"/>
      <Script src="https://eauthenticate.saudibusiness.gov.sa/EAuthSealApi/seal.js" strategy="afterInteractive"/>
    </div>}
  </>;
}
