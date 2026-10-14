import { ImageResponse } from "next/og";
export const runtime="edge";
const categories:Record<string,{title:string;subtitle:string;symbol:string}>={
 domestic:{title:"برامج سياحية محلية",subtitle:"اكتشف وجهات المملكة وتجاربها",symbol:"⌖"},
 international:{title:"برامج سياحية عالمية",subtitle:"خطط لرحلتك إلى وجهات العالم",symbol:"✈"},
 cruise:{title:"رحلات الكروز",subtitle:"اكتشف البحر والوجهات البحرية",symbol:"◉"},
 experiences:{title:"التجارب السياحية",subtitle:"اكتشف، عِش التجربة، واكسب المكافآت",symbol:"✦"}
};
export async function GET(request:Request){
 const url=new URL(request.url),type=url.searchParams.get("type")||"experiences",item=categories[type]||categories.experiences;
 return new ImageResponse(
  <div style={{width:"100%",height:"100%",display:"flex",direction:"rtl",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#062E29 0%,#0D3B34 60%,#185449 100%)",color:"#FFFDF7",fontFamily:"sans-serif",position:"relative",overflow:"hidden"}}>
   <div style={{position:"absolute",left:-100,top:-200,width:620,height:620,borderRadius:999,border:"2px solid rgba(232,204,133,.24)"}}/>
   <div style={{position:"absolute",left:80,bottom:-300,width:700,height:700,borderRadius:999,border:"1px solid rgba(232,204,133,.18)"}}/>
   <div style={{display:"flex",width:"100%",height:"100%",padding:"70px 90px",alignItems:"center",justifyContent:"space-between",gap:45}}>
    <div style={{display:"flex",flexDirection:"column",gap:24,maxWidth:820}}>
     <div style={{display:"flex",alignItems:"center",gap:18,color:"#E8CC85",fontSize:32,fontWeight:700}}>AREES LOOP <span style={{color:"#FFFDF7",fontSize:22}}>منصة تجربة الزائر الذكية</span></div>
     <div style={{height:3,width:180,background:"#D4AF37"}}/>
     <div style={{fontSize:62,fontWeight:900,lineHeight:1.35,color:"#FFFDF7"}}>{item.title}</div>
     <div style={{fontSize:30,color:"#E8CC85",lineHeight:1.6}}>{item.subtitle}</div>
     <div style={{fontSize:22,color:"#D8E2DA"}}>اكتشف أكثر · عش التجربة · اكسب المكافآت</div>
    </div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:240,height:240,borderRadius:999,background:"linear-gradient(140deg,#F7DF9B,#C29227)",color:"#0D3B34",fontSize:130,fontWeight:900,boxShadow:"0 18px 55px rgba(0,0,0,.25)"}}>{item.symbol}</div>
   </div>
  </div>,{width:1200,height:630,headers:{"Cache-Control":"public, max-age=86400, s-maxage=604800"}}
 );
}
