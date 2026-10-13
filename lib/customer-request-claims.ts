"use client";
export const REQUEST_CLAIMS_KEY="arees-loop-private-request-claims-v1";
export type CustomerClaim={reference:string;token:string};
export function readCustomerClaims():CustomerClaim[]{
  try{
    const data:unknown=JSON.parse(localStorage.getItem(REQUEST_CLAIMS_KEY)||"[]");
    if(!Array.isArray(data))return [];
    return data.filter((item):item is CustomerClaim=>
      !!item&&typeof item==="object"&&
      typeof item.reference==="string"&&/^AR-(AIR|SEA|HOT)-[A-F0-9]{10}$/.test(item.reference)&&
      typeof item.token==="string"&&/^[A-Za-z0-9_-]{43}$/.test(item.token)).slice(-40);
  }catch{return [];}
}
export function storeCustomerClaim(claim:CustomerClaim):boolean{
  try{
    const existing=readCustomerClaims().filter(x=>x.reference!==claim.reference);
    localStorage.setItem(REQUEST_CLAIMS_KEY,JSON.stringify([...existing,claim].slice(-40)));
    return true;
  }catch{return false;}
}
