type PartnerIconKind = "handshake" | "business" | "individual" | "government" | "login";

export default function PartnerIcon({ kind, className = "h-6 w-6" }: {
  kind: PartnerIconKind;
  className?: string;
}) {
  const common = { stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className} {...common}>
      {kind === "handshake" && <>
        <path d="m2.8 7.1 3.7-3 3.1 1.2M21.2 7.1l-3.7-3-3.1 1.2" />
        <path d="m9.3 5.2-3.7 4.1a2 2 0 0 0 2.9 2.7l2.9-2.5 2.1 1.6" />
        <path d="m13.5 11.1 4.5 3.8a1.8 1.8 0 0 1-2.4 2.7l-1-.9m-1.1 1.1a1.8 1.8 0 0 1-2.5.1l-1-.9m-1.3 1.1a1.8 1.8 0 0 1-2.4.1l-3.9-3.6" />
        <path d="m18.8 7.6-2.6-1.7a3.8 3.8 0 0 0-4.6.2L9.3 8.1M2 8.5l3.4 4.6M22 8.5l-3.4 4.6" />
      </>}
      {kind === "business" && <>
        <rect x="4" y="3" width="16" height="18" rx="2.2" />
        <path d="M9 21v-5h6v5M8 7h2m4 0h2M8 11h2m4 0h2" />
      </>}
      {kind === "individual" && <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5.3 21v-2.2a6.7 6.7 0 0 1 13.4 0V21H5.3ZM17.5 5.1l1.5 1.5 2.7-2.7" />
      </>}
      {kind === "government" && <>
        <path d="m2.5 9.1 9.5-6 9.5 6H2.5ZM4 20.8h16M2.5 23h19M5.6 10v9.1m4.2-9.1v9.1m4.4-9.1v9.1m4.2-9.1v9.1" />
      </>}
      {kind === "login" && <>
        <path d="M14 3.5h4.2A2.8 2.8 0 0 1 21 6.3v11.4a2.8 2.8 0 0 1-2.8 2.8H14M3 12h13m-4-4 4 4-4 4" />
      </>}
    </svg>
  );
}
