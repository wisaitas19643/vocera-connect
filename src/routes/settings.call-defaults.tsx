import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Mic, Bell, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { Switch } from "@/components/ui/switch";
import { SettingsTabs } from "./settings.index";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { TablesInsert } from "@/lib/database.types";

export const Route = createFileRoute("/settings/call-defaults")({
  head: () => ({ meta: [{ title: "ตั้งค่าการโทรเริ่มต้น — Ringo" }] }),
  component: CallDefaultsPage,
});

const VOICES = [
  { id: "6",  name: "ไซเรน",      role: "ผู้หญิง · วัยรุ่น",    emoji: "🌸", bg: "bg-pink-50",   active: "bg-pink-50 border-pink-500",   text: "text-pink-700" },
  { id: "4",  name: "แม็กซ์",     role: "ผู้ชาย · วัยผู้ใหญ่",  emoji: "🧑‍💼", bg: "bg-teal-50",   active: "bg-teal-50 border-teal-500",   text: "text-teal-700" },
  { id: "37", name: "ผู้ใหญ่ลี", role: "ผู้ชาย · สำเนียงสุพรรณ", emoji: "👴", bg: "bg-amber-50",  active: "bg-amber-50 border-amber-500", text: "text-amber-700" },
];

const TEMPLATES = [
  {
    id: "wedding",
    label: "💍 งานแต่งงาน",
    script: `สวัสดีค่ะ ดิฉันโทรมาจาก {Org_name}

ขอสอบถามเพื่อยืนยันการเข้าร่วมงานแต่งงาน ในวันที่ {Appointment Date} เวลา {Appointment Time} น.

ท่านสะดวกมาร่วมงานได้ไหมคะ?`,
  },
  {
    id: "meeting",
    label: "📋 ประชุม",
    script: `สวัสดีครับ ผมโทรมาจาก {Org_name}

ขอสอบถามเพื่อยืนยันการเข้าร่วมประชุม วันที่ {Appointment Date} เวลา {Appointment Time} น.

ท่านสะดวกเข้าร่วมได้ไหมครับ?`,
  },
  {
    id: "training",
    label: "🎓 อบรม/สัมมนา",
    script: `สวัสดีค่ะ ดิฉันโทรมาจาก {Org_name}

ขอสอบถามเพื่อยืนยันการเข้าร่วมอบรม วันที่ {Appointment Date} เวลา {Appointment Time} น.

ท่านสะดวกเข้าร่วมได้ไหมคะ?`,
  },
];

const SCRIPT_VARS = ["{Org_name}", "{Appointment Date}", "{Appointment Time}"];

interface DbTemplate { id: string; name: string; script: string; }

