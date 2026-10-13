"use client";

import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import FindNearbyGuidesButton from "./FindNearbyGuidesButton";

function GuidePortrait({ person, className = "" }: { person: "man" | "woman"; className?: string }) {
  return (
    <span
      role="img"
      aria-label={person === "man" ? "مرشد سياحي" : "مرشدة سياحية"}
      className={`guide-portrait guide-portrait-${person} ${className}`}
    />
  );
}

function LocationMapIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 92 92" fill="none" className="h-[76px] w-[76px] shrink-0">
      <defs>
        <linearGradient id="guide-map-light" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F8F0DC" stopOpacity=".94" />
          <stop offset="1" stopColor="#E4D1A5" stopOpacity=".80" />
        </linearGradient>
      </defs>
      <path d="m9 29 23-8 24 8 27-9v51l-27 9-24-8-23 8V29Z" fill="url(#guide-map-light)" stroke="#A5813D" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="m32 21 0 51M56 29v51" stroke="#B79B67" strokeWidth="1.4" strokeDasharray="4 3" />
      <path d="m11 54 18-8 15 10 17-14 20 8" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m11 54 18-8 15 10 17-14 20 8" stroke="#C3A875" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 4"/>
      <path d="M60 11c-11.2 0-19 8.1-19 18.4C41 42.1 60 61 60 61s19-18.9 19-31.6C79 19.1 71.2 11 60 11Z" fill="#0D3B34" stroke="#F8E6A7" strokeWidth="2.7"/>
      <circle cx="60" cy="30" r="7" fill="#F7D277"/>
    </svg>
  );
}

export default function GuidesHeroCards() {
  const cardsRef = useRef<HTMLDivElement>(null);

  function moveCards(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    cardsRef.current?.querySelectorAll<HTMLElement>("[data-guide-card]").forEach((card, index) => {
      const direction = index === 0 ? -1 : 1;
      card.style.setProperty("--guide-card-x", `${(horizontal * 5 * direction).toFixed(2)}px`);
      card.style.setProperty("--guide-card-y", `${(vertical * 4).toFixed(2)}px`);
    });
  }

  function resetCards() {
    cardsRef.current?.querySelectorAll<HTMLElement>("[data-guide-card]").forEach((card) => {
      card.style.setProperty("--guide-card-x", "0px");
      card.style.setProperty("--guide-card-y", "0px");
    });
  }

  return (
    <div
      ref={cardsRef}
      className="guides-hero-cards"
      onPointerMove={moveCards}
      onPointerLeave={resetCards}
      dir="rtl"
    >
      <article data-guide-card className="guide-feature-card">
        <div className="guide-feature-heading">
          <span className="guide-feature-map-visual" role="img" aria-label="خريطة وعلامة تحديد الموقع">
            <LocationMapIcon />
          </span>
          <div>
            <p className="guide-feature-eyebrow">للزوار والسياح</p>
            <h3>اكتشف المكان مع المرشد المناسب</h3>
          </div>
        </div>
        <p className="guide-feature-description">وين ما تكون وجهتك، أريس لوب بتوصلك بالمرشد السياحي المناسب في المكان المناسب، وتوفر عليك وقت وجهد البحث، عشان تعيش تجربة أغنى وأسهل.</p>
        <FindNearbyGuidesButton className="guide-feature-action guide-feature-action-primary" />
      </article>

      <article data-guide-card className="guide-feature-card guide-feature-card-gold">
        <div className="guide-feature-heading guide-feature-heading-guides">
          <span className="guide-team-frame" role="group" aria-label="المرشد والمرشدة في إطار مشترك">
            <GuidePortrait person="man" className="guide-team-half guide-team-half-man" />
            <GuidePortrait person="woman" className="guide-team-half guide-team-half-woman" />
          </span>
          <div className="guide-feature-heading-copy">
            <p className="guide-feature-eyebrow">للمرشدين السياحيين</p>
            <h3>خبرتك تستحق الوصول</h3>
          </div>
        </div>
        <p className="guide-feature-description">حوّل خبرتك السياحية إلى فرص حقيقية. انضم إلى أريس لوب، وخلّي العملاء يكتشفوا خدماتك في الوجهة والوقت المناسبين.</p>
        <Link href="/guides/register" className="guide-feature-action guide-feature-action-secondary">
          انضم كمرشد سياحي
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </article>
    </div>
  );
}
