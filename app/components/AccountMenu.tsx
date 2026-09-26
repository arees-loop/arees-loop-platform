"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type AccountMenuProps = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
};

export default function AccountMenu({
  firstName,
  lastName,
  email,
  phone: _phone,
}: AccountMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const cleanFirstName = firstName?.trim() || "";
  const cleanLastName = lastName?.trim() || "";

  const displayName =
    [cleanFirstName, cleanLastName].filter(Boolean).join(" ") ||
    email?.split("@")[0] ||
    "زائر";

  const greetingName =
    cleanFirstName ||
    email?.split("@")[0] ||
    "زائر";

  const avatarLetter =
    displayName.trim().charAt(0) || "ز";

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setOpen(false);
      router.replace("/auth");
      router.refresh();
    } catch (error) {
      console.error("Account logout error:", error);
      setLoggingOut(false);
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="فتح قائمة الحساب"
        className="flex items-center gap-2 rounded-full bg-[#0D3B34] py-1.5 pl-3 pr-1.5 text-white transition hover:bg-[#154C42]"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-[11px] font-bold text-[#0D3B34]">
          {avatarLetter}
        </div>

        <div className="hidden min-w-0 text-right sm:block">
          <p className="max-w-[120px] truncate text-[10px] font-semibold">
            مرحبًا {greetingName}
          </p>

          <p className="text-[8px] text-white/65">
            حسابي
          </p>
        </div>

        <ChevronDownIcon open={open} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+10px)] z-[100] w-[270px] overflow-hidden rounded-[20px] border border-[#0D3B34]/10 bg-[#FBFAF6] p-2 text-[#0D3B34] shadow-[0_22px_60px_rgba(13,59,52,0.18)]"
        >
          <div className="border-b border-[#0D3B34]/8 px-3 pb-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0D3B34] text-sm font-bold text-[#D4AF37]">
                {avatarLetter}
              </div>

              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-[11px] font-bold">
                  {displayName}
                </p>

                {email && (
                  <p
                    dir="ltr"
                    className="mt-1 truncate text-right text-[9px] text-[#0D3B34]/55"
                  >
                    {email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="py-2">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-between rounded-[14px] px-3 py-3 text-right transition hover:bg-[#0D3B34]/[0.05]"
            >
              <div>
                <p className="text-[10px] font-semibold">
                  الملف الشخصي
                </p>

                <p className="mt-1 text-[8px] text-[#0D3B34]/55">
                  بياناتك وإعدادات حسابك
                </p>
              </div>

              <ProfileIcon />
            </Link>
          </div>

          <div className="border-t border-[#0D3B34]/8 pt-2">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center justify-between rounded-[14px] px-3 py-3 text-right transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
            >
              <div>
                <p className="text-[10px] font-semibold text-red-700">
                  {loggingOut
                    ? "جاري تسجيل الخروج..."
                    : "تسجيل الخروج"}
                </p>

                <p className="mt-1 text-[8px] text-red-700/55">
                  إنهاء الجلسة الحالية
                </p>
              </div>

              <LogoutIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronDownIcon({
  open,
}: {
  open: boolean;
}) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#0D3B34]/60"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4.5 3.4-7 8-7s7.2 2.5 8 7" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-red-700/70"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}