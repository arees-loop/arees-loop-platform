"use client";

import Script from "next/script";

/**
 * Keep the authentic Saudi Business Center seal available on every viewport.
 * Responsive positioning/scale belongs to globals.css, not to a replacement
 * graphic or unofficial badge. The provider owns its own verified artwork.
 */
export default function SaudiBusinessVerification(){
  return <>
    <div
      className="sbc-verify-seal"
      data-token="bHNZMFR6VHFRQ095M3RmMzcwbU02QT09"
      data-position="bottom-left"
      aria-label="ختم المتجر الموثق من المركز السعودي للأعمال"
    />
    <Script
      src="https://eauthenticate.saudibusiness.gov.sa/EAuthSealApi/seal.js"
      strategy="afterInteractive"
    />
  </>;
}
