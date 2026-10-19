import {ImageResponse} from "next/og";
export const runtime="edge";
export async function GET(request:Request){
 const url=new URL(request.url);
 const title=(url.searchParams.get("title")||"الفعاليات والبرامج السياحية").replace(/[<>\r\n]/g,"").trim().slice(0,72);
 return new ImageResponse(
  <div style={{width:"100%",height:"100%",display:"flex",direction:"rtl",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#082E2A,#0D3B34,#1F5144)",color:"#FFFDF4",position:"relative",fontFamily:"sans-serif",overflow:"hidden"}}>
   <div style={{position:"absolute",top:-210,left:-210,width:600,height:600,borderRadius:500,border:"3px solid rgba(212,175,55,.3)"}}/>
   <div style={{width:"100%",display:"flex",flexDirection:"column",padding:"76px 86px",gap:32}}>
    <div style={{display:"flex",fontSize:30,color:"#E3C67F",fontWeight:800}}>AREES LOOP · فعاليات وبرامج</div>
    <div style={{height:4,width:170,background:"#D4AF37"}}/>
    <div style={{fontSize:59,fontWeight:900,lineHeight:1.45,maxWidth:1000}}>{title}</div>
    <div style={{fontSize:26,color:"#E4CC91"}}>اكتشف تفاصيل الفعالية والجهة المنظمة عبر أريس لوب</div>
   </div>
  </div>,{width:1200,height:630,headers:{"Cache-Control":"public, max-age=86400,s-maxage=604800"}}
 );
}
