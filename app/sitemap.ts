import type {MetadataRoute} from "next";
const SITE_URL="https://www.areesloop.com";
export default function sitemap():MetadataRoute.Sitemap{
 if(process.env.VERCEL_ENV!=="production")return [];
 const pages=[
  {path:"/",priority:1,frequency:"weekly" as const},
  {path:"/discover",priority:0.9,frequency:"weekly" as const},
  {path:"/flights",priority:0.8,frequency:"weekly" as const},
  {path:"/ferries",priority:0.8,frequency:"weekly" as const},
  {path:"/hotels",priority:0.8,frequency:"weekly" as const},
  {path:"/visas",priority:0.8,frequency:"monthly" as const},
  {path:"/international-driving-license",priority:0.8,frequency:"monthly" as const}
 ];
 return pages.map(page=>({url:SITE_URL+page.path,changeFrequency:page.frequency,priority:page.priority}));
}
