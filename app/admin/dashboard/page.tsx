"use client";

import Link from "next/link";

type Metric = {
  label: string;
  value: string;
  note: string;
  highlight?: boolean;
};

const metrics: Metric[] = [
  {
    label: "الزيارات الموثقة الإضافية",
    value: "1,284",
    note: "North Star Metric — Incremental Verified Visits",
    highlight: true,
  },
  {
    label: "فتح الاكتشاف القريب",
    value: "8,460",
    note: "Nearby Discovery Opens",
  },
  {
    label: "معدل التحويل للحجز",
    value: "12.8%",
    note: "من فتح التجربة إلى الحجز",
  },
  {
    label: "معدل الزيارة الموثقة",
    value: "71.4%",
    note: "من الحجوزات المؤهلة",
  },
  {
    label: "إكمال المهام",
    value: "63.2%",
    note: "Mission Completion Rate",
  },
  {
    label: "استبدال المكافآت",
    value: "38.6%",
    note: "Reward Redemption Rate",
  },
];

const cities = [
  { city: "المدينة المنورة", discoveries: 3480, bookings: 824, visits: 612 },
  { city: "مكة المكرمة", discoveries: 2210, bookings: 431, visits: 288 },
  { city: "جدة", discoveries: 1260, bookings: 248, visits: 164 },
  { city: "الطائف", discoveries: 640, bookings: 133, visits: 91 },
  { city: "الدرعية", discoveries: 510, bookings: 118, visits: 79 },
  { city: "أبها", discoveries: 360, bookings: 84, visits: 50 },
];

const partners = [
  { name: "تجارب المدينة", city: "المدينة المنورة", services: 8, bookings: 412, visits: 305, conversion: "15.6%" },
  { name: "مسارات الحجاز", city: "مكة المكرمة", services: 6, bookings: 286, visits: 199, conversion: "13.2%" },
  { name: "واجهة جدة", city: "جدة", services: 5, bookings: 194, visits: 141, conversion: "11.8%" },
  { name: "مرتفعات الطائف", city: "الطائف", services: 4, bookings: 121, visits: 83, conversion: "10.9%" },
];

const activity = [
  { label: "09", value: 42 },
  { label: "11", value: 68 },
  { label: "13", value: 54 },
  { label: "15", value: 76 },
  { label: "17", value: 88 },
  { label: "19", value: 96 },
  { label: "21", value: 72 },
];

