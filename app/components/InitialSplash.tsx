"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const SPLASH_VISIBLE_MS = 2600;
const SPLASH_REMOVE_MS = 3200;
const SPLASH_SEEN_KEY = "arees-loop-intro-seen-v1";

export default function InitialSplash() {
  const pathname = usePathname();
  // Start without an overlay so client navigation and reloads cannot flash it
  // before the browser checks whether this tab has already seen the intro.
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const firstRoute = useRef<string | null>(null);

  useEffect(() => {
    // Next.js keeps the root layout mounted during client transitions. On
    // route changes always dismiss a still-visible intro immediately.
    if (firstRoute.current !== null) {
      if (pathname !== firstRoute.current) {
        setVisible(false);
        setClosing(true);
      }
      return;
    }

    firstRoute.current = pathname;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SPLASH_SEEN_KEY) === "1";
      // A visitor who enters via an inner page must not see the intro when
      // subsequently navigating to Home in the same tab.
      window.sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
    } catch {
      // Storage can be disabled in private/restricted browser contexts.
      // Navigation within the current document is still guarded by firstRoute.
    }
    if (pathname === "/" && !seen) setVisible(true);
  }, [pathname]);

  useEffect(() => {
    if (!visible || pathname !== "/") return;
    const closeTimer = window.setTimeout(() => setClosing(true), SPLASH_VISIBLE_MS);
    const removeTimer = window.setTimeout(() => setVisible(false), SPLASH_REMOVE_MS);
    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [visible, pathname]);

  if (!visible || pathname !== "/" || firstRoute.current !== "/") return null;

  return (
    <>
      <div
        dir="rtl"
        aria-hidden="true"
        className={`arees-initial-splash fixed inset-0 z-[100000] overflow-hidden bg-[#F3E7D1] transition-[opacity,transform] duration-500 ${
          closing
            ? "pointer-events-none scale-[1.012] opacity-0"
            : "opacity-100"
        }`}
      >
        {/* Company-primary logo, separate from the older Loop loading artwork. */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,#FFFDF5_0%,#F5E8CA_54%,#DCC18C_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,transparent_15%,rgba(255,255,255,0.55)_47%,transparent_78%)]" />
        <div className="absolute inset-x-5 top-[22%] z-20 flex flex-col items-center justify-center gap-5 sm:top-[20%]">
          <Image
            src="/Logo/arees-integrated-solutions-logo.png"
            alt="الشعار الأساسي لشركة أريس الحلول المتكاملة المحدودة للسفر والسياحة"
            width={640}
            height={640}
            priority
            sizes="(max-width: 640px) 68vw, 340px"
            className="h-auto max-h-[43vh] w-[68vw] max-w-[340px] object-contain drop-shadow-[0_12px_20px_rgba(64,47,15,0.13)]"
          />
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
        /*
          CSS fallback: even if a mobile browser delays React timers,
          the splash itself becomes invisible and non-interactive.
        */
        @keyframes splashSafetyExit {
          0%,
          80% {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }

          96% {
            opacity: 0;
            visibility: visible;
            pointer-events: none;
          }

          100% {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
        }

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

        .arees-initial-splash {
          animation: splashSafetyExit 3.2s ease forwards;
          will-change: opacity;
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

        @media (prefers-reduced-motion: reduce) {
          .arees-initial-splash {
            animation-duration: 1.2s;
          }

          .arees-logo-shine,
          .arees-logo-glow,
          .arees-center-spark,
          .arees-progress-shine {
            animation: none;
          }

          .arees-progress {
            animation: none;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