function CallDefaultsPage() {
  const [loading, setLoading] = useState(true);
  const [script, setScript] = useState(TEMPLATES[0].script);
  const [activeTemplate, setActiveTemplate] = useState("");
  const [dbTemplates, setDbTemplates] = useState<DbTemplate[]>([]);
  const [voice, setVoice] = useState("6");
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyLowPoints, setNotifyLowPoints] = useState(false);
  const [confirmResponse, setConfirmResponse] = useState("ขอบคุณค่ะ ยืนยันการเข้าร่วมเรียบร้อยแล้วค่ะ แล้วพบกันนะคะ");
  const [rejectResponse, setRejectResponse] = useState("ขอบคุณค่ะ รับทราบค่ะ หากเปลี่ยนใจสามารถติดต่อกลับได้เลยนะคะ");
  const [unclearResponse, setUnclearResponse] = useState("ขออภัยค่ะ ท่านสะดวกเข้าร่วมได้ไหมคะ?");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // โหลด user_settings
      const { data: settings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (settings) {
        if (settings.default_script) setScript(settings.default_script);
        if (settings.voice_id) setVoice(settings.voice_id);
        if (settings.notify_campaign_success !== null) setNotifySuccess(settings.notify_campaign_success ?? false);
        if (settings.notify_low_points !== null) setNotifyLowPoints(settings.notify_low_points ?? false);
        if (settings.confirm_response) setConfirmResponse(settings.confirm_response);
        if (settings.reject_response) setRejectResponse(settings.reject_response);
        if (settings.unclear_response) setUnclearResponse(settings.unclear_response);
      }

      // โหลด script_templates จาก DB
      let { data: templates } = await supabase
        .from("script_templates")
        .select("id, name, script")
        .eq("user_id", user.id)
        .order("created_at");

      // ถ้า DB ว่าง → seed 3 default templates ให้ user นี้
      if (!templates?.length) {
        await supabase.from("script_templates").insert(
          TEMPLATES.map((t) => ({
            user_id: user.id,
            name: t.label,
            script: t.script,
            voice_speed: 1.0,
          }))
        );
        const { data: seeded } = await supabase
          .from("script_templates")
          .select("id, name, script")
          .eq("user_id", user.id)
          .order("created_at");
        templates = seeded;
      }

      setDbTemplates(templates ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const handleTemplate = (t: DbTemplate) => {
    setActiveTemplate(t.id);
    setScript(t.script);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const settings: TablesInsert<"user_settings"> = {
      user_id: user.id,
      default_script: script,
      voice_id: voice,
      notify_campaign_success: notifySuccess,
      notify_low_points: notifyLowPoints,
      confirm_response: confirmResponse,
      reject_response: rejectResponse,
      unclear_response: unclearResponse,
    };

    const { error } = await supabase
      .from("user_settings")
      .upsert(settings, { onConflict: "user_id" });

    if (error) {
      toast.error("บันทึกไม่สำเร็จ: " + error.message);
      return;
    }
    toast.success("บันทึกการตั้งค่าสำเร็จ");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-5xl px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-brand-700">ตั้งค่า</h1>
          </div>
          <SettingsTabs />
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-gray-400">กำลังโหลด...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-700">ตั้งค่า</h1>
          <Button variant="primary" size="sm" onClick={handleSave}>
            บันทึก
          </Button>
        </div>

        <SettingsTabs />

        {/* Script card */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <FileText className="h-4 w-4" />
            </span>
            <h3 className="font-semibold text-gray-800">สคริปต์การโทร</h3>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-gray-500">เลือก Template</p>
            <div className="flex flex-wrap gap-2">
              {dbTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemplate(t)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    activeTemplate === t.id
                      ? "border-brand-700 bg-brand-50 text-brand-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-brand-300",
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={script}
            onChange={(e) => { setScript(e.target.value); setActiveTemplate(""); }}
            className="mt-4 min-h-40 w-full rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-gray-700 outline-none focus:border-brand-700"
            maxLength={2000}
            placeholder="พิมพ์สคริปต์ที่ AI จะพูดเมื่อโทรออก..."
            spellCheck={false}
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">ตัวแปร:</span>
              {SCRIPT_VARS.map((v) => (
                <span key={v} className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
                  {v}
                </span>
              ))}
            </div>
            <span className="shrink-0 text-xs text-gray-400">{script.length}/2000</span>
          </div>
        </div>

        {/* Response messages card */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <MessageCircle className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-semibold text-gray-800">ข้อความตอบกลับ</h3>
              <p className="text-xs text-gray-400">ข้อความที่ BOTNOI จะพูดหลังผู้รับสายกดปุ่ม</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-green-700">✅ เมื่อยืนยัน</label>
              <textarea
                value={confirmResponse}
                onChange={(e) => setConfirmResponse(e.target.value)}
                rows={3}
                spellCheck={false}
                className="resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-700 focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-red-600">❌ เมื่อปฏิเสธ</label>
              <textarea
                value={rejectResponse}
                onChange={(e) => setRejectResponse(e.target.value)}
                rows={3}
                spellCheck={false}
                className="resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-700 focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">❓ เมื่อไม่ชัดเจน</label>
              <textarea
                value={unclearResponse}
                onChange={(e) => setUnclearResponse(e.target.value)}
                rows={3}
                spellCheck={false}
                className="resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-700 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Voice + Notification */}
        <div className="grid grid-cols-2 gap-4">
          {/* Voice card */}
          <div className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Mic className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-gray-800">ตั้งค่าเสียง</h3>
            </div>

            <div className="mt-4">
              <span className="text-sm font-medium text-gray-700">เลือกเสียงพูด</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVoice(v.id)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-center transition-all",
                    voice === v.id
                      ? `${v.active} shadow-sm`
                      : "border-gray-100 bg-white hover:border-gray-200",
                  )}
                >
                  <div className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-full text-3xl", v.bg)}>
                    {v.emoji}
                  </div>
                  <div className={cn("mt-2 text-sm font-semibold", voice === v.id ? v.text : "text-gray-800")}>
                    {v.name}
                  </div>
                  <div className="text-xs text-gray-400">{v.role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notification card */}
          <div className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Bell className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-gray-800">การแจ้งเตือน</h3>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">แจ้งเตือนเมื่อแคมเปญสำเร็จ</span>
                <Switch
                  checked={notifySuccess}
                  onCheckedChange={setNotifySuccess}
                  className="data-[state=checked]:bg-brand-700"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">แจ้งเตือนเมื่อ Point ต่ำกว่า 100</span>
                <Switch
                  checked={notifyLowPoints}
                  onCheckedChange={setNotifyLowPoints}
                  className="data-[state=checked]:bg-brand-700"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
