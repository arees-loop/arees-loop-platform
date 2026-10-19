import {createHash} from "node:crypto";
import type {NextRequest} from "next/server";

/**
 * Both authenticated owners and holders of the unguessable tracking claim
 * can manage their own requests. A reference by itself grants no access.
 * The claim must stay in a request header (never a query string or URL).
 */
export function customerTransportOwnership(req:NextRequest,userId?:string|null){
 const token=req.headers.get("x-arees-request-token")||"";
 const alternatives:Array<{userId:string}|{trackingTokenHash:string}>=[];
 if(userId)alternatives.push({userId});
 if(/^[A-Za-z0-9_-]{43}$/.test(token))
   alternatives.push({trackingTokenHash:createHash("sha256").update(token).digest("hex")});
 return alternatives.length?{OR:alternatives}:null;
}
