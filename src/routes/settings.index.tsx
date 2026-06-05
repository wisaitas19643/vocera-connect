import { useState } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { User, Coins, Clock, Camera } from "lucide-react";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/")({
  head: () => ({ meta: [{ title: "ตั้งค่า — Vocera" }] }),
  component: SettingsPage,
});

const HISTORY = [
  { name: "แคมเปญประชุมผู้ถือหุ้นประจำปี 2026", date: "12/04/2026", amount: -300 },
  { name: "แคมเปญอบรมพนักงานใหม่รุ่นที่ 12", date: "12/04/2026", amount: -125 },
  { name: "เติม Point", date: "09/04/2026", amount: 1000 },
];

function SettingsPage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("เมษา งามดี");
  const [email, setEmail] = useState("Maysa.Ngamdee@gmail.com");
  const [username, setUsername] = useState("เมษา งามดี");
  const [password, setPassword] = useState("**********");

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-8 py-8">
        <h1 className="mb-6 text-2xl font-bold text-brand-700">ตั้งค่า</h1>

        <SettingsTabs />

        <div className="grid grid-cols-5 gap-6">
          {/* Left: Account card */}
          <div className="col-span-3 rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-6 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
                <User className="h-4 w-4 text-brand-700" />
              </span>
              <span className="font-semibold text-gray-800">บัญชี</span>
            </div>

            {/* Avatar */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-brand-700 bg-brand-100 text-2xl font-bold text-brand-700">
                  ม
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-card"
                  aria-label="เปลี่ยนรูปโปรไฟล์"
                >
                  <Camera className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-4">
              <FormField label="ชื่อ-นามสกุล">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editing}
                  className={fieldInput(!editing)}
                />
              </FormField>
              <FormField label="อีเมล">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editing}
                  className={fieldInput(!editing)}
                />
              </FormField>
              <FormField label="Username">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!editing}
                  className={fieldInput(!editing)}
                />
              </FormField>
              <FormField label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!editing}
                  className={fieldInput(!editing)}
                />
              </FormField>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                disabled={editing}
                onClick={() => setEditing(true)}
              >
                แก้ไข
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                disabled={!editing}
                onClick={() => setEditing(false)}
              >
                บันทึก
              </Button>
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-2 flex flex-col gap-4">
            {/* Point card */}
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
                  <Coins className="h-4 w-4 text-brand-700" />
                </span>
                <span className="font-semibold text-gray-800">Point</span>
              </div>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm text-gray-600">Point คงเหลือ</span>
                <span className="text-2xl font-bold text-brand-700">3,000</span>
              </div>
              <p className="mb-4 text-xs text-gray-400">หัก 1 point ต่อ 1 การโทร</p>
              <Button variant="secondary" className="w-full">
                ⊕ เติม point
              </Button>
            </div>

            {/* Point history card */}
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
                    <Clock className="h-4 w-4 text-brand-700" />
                  </span>
                  <span className="font-semibold text-gray-800">ประวัติการใช้ Point</span>
                </div>
                <button type="button" className="text-sm text-brand-700 hover:underline">
                  ดูทั้งหมด
                </button>
              </div>

              <div className="flex flex-col">
                {HISTORY.map((item, i) => (
                  <div key={i}>
                    {i > 0 && <div className="my-3 border-t border-gray-100" />}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm text-gray-700">{item.name}</div>
                        <div className="mt-0.5 text-xs text-gray-400">{item.date}</div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-semibold",
                          item.amount > 0 ? "text-green-500" : "text-red-500",
                        )}
                      >
                        {item.amount > 0
                          ? `+${item.amount.toLocaleString()}`
                          : item.amount.toLocaleString()}{" "}
                        point
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function fieldInput(disabled: boolean) {
  return cn(
    "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors",
    disabled
      ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
      : "border-gray-200 bg-white text-gray-800 focus:border-brand-700 focus:ring-1 focus:ring-brand-300",
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

export function SettingsTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { label: "ตั้งค่าบัญชี", to: "/settings" },
    { label: "ตั้งค่าการโทรเริ่มต้น", to: "/settings/call-defaults" },
  ] as const;

  return (
    <div className="mb-6 flex gap-6 border-b border-gray-200">
      {tabs.map((tab) => {
        const active =
          tab.to === "/settings"
            ? pathname === "/settings" || pathname === "/settings/"
            : pathname.startsWith(tab.to);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "pb-3 text-sm transition-colors",
              active
                ? "border-b-2 border-brand-700 font-semibold text-brand-700"
                : "text-gray-400 hover:text-gray-600",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
