export function matchesLicenseDocument(bytes:Uint8Array,mime:string):boolean {
 const prefix=(expected:number[])=>expected.every((v,i)=>bytes[i]===v);
 if(mime==="application/pdf")return prefix([0x25,0x50,0x44,0x46,0x2d]);
 if(mime==="image/png")return prefix([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
 if(mime==="image/jpeg")return prefix([0xff,0xd8,0xff]);
 if(mime==="image/webp")return prefix([0x52,0x49,0x46,0x46])&&[0x57,0x45,0x42,0x50].every((v,i)=>bytes[i+8]===v);
 return false;
}
