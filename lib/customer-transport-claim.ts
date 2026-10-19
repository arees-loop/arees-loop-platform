import {createHash} from "node:crypto";
import type {NextRequest} from "next/server";

/**
 * A tracking claim is a 256-bit bearer secret created with the request.
 * A visible reference without the exact secret never authorizes access.
 * Keep the secret in a request header, not a query string or server log.
 */
export function customerTransportOwnership(req:NextRequest, userId:string) {
  const token=req.headers.get("x-arees-request-token")||"";
  const claims:{userId?:string;trackingTokenHash?:string}[]=[{userId}];
  if(/^[A-Za-z0-9_-]{43}$/.test(token)){
    claims.push({trackingTokenHash:createHash("sha256").update(token).digest("hex")});
  }
  return {OR:claims};
}
