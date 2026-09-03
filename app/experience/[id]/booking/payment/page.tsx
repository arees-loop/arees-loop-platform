"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type Experience = {
  id: string;
  title: string;
  image: string;
  location: string;
  price: number;
  points: number;
};

type PaymentMethod = "mada" | "applepay" | "card";

const experiences: Experience[] = [
  {
    id: "1",
    title: "متحف وبستان الصافية",
    image: "/Image/hero/experiences/alsafiya-museum.jpg",
    location: "المدينة المنورة",
    price: 35,
    points: 150,
  },
  {
    id: "2",
    title: "المتحف الدولي للسيرة النبوية",
    image: "/Image/hero/experiences/seerah-museum.jpg",
    location: "المدينة المنورة",
    price: 45,
    points: 200,
  },
  {
    id: "3",
    title: "جولة مسجد الغمامة وما حوله",
    image: "/Image/hero/experiences/al-ghamamah-mosque.jpg",
    location: "المنطقة المركزية",
    price: 45,
    points: 180,
  },
];

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const id = params?.id ?? "1";

  const experience = useMemo(
    () => experiences.find((item) => item.id === id) ?? experiences[0],
    [id]
  );

  const selectedDate = searchParams.get("date") ?? "2026-09-05";
  const selectedTime = searchParams.get("time") ?? "17:30";

  const guestsValue = Number(searchParams.get("guests")) || 1;
  const guests = Math.max(1, Math.min(10, guestsValue));

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mada");

  const [agree, setAgree] = useState(false);

  const subtotal = experience.price * guests;
  const serviceFee = 0;
  const total = subtotal + serviceFee;
  const expectedPoints = experience.points * guests;

  const reviewUrl =
    `/experience/${experience.id}/booking/review` +
    `?date=${encodeURIComponent(selectedDate)}` +
    `&time=${encodeURIComponent(selectedTime)}` +
    `&guests=${guests}`;

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#F7F5EF] text-[#0D3B34]"
      style={{
        "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(212,175,55,0.10),transparent_25%),radial-gradient(circle_at_7%_85%,rgba(13,59,52,0.07),transparent_30%),linear-gradient(135deg,#FAF8F2_0%,#F4F1E8_52%,#F8F6F0_100%)]" />

        <div className="absolute -right-40 top-20 h-[480px] w-[480px] rounded-full bg-[#D4AF37]/[0.05] blur-[120px]" />

        <div className="absolute -left-40 bottom-0 h-[450px] w-[450px] rounded-full bg-[#0D3B34]/[0.04] blur-[130px]" />
      </div>

      {/* HEADER */}
      <header className="relative z-40 border-b border-[#0D3B34]/[0.07] bg-[#F7F5EF]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-5 py-3.5 md:px-8">
          <Link href="/">
            <Image
              src="/Logo/arees-loop-logo.png"
              alt="Arees Loop"
              width={165}
              height={82}
              priority
              className="h-auto w-[120px] md:w-[138px]"
            />
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-[#0D3B34]/10 bg-white/65 px-4 py-2.5">
              <ShieldIcon />

              <span className="text-[11px] font-semibold text-[#0D3B34]/70">
                بوابة دفع آمنة
              </span>
            </div>

            <Link
              href="/bookings"
              className="rounded-full border border-[#0D3B34]/10 bg-white/65 px-4 py-2.5 text-[11px] font-semibold text-[#0D3B34]/70"
            >
              حجوزاتي
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1380px] px-5 pb-20 pt-7 md:px-8">
        {/* TOP */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={reviewUrl}
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#0D3B34]/70 transition hover:text-[#0D3B34]"
          >
            <ArrowBackIcon />
            العودة للمراجعة
          </Link>

          <div className="flex items-center gap-2 text-[11px] font-medium text-[#0D3B34]/60">
            <span>اختيار الزيارة</span>
            <span>•</span>

            <span>مراجعة الحجز</span>
            <span>•</span>

            <span className="font-semibold text-[#0D3B34]">
              الدفع
            </span>
          </div>
        </div>

        {/* TITLE */}
        <div className="mt-8">
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#B99124]">
            SECURE PAYMENT
          </p>

          <h1
            className="mt-2 text-[34px] font-semibold leading-tight text-[#0D3B34] md:text-[42px]"
            style={{
              fontFamily: "var(--font-el-messiri), sans-serif",
            }}
          >
            إتمام الدفع
          </h1>

          <p className="mt-3 max-w-2xl text-[14px] leading-7 text-[#0D3B34]/70">
            اختر وسيلة الدفع المناسبة. في النسخة التشغيلية سيتم تحويل عملية
            الدفع إلى مزود دفع مرخّص ومعتمد.
          </p>
        </div>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_410px]">
          {/* MAIN */}
          <div className="space-y-5">
            {/* BOOKING */}
            <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/70 backdrop-blur-xl">
              <div className="grid md:grid-cols-[230px_1fr]">
                <div className="relative min-h-[200px]">
                  <Image
                    src={experience.image}
                    alt={experience.title}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <div className="flex flex-col justify-center p-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#0D3B34]/8 px-3.5 py-1.5 text-[10px] font-semibold text-[#0D3B34]/75">
                      الحجز الحالي
                    </span>

                    <span className="rounded-full bg-[#D4AF37]/15 px-3.5 py-1.5 text-[10px] font-semibold text-[#856513]">
                      +{expectedPoints} نقطة متوقعة
                    </span>
                  </div>

                  <h2
                    className="mt-4 text-[26px] font-semibold text-[#0D3B34] md:text-[29px]"
                    style={{
                      fontFamily: "var(--font-el-messiri), sans-serif",
                    }}
                  >
                    {experience.title}
                  </h2>

                  <div className="mt-4 grid gap-2 text-[12px] font-medium text-[#0D3B34]/68 sm:grid-cols-2">
                    <span className="flex items-center gap-2">
                      <CalendarIcon />
                      {formatDate(selectedDate)}
                    </span>

                    <span className="flex items-center gap-2">
                      <ClockIcon />
                      {selectedTime}
                    </span>

                    <span className="flex items-center gap-2">
                      <UsersIcon />
                      {guests} {guests === 1 ? "زائر" : "زوار"}
                    </span>

                    <span className="flex items-center gap-2">
                      <LocationIcon />
                      {experience.location}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* PAYMENT METHODS */}
            <section className="rounded-[28px] border border-white/80 bg-white/65 p-6 backdrop-blur-xl md:p-7">
              <p className="text-[11px] font-bold tracking-[0.17em] text-[#B99124]">
                PAYMENT METHOD
              </p>

              <h2
                className="mt-2 text-[26px] font-semibold text-[#0D3B34]"
                style={{
                  fontFamily: "var(--font-el-messiri), sans-serif",
                }}
              >
                اختر طريقة الدفع
              </h2>

              <p className="mt-2 text-[12px] leading-6 text-[#0D3B34]/65">
                الوسائل التالية واجهة تجريبية فقط، ولن يتم إدخال أو إرسال
                بيانات مالية فعلية من هذه الصفحة.
              </p>

              <div className="mt-6 grid gap-3">
                <PaymentMethodCard
                  active={paymentMethod === "mada"}
                  onClick={() => setPaymentMethod("mada")}
                  icon={<CardIcon />}
                  title="مدى"
                  description="الدفع ببطاقة مدى عبر بوابة الدفع المعتمدة."
                  badge="الأكثر استخدامًا"
                />

                <PaymentMethodCard
                  active={paymentMethod === "applepay"}
                  onClick={() => setPaymentMethod("applepay")}
                  icon={<WalletIcon />}
                  title="Apple Pay"
                  description="دفع سريع وآمن عبر الجهاز عند دعم مزود الدفع."
                />

                <PaymentMethodCard
                  active={paymentMethod === "card"}
                  onClick={() => setPaymentMethod("card")}
                  icon={<CreditCardIcon />}
                  title="بطاقة بنكية"
                  description="Visa أو Mastercard من خلال صفحة مزود الدفع."
                />
              </div>
            </section>

            {/* SECURITY */}
            <section className="rounded-[28px] border border-white/80 bg-white/65 p-6 backdrop-blur-xl md:p-7">
              <p className="text-[11px] font-bold tracking-[0.17em] text-[#B99124]">
                PAYMENT SECURITY
              </p>

              <h2
                className="mt-2 text-[26px] font-semibold text-[#0D3B34]"
                style={{
                  fontFamily: "var(--font-el-messiri), sans-serif",
                }}
              >
                حماية عملية الدفع
              </h2>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <SecurityItem
                  icon={<ServerIcon />}
                  title="السعر من الخادم"
                  description="القيمة النهائية لا تعتمد على السعر الظاهر في المتصفح."
                />

                <SecurityItem
                  icon={<ShieldIcon />}
                  title="مزود دفع مرخّص"
                  description="تنفيذ الدفع سيكون عبر مزود دفع معتمد في المملكة."
                />

                <SecurityItem
                  icon={<LockIcon />}
                  title="لا نخزن بيانات البطاقة"
                  description="بيانات البطاقة لا تُحفظ داخل Arees Loop."
                />

                <SecurityItem
                  icon={<CheckIcon />}
                  title="تأكيد العملية"
                  description="الحجز لا يتحول إلى مؤكد إلا بعد نتيجة دفع موثوقة من الخادم."
                />
              </div>
            </section>

            {/* NOTICE */}
            <section className="rounded-[24px] border border-[#D4AF37]/25 bg-[#D4AF37]/[0.07] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D3B34] text-[#D4AF37]">
                  <InfoIcon />
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-[#0D3B34]">
                    مرحلة تجريبية
                  </p>

                  <p className="mt-1.5 text-[11px] leading-6 text-[#0D3B34]/68">
                    هذه الصفحة تعرض تدفق الدفع فقط. لا توجد عملية تحصيل فعلية
                    أو اتصال ببوابة دفع في النسخة الحالية.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* SUMMARY */}
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[28px] border border-white/80 bg-white/75 p-6 backdrop-blur-xl">
              <p className="text-[11px] font-bold tracking-[0.17em] text-[#B99124]">
                PAYMENT SUMMARY
              </p>

              <h2
                className="mt-2 text-[27px] font-semibold text-[#0D3B34]"
                style={{
                  fontFamily: "var(--font-el-messiri), sans-serif",
                }}
              >
                ملخص الدفع
              </h2>

              <div className="mt-6 space-y-4">
                <SummaryRow
                  label="سعر الفرد"
                  value={`${experience.price} ر.س`}
                />

                <SummaryRow
                  label="عدد الزوار"
                  value={`${guests}`}
                />

                <SummaryRow
                  label="قيمة الحجز"
                  value={`${subtotal} ر.س`}
                />

                <SummaryRow
                  label="رسوم الخدمة"
                  value={
                    serviceFee === 0
                      ? "بدون رسوم"
                      : `${serviceFee} ر.س`
                  }
                />
              </div>

              <div className="my-5 h-px bg-[#0D3B34]/10" />

              <div className="rounded-[19px] bg-[#0D3B34] p-5 text-white">
                <p className="text-[12px] font-semibold text-white/75">
                  المبلغ المطلوب
                </p>

                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-[11px] text-white/55">
                    إجمالي العملية
                  </span>

                  <span className="text-[30px] font-semibold text-[#D4AF37]">
                    {total} ر.س
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-[16px] bg-[#D4AF37]/12 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold text-[#0D3B34]">
                      مكافآت Loop
                    </p>

                    <p className="mt-1 text-[10px] text-[#0D3B34]/60">
                      بعد اكتمال الزيارة والتحقق
                    </p>
                  </div>

                  <span className="text-[16px] font-bold text-[#896713]">
                    +{expectedPoints}
                  </span>
                </div>
              </div>

              {/* METHOD SUMMARY */}
              <div className="mt-4 rounded-[16px] border border-[#0D3B34]/10 bg-white/55 p-4">
                <p className="text-[10px] font-medium text-[#0D3B34]/60">
                  طريقة الدفع المختارة
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[#B99124]">
                    {paymentMethod === "mada" && <CardIcon />}
                    {paymentMethod === "applepay" && <WalletIcon />}
                    {paymentMethod === "card" && <CreditCardIcon />}
                  </span>

                  <span className="text-[13px] font-semibold text-[#0D3B34]">
                    {paymentMethod === "mada"
                      ? "مدى"
                      : paymentMethod === "applepay"
                        ? "Apple Pay"
                        : "بطاقة بنكية"}
                  </span>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[15px] border border-[#0D3B34]/10 bg-white/55 p-4">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(event) =>
                    setAgree(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-[#0D3B34]"
                />

                <span className="text-[11px] leading-6 text-[#0D3B34]/70">
                  أؤكد تفاصيل الحجز وأوافق على الانتقال إلى بوابة الدفع عند
                  تفعيل الربط الفعلي.
                </span>
              </label>

              <button
                type="button"
                disabled={!agree}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-[15px] px-5 py-4 text-[13px] font-bold transition ${
                  agree
                    ? "bg-[#D4AF37] text-[#0D3B34] hover:bg-[#E0BE50]"
                    : "cursor-not-allowed bg-[#0D3B34]/10 text-[#0D3B34]/45"
                }`}
              >
                الانتقال لبوابة الدفع
                <ArrowIcon />
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-medium text-[#0D3B34]/60">
                <LockIcon />
                لن يتم تنفيذ دفع حقيقي الآن
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <TrustItem
                icon={<ShieldIcon />}
                title="بوابة آمنة"
              />

              <TrustItem
                icon={<LockIcon />}
                title="لا نخزن البطاقة"
              />

              <TrustItem
                icon={<ServerIcon />}
                title="تحقق خادمي"
              />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function PaymentMethodCard({
  active,
  onClick,
  icon,
  title,
  description,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-[20px] border p-4 text-right transition ${
        active
          ? "border-[#D4AF37] bg-[#D4AF37]/10"
          : "border-[#0D3B34]/10 bg-white/55 hover:border-[#0D3B34]/22"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] ${
          active
            ? "bg-[#0D3B34] text-[#D4AF37]"
            : "bg-[#0D3B34]/8 text-[#0D3B34]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[14px] font-semibold text-[#0D3B34]">
            {title}
          </p>

          {badge && (
            <span className="rounded-full bg-[#D4AF37]/15 px-2.5 py-1 text-[9px] font-semibold text-[#856513]">
              {badge}
            </span>
          )}
        </div>

        <p className="mt-1.5 text-[11px] leading-5 text-[#0D3B34]/65">
          {description}
        </p>
      </div>

      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          active
            ? "border-[#0D3B34] bg-[#0D3B34]"
            : "border-[#0D3B34]/25"
        }`}
      >
        {active && (
          <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
        )}
      </div>
    </button>
  );
}

function SecurityItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#0D3B34]/10 bg-white/55 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D3B34] text-[#D4AF37]">
          {icon}
        </div>

        <div>
          <p className="text-[13px] font-semibold text-[#0D3B34]">
            {title}
          </p>

          <p className="mt-1.5 text-[11px] leading-6 text-[#0D3B34]/65">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-[11px] font-medium text-[#0D3B34]/65">
        {label}
      </span>

      <span className="text-[12px] font-semibold text-[#0D3B34]">
        {value}
      </span>
    </div>
  );
}

function TrustItem({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-white/80 bg-white/60 px-2 py-3.5 text-[#0D3B34]/70 backdrop-blur-xl">
      <span className="text-[#B99124]">
        {icon}
      </span>

      <span className="text-center text-[10px] font-semibold">
        {title}
      </span>
    </div>
  );
}

function formatDate(date: string) {
  const values: Record<string, string> = {
    "2026-09-05": "05 سبتمبر 2026",
    "2026-09-06": "06 سبتمبر 2026",
    "2026-09-07": "07 سبتمبر 2026",
    "2026-09-08": "08 سبتمبر 2026",
  };

  return values[date] ?? date;
}

/* ================= ICONS ================= */

function CalendarIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c.5-4 2.5-6 6-6s5.5 2 6 6" />
      <path d="M16 6a3 3 0 0 1 0 6M17 14c2.5.5 3.7 2.2 4 5" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3 20 6v5c0 5-3.3 8.2-8 10-4.7-1.8-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="7" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  );
}

function CreditCardIcon() {
  return <CardIcon />;
}

function WalletIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 6h15a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V6Z" />
      <path d="M4 6V5a2 2 0 0 1 2-2h11" />
      <path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7h.01" />
    </svg>
  );
}

function ArrowBackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}