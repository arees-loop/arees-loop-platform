"use client";

import { useEffect, useState } from "react";

const particles = Array.from({ length: 24 }, (_, index) => ({
  left: `${8 + ((index * 37) % 84)}%`,
  top: `${12 + ((index * 23) % 70)}%`,
  delay: `${(index % 8) * 90}ms`,
  symbol: index % 5 === 0 ? "🎁" : index % 3 === 0 ? "✦" : "★",
}));

/** Decorative celebration: never grants points or implies that a reward was earned. */
export default function RewardsCelebration() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 3600);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden="true">
      {particles.map((particle, index) => (
        <span
          key={index}
          className="rewards-celebration-particle absolute select-none text-xl text-[#D4AF37] drop-shadow-md md:text-2xl"
          style={{ left: particle.left, top: particle.top, animationDelay: particle.delay }}
        >
          {particle.symbol}
        </span>
      ))}
      <style jsx>{`
        @keyframes reward-spark {
          0% { opacity: 0; transform: translate3d(0, 30px, 0) scale(.4) rotate(-25deg); }
          18% { opacity: 1; }
          65% { opacity: .95; }
          100% { opacity: 0; transform: translate3d(15px, -110px, 0) scale(1.2) rotate(35deg); }
        }
        .rewards-celebration-particle { opacity: 0; animation: reward-spark 2.9s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .rewards-celebration-particle { animation: none; display: none; }
        }
      `}</style>
    </div>
  );
}
