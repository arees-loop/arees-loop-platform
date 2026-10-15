import { NextRequest, NextResponse } from "next/server";

export const runtime="nodejs";
export const dynamic="force-dynamic";

type Result={
  id?:string;
  poi?:{name?:string};
  position?:{lat?:number;lon?:number};
  address?:{
    freeformAddress?:string;
    municipality?:string;
    municipalitySubdivision?:string;
    countrySecondarySubdivision?:string;
    countrySubdivision?:string;
    country?:string;
    countryCode?:string;
    countryCodeISO3?:string;
  };
};
export async function GET(request:NextRequest) {
  const query=request.nextUrl.searchParams.get("query")?.trim()??"";
  if(query.length<2||query.length>150)return NextResponse.json({error:"INVALID_QUERY"},{status:400});
  const key=process.env.TOMTOM_API_KEY;
  if(!key)return NextResponse.json({error:"DESTINATION_SEARCH_UNAVAILABLE"},{status:503});

  const endpoint=`https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json`;
  const params=new URLSearchParams({key,limit:"10",typeahead:"true",language:"ar"});
  const search=async()=>fetch(`${endpoint}?${params}`,{headers:{Accept:"application/json"},cache:"no-store",signal:AbortSignal.timeout(8500)});
  try{
    let response=await search();
    if(response.status===400) {
      // Some TomTom endpoints reject Arabic locale settings; retry without locale.
      params.delete("language");
      response=await search();
    }
    if(!response.ok){
      console.error("TomTom geocoding failed",{status:response.status});
      return NextResponse.json({error:response.status===429?"RATE_LIMITED":"DESTINATION_SEARCH_UNAVAILABLE"},{status:response.status===429?429:502});
    }
    const data=await response.json() as {results?:Result[]};
    const suggestions=(data.results??[]).filter(result=>{
      const lat=result.position?.lat,lon=result.position?.lon;
      return typeof lat==="number"&&typeof lon==="number"&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180;
    }).map(result=>{
      const address=result.address;
      const name=result.poi?.name||address?.municipalitySubdivision||address?.municipality||address?.countrySecondarySubdivision||address?.countrySubdivision||address?.freeformAddress||query;
      const city=address?.municipality||address?.countrySecondarySubdivision||address?.countrySubdivision||address?.municipalitySubdivision||"";
      return {name,address:address?.freeformAddress||[name,city].filter(Boolean).join("، "),city,country:address?.country||"",countryCode:address?.countryCode||address?.countryCodeISO3||"",placeId:result.id||null,location:{lat:result.position!.lat!,lng:result.position!.lon!}};
    });
    return NextResponse.json({...(suggestions[0]??{}),suggestions},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){
    console.error("TomTom search connection failed",error instanceof Error?error.name:"UNKNOWN");
    return NextResponse.json({error:"DESTINATION_SEARCH_UNAVAILABLE"},{status:503});
  }
}