export default function AdminDashboardPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]"
      style={{ fontFamily: "var(--font-ibm-plex-arabic), sans-serif" }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-[520px] w-[520px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />
        <div className="absolute -left-40 top-[38%] h-[460px] w-[460px] rounded-full bg-[#D4AF37]/10 blur-[125px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-[270px] shrink-0 border-l border-[#0D3B34]/8 bg-[#F9F7F0]/94 px-4 py-5 backdrop-blur-xl xl:block">
          <div className="mb-7 px-3">
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">AREES LOOP ADMIN</p>
            <h2 className="mt-2 text-xl font-bold" style={{ fontFamily: "var(--font-el-messiri), serif" }}>
              لوحة الإدارة والمؤشرات
            </h2>
          </div>

          <nav className="space-y-2">
            <NavItem href="/admin/dashboard" label="نظرة عامة" active />
            <NavItem href="/admin/partners" label="الشركاء والاعتمادات" />
            <NavItem href="/partner/dashboard" label="عرض لوحة الشريك" />
            <NavItem href="/" label="عرض المنصة" />
          </nav>

          <div className="mt-8 rounded-[24px] bg-[#0D3B34] p-5 text-white">
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#E6C24D]">PILOT MODE</p>
            <p className="mt-2 text-sm font-bold">بيانات تجريبية للعرض</p>
            <p className="mt-2 text-xs leading-6 text-white/50">
              المؤشرات الحالية توضيحية لنسخة الـPilot وليست بيانات تشغيلية فعلية.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-[#0D3B34]/8 bg-[#F9F7F0]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div>
                <p className="text-[10px] text-[#0D3B34]/45">AREES Loop</p>
                <p className="mt-1 text-sm font-bold">لوحة الإدارة والمؤشرات</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#FFF3D4] px-3 py-2 text-[10px] font-bold text-[#8C6813]">DEMO DATA</span>
                <Link
                  href="/admin/partners"
                  className="rounded-full border border-[#0D3B34]/10 bg-white px-4 py-2.5 text-xs font-semibold text-[#0D3B34]/65"
                >
                  إدارة الشركاء
                </Link>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1550px] px-5 py-8 md:px-8">
            <section className="mb-7">
              <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">DESTINATION ACTIVATION & MEASUREMENT</p>
              <h1 className="mt-2 text-3xl font-bold md:text-[46px]" style={{ fontFamily: "var(--font-el-messiri), serif" }}>
                مؤشرات الأداء السياحي والتحقق من الزيارات
              </h1>
              <p className="mt-4 max-w-4xl text-sm leading-8 text-[#0D3B34]/58">
                قياس رحلة الزائر من الاكتشاف القريب إلى الحجز ثم الزيارة الموثقة والمهمة والمكافأة، مع مقارنة الأداء حسب المدينة والشريك.
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </section>

            <section className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <div className="rounded-[30px] border border-white/80 bg-white/72 p-6 backdrop-blur-xl md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">CITY DISTRIBUTION</p>
                    <h2 className="mt-2 text-2xl font-bold" style={{ fontFamily: "var(--font-el-messiri), serif" }}>
                      توزيع النشاط حسب المدينة
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#EEF3F0] px-3 py-1.5 text-[10px] font-bold">6 مدن</span>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[720px] text-right">
                    <thead>
                      <tr className="border-b border-[#0D3B34]/8 text-[10px] text-[#0D3B34]/42">
                        <th className="pb-3 font-semibold">المدينة</th>
                        <th className="pb-3 font-semibold">فتح الاكتشاف</th>
                        <th className="pb-3 font-semibold">الحجوزات</th>
                        <th className="pb-3 font-semibold">الزيارات الموثقة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cities.map((row) => (
                        <tr key={row.city} className="border-b border-[#0D3B34]/6 last:border-0">
                          <td className="py-4 text-xs font-bold">{row.city}</td>
                          <td className="py-4 text-xs">{row.discoveries}</td>
                          <td className="py-4 text-xs">{row.bookings}</td>
                          <td className="py-4 text-xs font-bold text-[#267247]">{row.visits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[30px] bg-[#0D3B34] p-6 text-white md:p-7">
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#E6C24D]">ACTIVITY WINDOW</p>
                <h2 className="mt-2 text-2xl font-bold" style={{ fontFamily: "var(--font-el-messiri), serif" }}>
                  كثافة النشاط اليومي
                </h2>
                <p className="mt-2 text-xs leading-6 text-white/45">نموذج بصري لساعات النشاط الأعلى خلال يوم الـPilot.</p>

                <div className="mt-8 flex h-[250px] items-end gap-3">
                  {activity.map((item) => (
                    <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-2">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-[#D4AF37] to-[#F5E09B]"
                        style={{ height: `${item.value}%` }}
                      />
                      <span className="text-[9px] text-white/40">{item.label}:00</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-7 rounded-[30px] border border-white/80 bg-white/72 p-6 backdrop-blur-xl md:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">PARTNER PERFORMANCE</p>
                  <h2 className="mt-2 text-2xl font-bold" style={{ fontFamily: "var(--font-el-messiri), serif" }}>
                    أداء الشركاء
                  </h2>
                </div>
                <Link href="/admin/partners" className="text-xs font-bold text-[#0D3B34]/60">
                  إدارة الشركاء
                </Link>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[900px] text-right">
                  <thead>
                    <tr className="border-b border-[#0D3B34]/8 text-[10px] text-[#0D3B34]/42">
                      <th className="pb-3 font-semibold">الشريك</th>
                      <th className="pb-3 font-semibold">المدينة</th>
                      <th className="pb-3 font-semibold">الخدمات</th>
                      <th className="pb-3 font-semibold">الحجوزات</th>
                      <th className="pb-3 font-semibold">زيارات موثقة</th>
                      <th className="pb-3 font-semibold">التحويل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner) => (
                      <tr key={partner.name} className="border-b border-[#0D3B34]/6 last:border-0">
                        <td className="py-4 text-xs font-bold">{partner.name}</td>
                        <td className="py-4 text-xs text-[#0D3B34]/58">{partner.city}</td>
                        <td className="py-4 text-xs">{partner.services}</td>
                        <td className="py-4 text-xs">{partner.bookings}</td>
                        <td className="py-4 text-xs font-bold text-[#267247]">{partner.visits}</td>
                        <td className="py-4 text-xs font-bold text-[#B99124]">{partner.conversion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-7 grid gap-5 lg:grid-cols-3">
              <InsightCard title="ماذا نقيس؟" text="الاكتشاف القريب، الحجز، الزيارة الموثقة، إكمال المهمة، واستبدال المكافأة." />
              <InsightCard title="لماذا يهم؟" text="التمييز بين الزيارة الفعلية والتفاعل الرقمي فقط، وقياس أثر التنشيط السياحي." />
              <InsightCard title="الخطوة التالية" text="ربط بيانات الـPilot الحقيقية بعد اكتمال قاعدة البيانات والتكاملات الحكومية." />
            </section>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[560px] -translate-x-1/2 items-center justify-around rounded-[22px] border border-white/80 bg-[#F9F7F0]/94 px-2 py-2 backdrop-blur-xl xl:hidden">
        <MobileNav href="/admin/dashboard" label="المؤشرات" active />
        <MobileNav href="/admin/partners" label="الشركاء" />
        <MobileNav href="/partner/dashboard" label="الشريك" />
        <MobileNav href="/" label="المنصة" />
      </nav>
    </main>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className={`rounded-[26px] border p-5 ${
      metric.highlight
        ? "border-[#0D3B34] bg-[#0D3B34] text-white"
        : "border-white/80 bg-white/72"
    }`}>
      <p className={`text-xs ${metric.highlight ? "text-white/48" : "text-[#0D3B34]/45"}`}>{metric.label}</p>
      <p className={`mt-3 text-3xl font-bold ${metric.highlight ? "text-[#F1C94C]" : ""}`}>{metric.value}</p>
      <p className={`mt-2 text-[10px] leading-5 ${metric.highlight ? "text-white/38" : "text-[#0D3B34]/40"}`}>{metric.note}</p>
    </div>
  );
}

function InsightCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[26px] border border-white/80 bg-white/72 p-5">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-2 text-xs leading-6 text-[#0D3B34]/55">{text}</p>
    </div>
  );
}

function NavItem({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active ? "bg-[#0D3B34] text-white" : "text-[#0D3B34]/62 hover:bg-white/70"
      }`}
    >
      <span>{label}</span>
      <span className={active ? "text-[#D4AF37]" : "text-[#B99124]"}>←</span>
    </Link>
  );
}

function MobileNav({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-2 text-[10px] font-bold ${
        active ? "bg-[#0D3B34] text-white" : "text-[#0D3B34]/55"
      }`}
    >
      {label}
    </Link>
  );
}
