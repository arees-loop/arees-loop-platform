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
    <span dir="rtl" aria-label={`احصل على ${points.toLocaleString("ar-SA")} نقطة أريس لوب عند الحجز المؤهل`} className={`inline-flex max-w-full items-center justify-center gap-1.5 rounded-xl border border-[#D4AF37]/35 bg-[#FFF6DD] px-2 py-1 align-middle text-center shadow-[inset_0_1px_0_rgba(255,255,255,.8)] ${className}`}>
      <Image src="/Logo/arees-loop-logo.png" alt="" width={40} height={30} className="h-7 w-10 shrink-0 object-contain" aria-hidden="true"/>
      <span className="text-[10px] font-semibold leading-4 text-[#0D3B34]">احصل على <strong className="font-bold tabular-nums text-[#926712]">{points.toLocaleString("ar-SA")}</strong> نقطة</span>
    </span>
  );
}
