"use client";

import { useEffect, useState } from "react";

export default function InitialSplash() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const closeTimer = window.setTimeout(() => {
      setClosing(true);
    }, 2600);

    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <div
        dir="rtl"
        className={`fixed inset-0 z-[100000] overflow-hidden bg-[#F3E7D1] transition-all duration-500 ${
          closing
            ? "pointer-events-none scale-[1.012] opacity-0"
            : "opacity-100"
        }`}
      >
        {/* LOADING BACKGROUND */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/Image/loading/arees-loop-loading-bg.webp')",
          }}
        />

        {/* SOFT CINEMATIC OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-[#0D3B34]/8" />

        {/* 
          GOLD SHINE OVER THE REAL LOGO
          لا يرسم شعار ثاني - مجرد شعاع يمر فوق الشعار الموجود في الصورة
        */}
        <div className="pointer-events-none absolute left-1/2 top-[25.5%] z-20 h-[24%] w-[43%] -translate-x-1/2 overflow-hidden rounded-[45%]">
          <div className="arees-logo-shine absolute -inset-y-[40%] left-[-30%] w-[16%] rotate-[18deg] bg-gradient-to-r from-transparent via-[#FFF4B5]/85 to-transparent blur-[5px]" />

          <div className="arees-logo-glow absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,224,117,0.12),transparent_58%)]" />
        </div>

        {/* SMALL CENTER SPARK */}
        <div className="pointer-events-none absolute left-1/2 top-[37%] z-20 -translate-x-1/2">
          <div className="arees-center-spark h-3 w-3 rounded-full bg-[#FFF0A4] shadow-[0_0_12px_4px_rgba(212,175,55,0.55)]" />
        </div>

        {/* PROGRESS BAR */}
        <div className="absolute bottom-[9%] left-1/2 z-30 w-[68%] max-w-[520px] -translate-x-1/2">
          <div className="relative h-[8px] overflow-hidden rounded-full border border-[#D4AF37]/55 bg-[#0D3B34]/28 backdrop-blur-sm">
            <div className="arees-progress absolute inset-y-0 left-0 overflow-hidden rounded-full bg-gradient-to-r from-[#80600F] via-[#D4AF37] to-[#F7DE83]">
              <div className="arees-progress-shine absolute inset-y-[-8px] w-[76px] bg-gradient-to-r from-transparent via-white/95 to-transparent blur-[3px]" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#B99124]/80" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_14px_rgba(212,175,55,0.9)]" />

            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#B99124]/80" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes logoShine {
          0% {
            transform: translateX(0) rotate(18deg);
            opacity: 0;
          }

          10% {
            opacity: 0.25;
          }

          45% {
            opacity: 1;
          }

          80% {
            opacity: 0.45;
          }

          100% {
            transform: translateX(820%) rotate(18deg);
            opacity: 0;
          }
        }

        @keyframes logoGlow {
          0%,
          100% {
            opacity: 0.25;
          }

          50% {
            opacity: 0.72;
          }
        }

        @keyframes centerSpark {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.6);
          }

          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }

        @keyframes progressFill {
          0% {
            width: 2%;
          }

          28% {
            width: 30%;
          }

          62% {
            width: 67%;
          }

          100% {
            width: 100%;
          }
        }

        @keyframes progressShine {
          from {
            transform: translateX(-140%);
          }

          to {
            transform: translateX(720%);
          }
        }

        .arees-logo-shine {
          animation: logoShine 1.65s ease-in-out infinite;
        }

        .arees-logo-glow {
          animation: logoGlow 1.8s ease-in-out infinite;
        }

        .arees-center-spark {
          animation: centerSpark 1.15s ease-in-out infinite;
        }

        .arees-progress {
          animation: progressFill 2.7s ease-out forwards;
        }

        .arees-progress-shine {
          animation: progressShine 1s linear infinite;
        }
      `}</style>
    </>
  );
}