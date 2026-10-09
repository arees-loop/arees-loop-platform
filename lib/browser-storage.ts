"use client";
import {useSyncExternalStore} from "react";
export function subscribeBrowserStorage(callback:()=>void){
 window.addEventListener("storage",callback);
 window.addEventListener("arees-cart-updated",callback);
 window.addEventListener("arees-loop-progress-updated",callback);
 return ()=>{window.removeEventListener("storage",callback);window.removeEventListener("arees-cart-updated",callback);window.removeEventListener("arees-loop-progress-updated",callback)};
}
export function useBrowserStorage(key:string){
 return useSyncExternalStore(subscribeBrowserStorage,()=>{try{return localStorage.getItem(key)}catch{return null}},()=>null);
}
