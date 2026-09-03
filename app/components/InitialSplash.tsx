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
            ? "pointer-events-none scale-[1.015] opacity-0"
            : "opacity-100"
        }`}
      >
        {/* BACKGROUND IMAGE */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/Image/loading/arees-loop-loading-bg.webp')",
          }}
        />

        {/* SOFT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0D3B34]/10" />

        {/* GOLD ATMOSPHERIC GLOW */}
        <div className="pointer-events-none absolute left-1/2 top-[27%] h-[220px] w-[500px] -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-[90px]" />

        {/* INFINITY SHINE */}
        <div className="pointer-events-none absolute left-1/2 top-[22%] z-20 w-[300px] -translate-x-1/2 sm:w-[390px] md:w-[470px]">
          <svg
            viewBox="0 0 500 240"
            fill="none"
            className="h-auto w-full overflow-visible"
          >
            <defs>
              <linearGradient
                id="splashGold"
                x1="60"
                y1="120"
                x2="440"
                y2="120"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#8F6D12" stopOpacity="0" />
                <stop offset="0.32" stopColor="#D4AF37" />
                <stop offset="0.5" stopColor="#FFF3AF" />
                <stop offset="0.67" stopColor="#D4AF37" />
                <stop offset="1" stopColor="#8F6D12" stopOpacity="0" />
              </linearGradient>

              <filter id="splashGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* FAINT INFINITY TRACK */}
            <path
              d="M65 120C65 63 116 48 158 72C193 92 218 126 250 150C282 174 307 198 342 198C397 198 435 165 435 120C435 75 397 42 342 42C307 42 282 66 250 90C218 114 193 148 158 168C116 192 65 177 65 120Z"
              stroke="rgba(212,175,55,0.14)"
              strokeWidth="5"
            />

            {/* MOVING GOLD SHINE */}
            <path
              d="M65 120C65 63 116 48 158 72C193 92 218 126 250 150C282 174 307 198 342 198C397 198 435 165 435 120C435 75 397 42 342 42C307 42 282 66 250 90C218 114 193 148 158 168C116 192 65 177 65 120Z"
              pathLength="620"
              stroke="url(#splashGold)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="85 535"
              filter="url(#splashGlow)"
              className="arees-infinity-shine"
            />
          </svg>
        </div>

        {/* PROGRESS BAR */}
        <div className="absolute bottom-[10%] left-1/2 z-30 w-[68%] max-w-[520px] -translate-x-1/2">
          <div className="relative h-[8px] overflow-hidden rounded-full border border-[#D4AF37]/60 bg-[#0D3B34]/30 backdrop-blur-sm">
            <div className="arees-progress absolute inset-y-0 left-0 overflow-hidden rounded-full bg-gradient-to-r from-[#8F6D12] via-[#D4AF37] to-[#F5DC86]">
              <div className="arees-shimmer absolute inset-y-[-8px] w-[80px] bg-gradient-to-r from-transparent via-white/95 to-transparent blur-[3px]" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#B99124]" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.95)]" />

            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#B99124]" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes infinityShine {
          from {
            stroke-dashoffset: 620;
          }

          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes progressFill {
          0% {
            width: 3%;
          }

          35% {
            width: 35%;
          }

          70% {
            width: 72%;
          }

          100% {
            width: 100%;
          }
        }

        @keyframes shimmerMove {
          from {
            transform: translateX(-120%);
          }

          to {
            transform: translateX(700%);
          }
        }

        .arees-infinity-shine {
          animation: infinityShine 1.7s linear infinite;
        }

        .arees-progress {
          animation: progressFill 2.7s ease-out forwards;
        }

        .arees-shimmer {
          animation: shimmerMove 1.05s linear infinite;
        }
      `}</style>
    </>
  );
}