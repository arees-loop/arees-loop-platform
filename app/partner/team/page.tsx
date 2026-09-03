"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type PermissionKey =
  | "bookings_view"
  | "bookings_manage"
  | "services_view"
  | "services_manage"
  | "settlements_view"
  | "invoices_view"
  | "reports_view"
  | "team_manage"
  | "business_view";

type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

type TeamUser = {
  id: number;
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  status: UserStatus;
  permissions: PermissionKey[];
  lastLogin: string;
  roleTemplate: string;
  avatarUrl: string;
};

const permissionLabels: Record<PermissionKey, string> = {
  bookings_view: "عرض الحجوزات",
  bookings_manage: "إدارة الحجوزات",
  services_view: "عرض الخدمات",
  services_manage: "إدارة الخدمات",
  settlements_view: "عرض التسويات",
  invoices_view: "عرض الفواتير",
  reports_view: "عرض التقارير",
  team_manage: "إدارة الموظفين والصلاحيات",
  business_view: "عرض بيانات المنشأة والتراخيص",
};

const roleTemplates: Record<
  string,
  {
    label: string;
    permissions: PermissionKey[];
  }
> = {
  admin: {
    label: "مدير الحساب",
    permissions: [
      "bookings_view",
      "bookings_manage",
      "services_view",
      "services_manage",
      "settlements_view",
      "invoices_view",
      "reports_view",
      "team_manage",
      "business_view",
    ],
  },

  operations: {
    label: "مسؤول التشغيل والحجوزات",
    permissions: [
      "bookings_view",
      "bookings_manage",
      "services_view",
      "services_manage",
    ],
  },

  finance: {
    label: "المسؤول المالي",
    permissions: [
      "settlements_view",
      "invoices_view",
      "reports_view",
    ],
  },

  viewer: {
    label: "عرض فقط",
    permissions: [
      "bookings_view",
      "services_view",
      "settlements_view",
      "invoices_view",
      "reports_view",
      "business_view",
    ],
  },
};

const statusConfig: Record<
  UserStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "نشط",
    className: "bg-[#E6F5EB] text-[#267247]",
  },

  INVITED: {
    label: "بانتظار التفعيل",
    className: "bg-[#FFF3D4] text-[#8C6813]",
  },

  SUSPENDED: {
    label: "موقوف",
    className: "bg-[#FFE9E7] text-[#A3443E]",
  },
};

const initialUsers: TeamUser[] = [
  {
    id: 1,
    name: "محمد أحمد",
    jobTitle: "مدير الحساب",
    email: "admin@example.sa",
    phone: "+966 55 123 4567",
    status: "ACTIVE",
    permissions: roleTemplates.admin.permissions,
    lastLogin: "03 سبتمبر 2026 - 11:48 ص",
    roleTemplate: "admin",
    avatarUrl: "",
  },

  {
    id: 2,
    name: "خالد عبدالله",
    jobTitle: "مسؤول الحجوزات والتشغيل",
    email: "operations@example.sa",
    phone: "+966 54 772 3110",
    status: "ACTIVE",
    permissions: roleTemplates.operations.permissions,
    lastLogin: "03 سبتمبر 2026 - 10:25 ص",
    roleTemplate: "operations",
    avatarUrl: "",
  },

  {
    id: 3,
    name: "سارة علي",
    jobTitle: "المسؤول المالي",
    email: "finance@example.sa",
    phone: "+966 53 887 2244",
    status: "INVITED",
    permissions: roleTemplates.finance.permissions,
    lastLogin: "لم يسجل الدخول بعد",
    roleTemplate: "finance",
    avatarUrl: "",
  },
];

