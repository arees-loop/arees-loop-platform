"use client";

import { useState } from "react";

type PdfWorker = {
  set: (options: Record<string, unknown>) => PdfWorker;
  from: (element: HTMLElement) => PdfWorker;
  outputPdf: (type: "blob") => Promise<Blob>;
};
type PdfFactory = () => PdfWorker;

declare global {
  interface Window {
    html2pdf?: PdfFactory;
  }
}

let pdfLoader: Promise<PdfFactory> | null = null;

function loadPdfLibrary(): Promise<PdfFactory> {
  if (window.html2pdf) return Promise.resolve(window.html2pdf);
  if (!pdfLoader) {
    pdfLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/vendor/html2pdf.bundle.min.js";
      script.async = true;
      script.onload = () => window.html2pdf
        ? resolve(window.html2pdf)
        : reject(new Error("تعذر تهيئة مكتبة PDF."));
      script.onerror = () => reject(new Error("تعذر تحميل أداة إنشاء ملف PDF."));
      document.head.appendChild(script);
    });
  }
  return pdfLoader;
}

function quoteFilename(sheet: HTMLElement) {
  const reference = sheet.querySelector('span[dir="ltr"]')?.textContent?.trim();
  return `Arees-Quote-${reference || "quotation"}.pdf`;
}

async function createQuotePdf() {
  const sheet = document.querySelector<HTMLElement>(".quote-print-sheet");
  if (!sheet) throw new Error("لم أجد تفاصيل عرض السعر في الصفحة.");
  const images = Array.from(sheet.querySelectorAll("img"));
  await Promise.all(images.map((image) => image.decode().catch(() => undefined)));

  const html2pdf = await loadPdfLibrary();
  const blob = await html2pdf().set({
    margin: [8, 7, 8, 7],
    filename: quoteFilename(sheet),
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: 0,
      windowWidth: Math.max(sheet.scrollWidth, 794),
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"], avoid: [".quote-header-brand-row", ".quote-header-logo"] },
  }).from(sheet).outputPdf("blob");
  return { blob, filename: quoteFilename(sheet) };
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function QuotePrintButton({ disabled }: { disabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function downloadPdf() {
    if (disabled || busy) return;
    setBusy(true);
    setStatus("");
    try {
      const { blob, filename } = await createQuotePdf();
      download(blob, filename);
      setStatus("تم تنزيل عرض السعر بصيغة PDF.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "تعذر إنشاء ملف PDF.");
    } finally {
      setBusy(false);
    }
  }

  async function sharePdf() {
    if (disabled || busy) return;
    setBusy(true);
    setStatus("");
    try {
      const { blob, filename } = await createQuotePdf();
      const file = new File([blob], filename, { type: "application/pdf" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "عرض سعر من أريس" });
        setStatus("تم فتح خيارات مشاركة ملف عرض السعر.");
      } else {
        download(blob, filename);
        setStatus("جهازك لا يدعم مشاركة الملف مباشرة؛ تم تنزيل PDF لتتمكن من إرفاقه في واتساب.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("تم إلغاء المشاركة.");
      } else {
        setStatus(error instanceof Error ? error.message : "تعذرت مشاركة ملف PDF.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" disabled={disabled || busy} onClick={() => void downloadPdf()} className="rounded-full bg-[#0D3B34] px-6 py-3 text-sm font-bold text-white disabled:opacity-40">
        {busy ? "جارٍ تجهيز PDF…" : "تنزيل عرض السعر PDF"}
      </button>
      <button type="button" disabled={disabled || busy} onClick={() => void sharePdf()} className="rounded-full border border-[#D4AF37]/55 bg-white px-5 py-3 text-sm font-bold text-[#0D3B34] disabled:opacity-40">
        مشاركة PDF
      </button>
      <span aria-live="polite" className="text-xs text-[#0D3B34]/65">
        {status || "يمكنك تنزيل العرض أو مشاركته كملف PDF."}
      </span>
    </div>
  );
}
