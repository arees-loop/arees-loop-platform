"use client";

import { useEffect, useMemo, useState } from "react";

type AirportRow=[string,string,string,string];
type AirlineRow=[string,string];
let airportsPromise:Promise<AirportRow[]>|null=null;
let airlinesPromise:Promise<AirlineRow[]>|null=null;
const popular=["JED","PZU","KRT","MED","RUH","DXB","CAI","DOH","IST","LHR"];
function loadAirports(){
  if(!airportsPromise) airportsPromise=fetch("/data/airports-iata.json").then(r=>{
    if(!r.ok)throw new Error("Airport index not available");
    return r.json() as Promise<AirportRow[]>;
  }).catch(e=>{airportsPromise=null;throw e;});
  return airportsPromise;
}
function loadAirlines(){
  if(!airlinesPromise) airlinesPromise=fetch("/data/airlines-iata.json").then(r=>{
    if(!r.ok)throw new Error("Airline index not available");
    return r.json() as Promise<AirlineRow[]>;
  }).catch(e=>{airlinesPromise=null;throw e;});
  return airlinesPromise;
}
function norm(s:string){return s.normalize("NFKD").toLocaleLowerCase().trim();}
const commonInput="w-full rounded-xl border border-[#D4AF37]/35 bg-[#FFFEFA] px-4 py-3 text-sm text-[#0D3B34] outline-[#B69034]";

export function AirportLookup({value,onChange,placeholder,required=false,ariaLabel}:{value:string;onChange:(next:string)=>void;placeholder?:string;required?:boolean;ariaLabel:string}) {
  const [rows,setRows]=useState<AirportRow[]>([]);
  const [active,setActive]=useState(false);
  const [error,setError]=useState(false);
  useEffect(()=>{let ok=true;loadAirports().then(v=>{if(ok)setRows(v)}).catch(()=>{if(ok)setError(true)});return()=>{ok=false};},[]);
  const results=useMemo(()=>{
    const query=norm(value);
    if(!query)return rows.filter(r=>popular.includes(r[0])).sort((a,b)=>popular.indexOf(a[0])-popular.indexOf(b[0])).slice(0,10);
    const parts=query.replace(/[()]/g," ").split(/\s+/).filter(Boolean);
    return rows.filter(r=>{
      const text=norm([r[0],r[1],r[2],r[3]].join(" "));
      return parts.every(p=>text.includes(p));
    }).sort((a,b)=>{
      const score=(r:AirportRow)=>norm(r[0])===query?-100:norm(r[2]).startsWith(query)?-20:norm(r[1]).startsWith(query)?-10:0;
      return score(a)-score(b);
    }).slice(0,12);
  },[rows,value]);
  return <div className="relative">
    <input type="text" role="combobox" aria-label={ariaLabel} aria-autocomplete="list" aria-expanded={active&&results.length>0}
      required={required} maxLength={100} autoComplete="off" className={commonInput}
      placeholder={placeholder||"ابحث بالمدينة أو المطار أو رمز IATA: JED"} value={value}
      onChange={e=>{onChange(e.target.value);setActive(true)}} onFocus={()=>setActive(true)}
      onBlur={()=>setTimeout(()=>setActive(false),140)}
      onKeyDown={e=>{if(e.key==="Escape")setActive(false);if(e.key==="Enter"&&active&&results.length){e.preventDefault();const r=results[0];onChange(`${r[2]||r[1]} (${r[0]})`);setActive(false)}}}/>
    {active&&results.length>0&&<ul role="listbox" aria-label="المطارات ورموز IATA" className="absolute left-0 right-0 top-full z-[65] mt-2 max-h-[270px] overflow-y-auto rounded-2xl border border-[#D4AF37]/40 bg-white p-1.5 shadow-2xl">
      {results.map((r,i)=><li key={r[0]+"-"+i} role="option" aria-selected={value.includes("("+r[0]+")")}>
        <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange(`${r[2]||r[1]} (${r[0]})`);setActive(false)}} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-right text-sm transition hover:bg-[#F6EFDE]">
          <span className="min-w-0 truncate">{r[2]||r[1]} · {r[1]} <span className="text-xs text-[#0D3B34]/50">{r[3]}</span></span>
          <span className="shrink-0 rounded-lg bg-[#0D3B34] px-2 py-1 font-bold text-white" dir="ltr">{r[0]}</span>
        </button>
      </li>)}
    </ul>}
    {error&&<p className="mt-1 text-xs text-amber-700">تعذر تحميل قائمة المطارات؛ يمكنك كتابة الوجهة ورمزها يدوياً.</p>}
  </div>;
}

export function AirlineLookup({value,onChange,placeholder,ariaLabel}:{value:string;onChange:(next:string)=>void;placeholder?:string;ariaLabel:string}) {
  const [rows,setRows]=useState<AirlineRow[]>([]);
  const [active,setActive]=useState(false);
  const [error,setError]=useState(false);
  useEffect(()=>{let ok=true;loadAirlines().then(v=>{if(ok)setRows(v)}).catch(()=>{if(ok)setError(true)});return()=>{ok=false};},[]);
  const matches=useMemo(()=>{
    const q=norm(value);
    const preferred=["3T","J4","SD","SV","XY","F3","EK","QR","MS","ET","TK"];
    if(!q)return rows.filter(r=>preferred.includes(r[0])).sort((a,b)=>preferred.indexOf(a[0])-preferred.indexOf(b[0])).slice(0,11);
    return rows.filter(([code,name])=>norm(code).includes(q)||norm(name).includes(q))
      .sort((a,b)=>a[0].toLowerCase()===q?-1:b[0].toLowerCase()===q?1:0).slice(0,15);
  },[rows,value]);
  return <div className="relative">
    <input type="text" role="combobox" aria-label={ariaLabel} aria-autocomplete="list" aria-expanded={active&&matches.length>0}
      maxLength={100} autoComplete="off" value={value} className={commonInput}
      placeholder={placeholder||"ابحث باسم شركة الطيران أو رمز IATA"}
      onChange={e=>{onChange(e.target.value);setActive(true)}} onFocus={()=>setActive(true)}
      onBlur={()=>setTimeout(()=>setActive(false),140)}
      onKeyDown={e=>{if(e.key==="Escape")setActive(false);if(e.key==="Enter"&&active&&matches.length){e.preventDefault();onChange(`${matches[0][1]} (${matches[0][0]})`);setActive(false)}}}
    />
    {active&&matches.length>0&&<ul role="listbox" aria-label="شركات الطيران" className="absolute left-0 right-0 top-full z-[65] mt-2 max-h-[285px] overflow-y-auto rounded-2xl border border-[#D4AF37]/40 bg-white p-1.5 shadow-2xl">
      {matches.map(([code,name])=><li key={code} role="option" aria-selected={value.endsWith("("+code+")")}>
        <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange(`${name} (${code})`);setActive(false)}} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-right text-sm hover:bg-[#F6EFDE]">
          <span className="truncate">{name}</span><span dir="ltr" className="rounded-lg bg-[#0D3B34] px-2 py-1 font-bold text-white">{code}</span>
        </button>
      </li>)}
    </ul>}
    <p className="mt-1 text-[11px] leading-5 text-[#0D3B34]/55">القائمة للبحث السريع؛ يجوز كتابة أي شركة طيران غير مدرجة بالاسم.</p>
    {error&&<p className="mt-1 text-xs text-amber-700">تعذر تحميل شركات الطيران؛ اكتب اسم الناقل يدوياً.</p>}
  </div>;
}
