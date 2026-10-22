import Image from "next/image";
import { pointsFromServicePrice } from "@/lib/service-loyalty-points";

/** Reusable full-width earning banner that never competes with the price. */
export default function ServiceLoyaltyBanner({
  finalPrice,
  className = "",
}: {
  finalPrice: number;
  className?: string;
}) {
  const points = pointsFromServicePrice(Number(finalPrice));
  if (points <= 0) return null;

  return (
    <div dir="rtl" className={`flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/35 bg-[#FFF6DD] px-3 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.8)] ${className}`}>
      <Image src="/Logo/arees-loop-logo.png" alt="" width={40} height={30} className="h-7 w-10 shrink-0 object-contain" aria-hidden="true"/>
      <span className="text-[12px] font-extrabold leading-6 text-[#0D3B34] sm:text-[13px]">
        احجز واحصل على <strong className="font-black tabular-nums text-[#926712]">{points.toLocaleString("ar-SA")}</strong> نقطة أريس لوب
      </span>
    </div>
  );
}