export default function PartnerTeamPage() {
  const [users, setUsers] = useState<TeamUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);

  const [form, setForm] = useState({
    name: "",
    jobTitle: "",
    email: "",
    phone: "",
    roleTemplate: "",
    permissions: [] as PermissionKey[],
    avatarUrl: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    jobTitle: "",
    email: "",
    phone: "",
    roleTemplate: "",
    permissions: [] as PermissionKey[],
    avatarUrl: "",
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchable =
        `${user.name} ${user.jobTitle} ${user.email} ${user.phone}`.toLowerCase();

      return searchable.includes(search.toLowerCase());
    });
  }, [users, search]);

  const summary = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((user) => user.status === "ACTIVE").length,
      invited: users.filter((user) => user.status === "INVITED").length,
      suspended: users.filter((user) => user.status === "SUSPENDED").length,
    };
  }, [users]);

  const handleAvatarFile = (
    file: File | undefined,
    mode: "add" | "edit"
  ) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (mode === "add") {
      setForm((current) => ({
        ...current,
        avatarUrl: previewUrl,
      }));
    } else {
      setEditForm((current) => ({
        ...current,
        avatarUrl: previewUrl,
      }));
    }
  };

  const togglePermission = (permission: PermissionKey) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  };

  const toggleEditPermission = (permission: PermissionKey) => {
    setEditForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  };

  const applyRoleTemplate = (templateKey: string) => {
    const template = roleTemplates[templateKey];

    setForm((current) => ({
      ...current,
      roleTemplate: templateKey,
      jobTitle: template?.label || current.jobTitle,
      permissions: template ? [...template.permissions] : [],
    }));
  };

  const applyEditRoleTemplate = (templateKey: string) => {
    const template = roleTemplates[templateKey];

    setEditForm((current) => ({
      ...current,
      roleTemplate: templateKey,
      jobTitle: template?.label || current.jobTitle,
      permissions: template ? [...template.permissions] : [],
    }));
  };

  const inviteUser = () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      return;
    }

    const newUser: TeamUser = {
      id: Date.now(),
      name: form.name,
      jobTitle: form.jobTitle || "موظف",
      email: form.email,
      phone: form.phone,
      status: "INVITED",
      permissions: form.permissions,
      lastLogin: "لم يسجل الدخول بعد",
      roleTemplate: form.roleTemplate,
      avatarUrl: form.avatarUrl,
    };

    setUsers((current) => [newUser, ...current]);

    setForm({
      name: "",
      jobTitle: "",
      email: "",
      phone: "",
      roleTemplate: "",
      permissions: [],
      avatarUrl: "",
    });

    setShowAddForm(false);
  };

  const openUserManagement = (user: TeamUser) => {
    setSelectedUser(user);

    setEditForm({
      name: user.name,
      jobTitle: user.jobTitle,
      email: user.email,
      phone: user.phone,
      roleTemplate: user.roleTemplate,
      permissions: [...user.permissions],
      avatarUrl: user.avatarUrl,
    });
  };

  const saveUserChanges = () => {
    if (!selectedUser) return;

    setUsers((current) =>
      current.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              name: editForm.name,
              jobTitle: editForm.jobTitle,
              email: editForm.email,
              phone: editForm.phone,
              roleTemplate: editForm.roleTemplate,
              permissions: editForm.permissions,
              avatarUrl: editForm.avatarUrl,
            }
          : user
      )
    );

    setSelectedUser(null);
  };

  const suspendSelectedUser = () => {
    if (!selectedUser) return;

    const nextStatus =
      selectedUser.status === "SUSPENDED"
        ? "ACTIVE"
        : "SUSPENDED";

    setUsers((current) =>
      current.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              status: nextStatus,
            }
          : user
      )
    );

    setSelectedUser((current) =>
      current
        ? {
            ...current,
            status: nextStatus,
          }
        : null
    );
  };

  const activateInvitedUser = () => {
    if (!selectedUser) return;

    setUsers((current) =>
      current.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              status: "ACTIVE",
            }
          : user
      )
    );

    setSelectedUser((current) =>
      current
        ? {
            ...current,
            status: "ACTIVE",
          }
        : null
    );
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F7F4EA] text-[#0D3B34]"
      style={{
        fontFamily: "var(--font-ibm-plex-arabic), sans-serif",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#0D3B34]/6 blur-[120px]" />

        <div className="absolute -left-40 top-[42%] h-[450px] w-[450px] rounded-full bg-[#D4AF37]/9 blur-[125px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-[270px] shrink-0 border-l border-[#0D3B34]/8 bg-[#F9F7F0]/92 px-4 py-5 backdrop-blur-xl xl:block">
          <div className="mb-7 px-3">
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
              AREES LOOP PARTNER
            </p>

            <h2
              className="mt-2 text-xl font-bold"
              style={{
                fontFamily: "var(--font-el-messiri), serif",
              }}
            >
              لوحة الشريك
            </h2>
          </div>

          <nav className="space-y-2">
            <NavItem href="/partner/dashboard" label="الرئيسية" icon="⌂" />
            <NavItem href="/partner/bookings" label="الحجوزات" icon="▣" />
            <NavItem href="/partner/services" label="الخدمات" icon="◈" />
            <NavItem href="/partner/settlements" label="التسويات" icon="﷼" />
            <NavItem href="/partner/invoices" label="الفواتير" icon="▤" />
            <NavItem href="/partner/reports" label="التقارير" icon="◫" />

            <NavItem
              href="/partner/team"
              label="الموظفون والصلاحيات"
              icon="◎"
              active
            />

            <NavItem
              href="/partner/business"
              label="المنشأة والتراخيص"
              icon="◇"
            />

            <NavItem
              href="/partner/agreement"
              label="الاتفاقية والإعدادات"
              icon="✓"
            />
          </nav>

          <div className="mt-8 rounded-[24px] bg-[#0D3B34] p-5 text-white">
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#E6C24D]">
              ACCESS CONTROL
            </p>

            <p className="mt-2 text-sm font-bold">
              إدارة الصلاحيات
            </p>

            <p className="mt-2 text-xs leading-6 text-white/50">
              امنح كل موظف أقل صلاحيات يحتاجها لتنفيذ مهامه فقط.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-[#0D3B34]/8 bg-[#F9F7F0]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div>
                <p className="text-[10px] text-[#0D3B34]/45">
                  تجارب المدينة
                </p>

                <p className="mt-1 text-sm font-bold">
                  الموظفون والصلاحيات
                </p>
              </div>

              <Link
                href="/partner/dashboard"
                className="rounded-full border border-[#0D3B34]/10 bg-white px-4 py-2.5 text-xs font-semibold text-[#0D3B34]/65"
              >
                لوحة التحكم
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-[1550px] px-5 py-8 md:px-8">
            <section className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#B99124]">
                  TEAM & ACCESS CONTROL
                </p>

                <h1
                  className="mt-2 text-3xl font-bold md:text-[42px]"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  الموظفون والصلاحيات
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#0D3B34]/60">
                  أضف موظفي المنشأة وحدد مهام وصلاحيات كل مستخدم داخل حساب
                  الشريك.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="rounded-2xl bg-[#0D3B34] px-6 py-3.5 text-sm font-bold text-white"
              >
                + إضافة موظف
              </button>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="إجمالي المستخدمين"
                value={String(summary.total)}
              />

              <SummaryCard
                label="نشط"
                value={String(summary.active)}
                success
              />

              <SummaryCard
                label="بانتظار التفعيل"
                value={String(summary.invited)}
                highlight
              />

              <SummaryCard
                label="موقوف"
                value={String(summary.suspended)}
              />
            </section>

            <section className="mt-7 rounded-[28px] border border-white/80 bg-white/72 p-5 backdrop-blur-xl">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم، المسمى، البريد أو رقم الجوال..."
                className={inputClass}
              />
            </section>

            <section className="mt-6 overflow-hidden rounded-[30px] border border-white/80 bg-white/72 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[#0D3B34]/7 px-6 py-5">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                    TEAM MEMBERS
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    مستخدمو حساب المنشأة
                  </h2>
                </div>

                <span className="rounded-full bg-[#0D3B34]/6 px-3 py-1.5 text-xs font-bold">
                  {filteredUsers.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-right">
                  <thead>
                    <tr className="border-b border-[#0D3B34]/8 bg-[#FAF9F5] text-[10px] text-[#0D3B34]/45">
                      <th className="px-6 py-4 font-semibold">
                        المستخدم
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        المسمى
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        التواصل
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        الصلاحيات
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        آخر دخول
                      </th>

                      <th className="px-4 py-4 font-semibold">
                        الحالة
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        الإجراء
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => {
                      const status = statusConfig[user.status];

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-[#0D3B34]/6 last:border-0 hover:bg-[#FBFAF7]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                name={user.name}
                                avatarUrl={user.avatarUrl}
                                size="small"
                              />

                              <p className="text-xs font-bold">
                                {user.name}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-5 text-xs font-semibold">
                            {user.jobTitle}
                          </td>

                          <td className="px-4 py-5">
                            <p
                              className="text-xs font-semibold"
                              dir="ltr"
                            >
                              {user.email}
                            </p>

                            <p
                              className="mt-1 text-[10px] text-[#0D3B34]/45"
                              dir="ltr"
                            >
                              {user.phone}
                            </p>
                          </td>

                          <td className="px-4 py-5">
                            <div className="flex flex-wrap gap-1.5">
                              {user.permissions
                                .slice(0, 3)
                                .map((permission) => (
                                  <span
                                    key={permission}
                                    className="rounded-full bg-[#EEF3F0] px-2.5 py-1 text-[9px] font-semibold text-[#0D3B34]/65"
                                  >
                                    {permissionLabels[permission]}
                                  </span>
                                ))}

                              {user.permissions.length > 3 && (
                                <span className="rounded-full bg-[#FFF3D4] px-2.5 py-1 text-[9px] font-bold text-[#8C6813]">
                                  +{user.permissions.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-5 text-xs text-[#0D3B34]/55">
                            {user.lastLogin}
                          </td>

                          <td className="px-4 py-5">
                            <span
                              className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <button
                              type="button"
                              onClick={() =>
                                openUserManagement(user)
                              }
                              className="rounded-xl border border-[#0D3B34]/10 bg-white px-3 py-2 text-[10px] font-bold text-[#0D3B34]/65"
                            >
                              إدارة المستخدم
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-7 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
              <div className="rounded-[28px] bg-[#0D3B34] p-6 text-white">
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#E6C24D]">
                  SECURITY PRINCIPLE
                </p>

                <h2
                  className="mt-2 text-xl font-bold"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  أقل صلاحية لازمة
                </h2>

                <p className="mt-3 text-sm leading-7 text-white/55">
                  الموظف المالي لا يحتاج تعديل الخدمات، ومسؤول الحجوزات لا
                  يحتاج الوصول إلى إدارة الموظفين أو الحسابات الحساسة.
                </p>

                <div className="mt-6 space-y-3">
                  <SecurityPoint text="الصلاحيات حسب الدور الوظيفي." />
                  <SecurityPoint text="مدير الحساب فقط يدير الموظفين." />
                  <SecurityPoint text="لاحقًا MFA للحسابات الحساسة." />
                  <SecurityPoint text="كل تغيير صلاحيات يسجل في Audit Log." />
                </div>
              </div>

              <div className="rounded-[28px] border border-white/80 bg-white/72 p-6 backdrop-blur-xl">
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
                  ROLE TEMPLATES
                </p>

                <h2
                  className="mt-2 text-xl font-bold"
                  style={{
                    fontFamily: "var(--font-el-messiri), serif",
                  }}
                >
                  أدوار جاهزة
                </h2>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {Object.entries(roleTemplates).map(
                    ([key, role]) => (
                      <div
                        key={key}
                        className="rounded-[20px] border border-[#0D3B34]/7 bg-[#FAF9F5] p-4"
                      >
                        <p className="text-sm font-bold">
                          {role.label}
                        </p>

                        <p className="mt-2 text-xs text-[#0D3B34]/50">
                          {role.permissions.length} صلاحيات
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ADD USER */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-[#071E1A]/45 backdrop-blur-sm">
          <div className="absolute inset-y-0 left-0 w-full max-w-[720px] overflow-y-auto bg-[#F8F5ED]">
            <DrawerHeader
              eyebrow="NEW TEAM MEMBER"
              title="إضافة موظف"
              onClose={() => setShowAddForm(false)}
            />

            <div className="space-y-6 p-6">
              <FormSection
                title="صورة الموظف"
                eyebrow="PROFILE PHOTO"
              >
                <AvatarUploader
                  name={form.name || "موظف"}
                  avatarUrl={form.avatarUrl}
                  onFile={(file) =>
                    handleAvatarFile(file, "add")
                  }
                  onRemove={() =>
                    setForm((current) => ({
                      ...current,
                      avatarUrl: "",
                    }))
                  }
                />
              </FormSection>

              <FormSection
                title="بيانات الموظف"
                eyebrow="USER INFORMATION"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="اسم الموظف">
                    <input
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="المسمى الوظيفي">
                    <input
                      value={form.jobTitle}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          jobTitle: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="البريد الإلكتروني">
                    <input
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className={inputClass}
                      dir="ltr"
                    />
                  </Field>

                  <Field label="رقم الجوال">
                    <input
                      value={form.phone}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      className={inputClass}
                      dir="ltr"
                    />
                  </Field>
                </div>
              </FormSection>

              <RoleSelection
                selectedRole={form.roleTemplate}
                onSelect={applyRoleTemplate}
              />

              <PermissionsGrid
                selected={form.permissions}
                onToggle={togglePermission}
              />

              <button
                type="button"
                onClick={inviteUser}
                className="w-full rounded-2xl bg-[#0D3B34] px-6 py-4 text-sm font-bold text-white"
              >
                إرسال دعوة الموظف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE USER */}
      {selectedUser && (
        <div className="fixed inset-0 z-[110] bg-[#071E1A]/45 backdrop-blur-sm">
          <div className="absolute inset-y-0 left-0 w-full max-w-[760px] overflow-y-auto bg-[#F8F5ED]">
            <DrawerHeader
              eyebrow="USER MANAGEMENT"
              title="إدارة المستخدم"
              onClose={() => setSelectedUser(null)}
            />

            <div className="space-y-6 p-6">
              <div className="rounded-[26px] bg-[#0D3B34] p-6 text-white">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    name={editForm.name}
                    avatarUrl={editForm.avatarUrl}
                    size="large"
                  />

                  <div>
                    <p className="text-lg font-bold">
                      {editForm.name}
                    </p>

                    <p className="mt-1 text-xs text-white/50">
                      {editForm.jobTitle}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DarkInfo
                    label="الحالة"
                    value={
                      statusConfig[selectedUser.status].label
                    }
                  />

                  <DarkInfo
                    label="آخر دخول"
                    value={selectedUser.lastLogin}
                  />
                </div>
              </div>

              <FormSection
                title="صورة الموظف"
                eyebrow="PROFILE PHOTO"
              >
                <AvatarUploader
                  name={editForm.name}
                  avatarUrl={editForm.avatarUrl}
                  onFile={(file) =>
                    handleAvatarFile(file, "edit")
                  }
                  onRemove={() =>
                    setEditForm((current) => ({
                      ...current,
                      avatarUrl: "",
                    }))
                  }
                />
              </FormSection>

              <FormSection
                title="بيانات المستخدم"
                eyebrow="USER INFORMATION"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="الاسم">
                    <input
                      value={editForm.name}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="المسمى الوظيفي">
                    <input
                      value={editForm.jobTitle}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          jobTitle: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="البريد الإلكتروني">
                    <input
                      value={editForm.email}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className={inputClass}
                      dir="ltr"
                    />
                  </Field>

                  <Field label="رقم الجوال">
                    <input
                      value={editForm.phone}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      className={inputClass}
                      dir="ltr"
                    />
                  </Field>
                </div>
              </FormSection>

              <RoleSelection
                selectedRole={editForm.roleTemplate}
                onSelect={applyEditRoleTemplate}
              />

              <PermissionsGrid
                selected={editForm.permissions}
                onToggle={toggleEditPermission}
              />

              <div className="rounded-[24px] border border-[#0D3B34]/8 bg-white p-5">
                <p className="text-sm font-bold">
                  إجراءات الحساب
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {selectedUser.status === "INVITED" && (
                    <>
                      <button
                        type="button"
                        className="rounded-2xl border border-[#D4AF37]/30 bg-[#FFF8E4] px-4 py-3 text-xs font-bold text-[#8C6813]"
                      >
                        إعادة إرسال الدعوة
                      </button>

                      <button
                        type="button"
                        onClick={activateInvitedUser}
                        className="rounded-2xl bg-[#267247] px-4 py-3 text-xs font-bold text-white"
                      >
                        تفعيل تجريبي
                      </button>
                    </>
                  )}

                  {selectedUser.status !== "INVITED" && (
                    <button
                      type="button"
                      onClick={suspendSelectedUser}
                      className={`rounded-2xl px-4 py-3 text-xs font-bold ${
                        selectedUser.status === "SUSPENDED"
                          ? "bg-[#267247] text-white"
                          : "bg-[#FFE9E7] text-[#A3443E]"
                      }`}
                    >
                      {selectedUser.status === "SUSPENDED"
                        ? "إعادة تفعيل المستخدم"
                        : "إيقاف المستخدم"}
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-[22px] border border-[#D4AF37]/20 bg-[#FFF9E8] p-5">
                <p className="text-sm font-bold">
                  سجل التغييرات
                </p>

                <p className="mt-2 text-xs leading-6 text-[#0D3B34]/58">
                  لاحقًا يتم تسجيل تعديل الصورة أو الصلاحيات أو الحالة أو
                  بيانات المستخدم داخل Audit Log باسم المستخدم الذي نفذ
                  التغيير والتاريخ والوقت.
                </p>
              </div>

              <button
                type="button"
                onClick={saveUserChanges}
                className="w-full rounded-2xl bg-[#0D3B34] px-6 py-4 text-sm font-bold text-white"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-24px)] max-w-[560px] -translate-x-1/2 items-center justify-around rounded-[22px] border border-white/80 bg-[#F9F7F0]/94 px-2 py-2 backdrop-blur-xl xl:hidden">
        <MobileNav href="/partner/dashboard" label="الرئيسية" />
        <MobileNav href="/partner/bookings" label="الحجوزات" />
        <MobileNav href="/partner/services" label="الخدمات" />
        <MobileNav href="/partner/reports" label="التقارير" />
        <MobileNav href="/partner/team" label="الفريق" active />
      </nav>
    </main>
  );
}

const inputClass =
  "h-14 w-full rounded-2xl border border-[#0D3B34]/10 bg-[#FAF9F5] px-4 text-sm text-[#0D3B34] outline-none transition placeholder:text-[#0D3B34]/30 focus:border-[#D4AF37]/60 focus:bg-white";

function UserAvatar({
  name,
  avatarUrl,
  size = "small",
}: {
  name: string;
  avatarUrl: string;
  size?: "small" | "large";
}) {
  const sizeClass =
    size === "large"
      ? "h-16 w-16 text-lg"
      : "h-10 w-10 text-xs";

  if (avatarUrl) {
    return (
      <div
        className={`${sizeClass} shrink-0 overflow-hidden rounded-full border border-white/20 bg-[#0D3B34]`}
      >
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#0D3B34] font-bold text-[#D4AF37]`}
    >
      {name?.trim()?.slice(0, 1) || "م"}
    </div>
  );
}

function AvatarUploader({
  name,
  avatarUrl,
  onFile,
  onRemove,
}: {
  name: string;
  avatarUrl: string;
  onFile: (file: File | undefined) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[22px] border border-[#0D3B34]/8 bg-[#FAF9F5] p-5 sm:flex-row sm:items-center">
      <UserAvatar
        name={name}
        avatarUrl={avatarUrl}
        size="large"
      />

      <div className="flex-1">
        <p className="text-sm font-bold">
          صورة الملف الشخصي
        </p>

        <p className="mt-1 text-xs leading-6 text-[#0D3B34]/50">
          اختيارية. يفضل استخدام صورة واضحة مربعة بصيغة JPG أو PNG أو
          WebP.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-2xl bg-[#0D3B34] px-4 py-2.5 text-xs font-bold text-white">
            {avatarUrl ? "تغيير الصورة" : "رفع صورة"}

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(event) =>
                onFile(event.target.files?.[0])
              }
            />
          </label>

          {avatarUrl && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-2xl border border-[#A3443E]/15 bg-[#FFE9E7] px-4 py-2.5 text-xs font-bold text-[#A3443E]"
            >
              حذف الصورة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DrawerHeader({
  eyebrow,
  title,
  onClose,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#0D3B34]/8 bg-[#F8F5ED]/95 px-6 py-5 backdrop-blur-xl">
      <div>
        <p className="text-[10px] font-bold tracking-[0.17em] text-[#B99124]">
          {eyebrow}
        </p>

        <h2
          className="mt-1 text-2xl font-bold"
          style={{
            fontFamily: "var(--font-el-messiri), serif",
          }}
        >
          {title}
        </h2>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0D3B34]/10 bg-white text-lg"
      >
        ×
      </button>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
  active = false,
}: {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-[#0D3B34] text-white"
          : "text-[#0D3B34]/62 hover:bg-white/70"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
          active
            ? "bg-white/10 text-[#D4AF37]"
            : "bg-[#0D3B34]/6"
        }`}
      >
        {icon}
      </span>

      {label}
    </Link>
  );
}

function SummaryCard({
  label,
  value,
  success = false,
  highlight = false,
}: {
  label: string;
  value: string;
  success?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[26px] border p-5 ${
        success
          ? "border-[#267247]/15 bg-[#EAF5EE]"
          : highlight
          ? "border-[#D4AF37]/25 bg-[#FFF8E4]"
          : "border-white/80 bg-white/72"
      }`}
    >
      <p className="text-xs text-[#0D3B34]/45">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${
          success
            ? "text-[#267247]"
            : highlight
            ? "text-[#A67B11]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-[#0D3B34]/65">
        {label}
      </span>

      {children}
    </label>
  );
}

function FormSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-white/80 bg-white/70 p-5 backdrop-blur-xl">
      <p className="text-[10px] font-bold tracking-[0.16em] text-[#B99124]">
        {eyebrow}
      </p>

      <h3
        className="mt-1 text-xl font-bold"
        style={{
          fontFamily: "var(--font-el-messiri), serif",
        }}
      >
        {title}
      </h3>

      <div className="mt-5 space-y-4">
        {children}
      </div>
    </section>
  );
}

function RoleSelection({
  selectedRole,
  onSelect,
}: {
  selectedRole: string;
  onSelect: (key: string) => void;
}) {
  return (
    <FormSection
      title="الدور الوظيفي"
      eyebrow="ROLE TEMPLATE"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(roleTemplates).map(([key, role]) => {
          const active = selectedRole === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`rounded-[20px] border p-4 text-right transition ${
                active
                  ? "border-[#D4AF37] bg-[#0D3B34] text-white"
                  : "border-[#0D3B34]/8 bg-[#FAF9F5]"
              }`}
            >
              <p className="text-sm font-bold">
                {role.label}
              </p>

              <p
                className={`mt-2 text-[10px] ${
                  active
                    ? "text-white/50"
                    : "text-[#0D3B34]/45"
                }`}
              >
                {role.permissions.length} صلاحيات
              </p>
            </button>
          );
        })}
      </div>
    </FormSection>
  );
}

function PermissionsGrid({
  selected,
  onToggle,
}: {
  selected: PermissionKey[];
  onToggle: (permission: PermissionKey) => void;
}) {
  return (
    <FormSection
      title="الصلاحيات التفصيلية"
      eyebrow="PERMISSIONS"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {(
          Object.entries(permissionLabels) as [
            PermissionKey,
            string
          ][]
        ).map(([key, label]) => {
          const active = selected.includes(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key)}
              className={`flex items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-right ${
                active
                  ? "border-[#0D3B34] bg-[#EEF3F0]"
                  : "border-[#0D3B34]/8 bg-white"
              }`}
            >
              <span className="text-xs font-semibold">
                {label}
              </span>

              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] ${
                  active
                    ? "bg-[#0D3B34] text-white"
                    : "bg-[#0D3B34]/7 text-transparent"
                }`}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>
    </FormSection>
  );
}

function DarkInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/7 p-4">
      <p className="text-[10px] text-white/40">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-white/80">
        {value}
      </p>
    </div>
  );
}

function SecurityPoint({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-start gap-2 text-xs text-white/65">
      <span className="mt-0.5 text-[#E6C24D]">
        ✓
      </span>

      <span>{text}</span>
    </div>
  );
}

function MobileNav({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-2 text-[10px] font-bold ${
        active
          ? "bg-[#0D3B34] text-white"
          : "text-[#0D3B34]/55"
      }`}
    >
      {label}
    </Link>
  );
}