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

function LocationPinIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M19 10.1c0 5-7 11.2-7 11.2S5 15.1 5 10.1a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="10" r="2.2" fill="currentColor"/></svg>;
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
          <span className="guide-feature-visual guide-feature-visual-search" aria-hidden="true">
            <GuidePortrait person="man" />
            <span className="guide-location-badge"><LocationPinIcon /></span>
            <span className="guide-search-badge"><svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" strokeWidth="2"/><path d="m15.5 15.5 4.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span>
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
        <div className="guide-feature-heading">
          <span className="guide-team-portraits" aria-label="مرشد ومرشدة سياحيان" role="group">
            <GuidePortrait person="man" className="guide-team-portrait-front" />
            <GuidePortrait person="woman" className="guide-team-portrait-back" />
          </span>
          <div>
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
