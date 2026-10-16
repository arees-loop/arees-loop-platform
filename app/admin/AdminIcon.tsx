import type { ReactNode, SVGProps } from "react";

export type AdminIconName =
  | "dashboard" | "requests" | "settings" | "plane" | "ship" | "hotel" | "car"
  | "partners" | "users" | "services" | "bell" | "check" | "pending"
  | "credit" | "rewards" | "reports" | "external" | "sparkles" | "wallet"
  | "globe" | "chart" | "menu" | "arrow" | "image" | "calendar";

const paths: Record<AdminIconName, ReactNode> = {
 dashboard:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
 requests:<><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3"/></>,
 settings:<><path d="M10 2h4l.5 2.2 2 1.1 2.2-.7 2 3.4-1.7 1.6v2.3l1.7 1.6-2 3.4-2.2-.7-2 1.1L14 21h-4l-.5-2.7-2-1.1-2.2.7-2-3.4L5 12.9v-2.3L3.3 9l2-3.4 2.2.7 2-1.1L10 2Z"/><circle cx="12" cy="11.5" r="3"/></>,
 plane:<><path d="M21 3 3 10l8 3 3 8 7-18Z"/><path d="M11 13 21 3"/></>,
 ship:<><path d="M3 16 12 20l9-4-2-6H5l-2 6ZM8 10V5h8v5M12 5V2M2 22c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1"/></>,
 hotel:<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 21v-5h6v5M8 7h1M15 7h1M8 11h1M15 11h1"/></>,
 car:<><path d="m5 11 2-5h10l2 5M4 11h16v7H4zM7 18v2M17 18v2M8 14h.01M16 14h.01"/></>,
 partners:<><path d="m2 13 5-4 4 2 4-2 7 4-8 7-4-2-3 1-5-6Z"/><path d="M7 9V5h5l3 4M11 11l3 2M9 14l3 2"/></>,
 users:<><circle cx="9" cy="7.5" r="3.5"/><path d="M2.5 21v-3a6.5 6.5 0 0 1 13 0v3M18 8a3 3 0 0 1 0 6M17.5 16a4 4 0 0 1 4 4"/></>,
 services:<><path d="M3 8h18v12H3zM7 8V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M3 13h18M11 12v3h2v-3"/></>,
 bell:<><path d="M18 8a6 6 0 0 0-12 0c0 8-3 7-3 9h18c0-2-3-1-3-9ZM10 21h4"/></>,
 check:<><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
 pending:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></>,
 credit:<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
 rewards:<><path d="M4 10h16v11H4zM2 6h20v4H2zM12 6v15M12 6C4-1 1 7 7 7c2 0 5-1 5-1Zm0 0c8-7 11 1 5 1-2 0-5-1-5-1Z"/></>,
 reports:<><path d="M4 20V11M10 20V4M16 20v-9M22 20V7M2 21h21"/></>,
 external:<><path d="M14 4h6v6M20 4l-9 9M20 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></>,
 sparkles:<><path d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2Z"/></>,
 wallet:<><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 9V5a2 2 0 0 1 2-2h13M16 13h5v5h-5a2 2 0 0 1 0-5Z"/></>,
 globe:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-4 4-4 14 0 18M12 3c4 4 4 14 0 18"/></>,
 chart:<><path d="M3 20h18M6 16l4-5 4 2 5-7M17 6h2v2"/></>,
 menu:<><path d="M4 6h16M4 12h16M4 18h16"/></>,
 arrow:<><path d="M19 12H5m7-7-7 7 7 7"/></>,
 image:<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m4 18 5-5 4 3 3-5 5 6"/></>,
 calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>
};
export default function AdminIcon({name,size=22,...props}:{name:AdminIconName;size?:number}&Omit<SVGProps<SVGSVGElement>,"children">) {
 return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
