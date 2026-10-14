import { ImageResponse } from "next/og";

export const runtime = "edge";

const cards: Record<string, { title: string; subtitle: string; symbol: string }> = {
  government: {
    title: "سجّل كجهة حكومية",
    subtitle: "أبرزوا وجهاتكم وفعالياتكم الرسمية، ووسّعوا وصولها للزوار عبر أريس لوب.",
    symbol: "⌖",
  },
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const card = cards[url.searchParams.get("type") || "government"] || cards.government;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        direction: "rtl",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#062E29 0%,#0D3B34 60%,#185449 100%)",
        color: "#FFFDF7",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: -100, top: -200, width: 620, height: 620, borderRadius: 999, border: "2px solid rgba(232,204,133,.24)" }} />
      <div style={{ position: "absolute", left: 80, bottom: -300, width: 700, height: 700, borderRadius: 999, border: "1px solid rgba(232,204,133,.18)" }} />
      <div style={{ display: "flex", width: "100%", height: "100%", padding: "70px 90px", alignItems: "center", justifyContent: "space-between", gap: 45 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 820 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#E8CC85", fontSize: 32, fontWeight: 700 }}>
            AREES LOOP <span style={{ color: "#FFFDF7", fontSize: 22 }}>منصة تجربة الزائر الذكية</span>
          </div>
          <div style={{ height: 3, width: 180, background: "#D4AF37" }} />
          <div style={{ fontSize: 62, fontWeight: 900, lineHeight: 1.35, color: "#FFFDF7" }}>{card.title}</div>
          <div style={{ fontSize: 30, color: "#E8CC85", lineHeight: 1.6 }}>{card.subtitle}</div>
          <div style={{ fontSize: 22, color: "#D8E2DA" }}>وجهات موثوقة · فعاليات ملهمة · وصول أوسع</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 240, height: 240, borderRadius: 999, background: "linear-gradient(140deg,#F7DF9B,#C29227)", color: "#0D3B34", fontSize: 130, fontWeight: 900, boxShadow: "0 18px 55px rgba(0,0,0,.25)" }}>{card.symbol}</div>
      </div>
    </div>,
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } },
  );
}
