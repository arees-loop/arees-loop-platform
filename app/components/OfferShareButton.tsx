"use client";

import { useState } from "react";

type Props = {
  title: string;
  imageUrl?: string | null;
  text?: string;
  url?: string;
  className?: string;
};

function absoluteUrl(value: string) {
  try { return new URL(value, window.location.origin).toString(); }
  catch { return value; }
}

function fileNameFor(url: string, type: string) {
  const extension = type.split("/")[1]?.split("+")[0] || url.split(".").pop()?.split(/[?#]/)[0] || "jpg";
  return `arees-offer.${extension === "jpeg" ? "jpg" : extension}`;
}

export default function OfferShareButton({ title, imageUrl, text, url, className = "" }: Props) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function fallbackToWhatsApp(caption: string) {
    const body = caption;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(body)}`;
    const opened = window.open(whatsappUrl, "_blank");
    if (opened) opened.opener = null;
    else window.location.assign(whatsappUrl);
    setMessage("فتحنا واتساب بنص العرض ورابطه. أرفق صورة العرض من جهازك إذا لم تكن المشاركة المباشرة متاحة.");
  }

  async function share() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    const shareUrl = url ? absoluteUrl(url) : window.location.href;
    const caption = [title, text, shareUrl].filter(Boolean).join("\n");

    try {
      const image = imageUrl ? absoluteUrl(imageUrl) : "";
      const probe = image ? new File([], "arees-offer.jpg", { type: "image/jpeg" }) : null;
      const canShareImage = Boolean(
        image && navigator.canShare?.({ files: [probe!] }),
      );

      if (canShareImage) {
        const response = await fetch(image, { cache: "no-store" });
        if (!response.ok) throw new Error("تعذر تحميل صورة العرض.");
        const blob = await response.blob();
        if (!blob.type.startsWith("image/")) throw new Error("رابط العرض لا يعيد ملف صورة.");
        const file = new File([blob], fileNameFor(image, blob.type), { type: blob.type });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title, text: caption, files: [file] });
          setMessage("تم فتح مشاركة صورة العرض مع تفاصيلها ورابطها.");
          return;
        }
      }

      if (!image && "share" in navigator) {
        await navigator.share({ title, text: caption });
        setMessage("تم فتح خيارات مشاركة العرض.");
        return;
      }

      fallbackToWhatsApp(caption);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessage("تم إلغاء المشاركة.");
      } else {
        setMessage(error instanceof Error ? error.message : "تعذرت مشاركة العرض.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button type="button" onClick={() => void share()} disabled={busy} className="rounded-xl border border-[#B99124]/40 bg-white px-4 py-2 text-sm font-bold text-[#0D3B34] disabled:opacity-50">
        {busy ? "جارٍ تجهيز المشاركة…" : "↗ مشاركة العرض"}
      </button>
      {message && <span role="status" className="ms-2 text-xs text-[#0D3B34]">{message}</span>}
    </div>
  );
}
