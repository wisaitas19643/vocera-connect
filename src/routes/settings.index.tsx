import { useState, useEffect } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { User, Coins, Clock } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/useAuth";
import { usePoints } from "@/lib/PointsContext";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/settings/")({
  head: () => ({ meta: [{ title: "ตั้งค่า — Ringo" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { pointsBalance } = usePoints();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.user_metadata?.full_name ?? "");
    setEmail(user.email ?? "");
    // โหลด org_name จาก profiles table
    supabase
      .from("profiles")
      .select("org_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.org_name) setOrgName(data.org_name);
      });
  }, [user]);

  const avatarLetter = (user?.user_metadata?.full_name || user?.email || "?")
    .charAt(0)
    .toUpperCase();

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    // 1. อัพชื่อคนใน Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({ data: { full_name: name } });
    // 2. อัพ org_name ใน profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ org_name: orgName || null })
      .eq("id", user.id);
    setSaving(false);
    if (authError || profileError) {
      toast.error("บันทึกไม่สำเร็จ");
    } else {
      toast.success("บันทึกข้อมูลสำเร็จ");
      setEditing(false);
    }
  };

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
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-brand-700 bg-brand-100 text-2xl font-bold text-brand-700">
                {avatarLetter}
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
                  disabled
                  className={fieldInput(true)}
                />
                {editing && (
                  <p className="text-xs text-gray-400">การเปลี่ยนอีเมลต้องยืนยันผ่านอีเมลเดิม</p>
                )}
              </FormField>
              <FormField label="ชื่อองค์กร">
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  disabled={!editing}
                  placeholder="เช่น บริษัท ABC จำกัด"
                  className={fieldInput(!editing)}
                />
                {editing && (
                  <p className="text-xs text-gray-400">ใช้เป็นชื่อองค์กรในระบบโทรออก BOTNOI</p>
                )}
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
                disabled={!editing || saving}
                onClick={handleSave}
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
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
                <span className="text-2xl font-bold text-brand-700">
                  {pointsBalance !== null ? pointsBalance.toLocaleString() : "—"}
                </span>
              </div>
              <p className="mb-4 text-xs text-gray-400">หัก 1 point ต่อ 1 การโทร</p>
              <Button variant="secondary" className="w-full" disabled>
                ⊕ เติม point
              </Button>
              <p className="mt-2 text-center text-xs text-gray-400">ติดต่อทีมงานเพื่อเติม Point</p>
            </div>

            {/* Point history card */}
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100">
                  <Clock className="h-4 w-4 text-brand-700" />
                </span>
                <span className="font-semibold text-gray-800">ประวัติการใช้ Point</span>
              </div>
              <p className="py-6 text-center text-sm text-gray-400">ยังไม่มีประวัติการใช้ Point</p>
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
    { label: "ตั้งค่าการโทร", to: "/settings/call-defaults" },
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
