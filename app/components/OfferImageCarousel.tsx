"use client";

import { useEffect, useState } from "react";

type Props = {
  images?: string[] | null;
  fallback?: string | null;
  title: string;
  className?: string;
  imageClassName?: string;
};

export default function OfferImageCarousel({images,fallback,title,className="",imageClassName=""}:Props) {
  const gallery=[...new Set([...(Array.isArray(images)?images:[]),fallback||""].filter(Boolean))];
  const [index,setIndex]=useState(0);
  const [paused,setPaused]=useState(false);

  useEffect(()=>{setIndex(0);},[gallery.join("|")]);
  useEffect(()=>{
    if(gallery.length<2||paused||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const timer=window.setInterval(()=>setIndex(i=>(i+1)%gallery.length),3000);
    return()=>window.clearInterval(timer);
  },[gallery.length,paused]);

  return <div className={`relative h-full w-full overflow-hidden ${className}`}
    onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}
    onFocusCapture={()=>setPaused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setPaused(false);}}>
    {gallery.length>0?<>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={gallery[index]} src={gallery[index]} alt={title+ (gallery.length>1?` — صورة ${index+1} من ${gallery.length}`:"")}
        className={`h-full w-full object-cover transition-opacity duration-500 ${imageClassName}`}/>
      {gallery.length>1&&<>
        <button type="button" aria-label="الصورة السابقة" onClick={()=>setIndex(i=>(i-1+gallery.length)%gallery.length)}
          className="absolute right-3 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#0D3B34]/95 text-2xl font-black text-white shadow-[0_4px_18px_rgba(0,0,0,.45)] backdrop-blur hover:scale-105 hover:bg-[#0D3B34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8CC85]">→</button>
        <button type="button" aria-label="الصورة التالية" onClick={()=>setIndex(i=>(i+1)%gallery.length)}
          className="absolute left-3 top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#0D3B34]/95 text-2xl font-black text-white shadow-[0_4px_18px_rgba(0,0,0,.45)] backdrop-blur hover:scale-105 hover:bg-[#0D3B34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8CC85]">←</button>
        <span aria-live="polite" className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white">{index+1} / {gallery.length}</span>
      </>}
    </>:null}
  </div>;
}
