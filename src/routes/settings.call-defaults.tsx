import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
<<<<<<< HEAD
import { FileText, Mic, Bell, MessageCircle } from "lucide-react";
=======
import {
  FileText, Mic, Phone, Plus, Minus, ChevronDown,
  GitBranch, X, Loader2,
} from "lucide-react";
>>>>>>> TN-Boss
import { toast } from "sonner";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { Switch } from "@/components/ui/switch";
import { SettingsTabs } from "./settings.index";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { TablesInsert } from "@/lib/database.types";
import { ScriptFlowBuilder, DEFAULT_FLOW } from "@/components/vocera/ScriptFlowBuilder";
import { useFlowScripts, useCreateFlowScript } from "@/lib/flowStore";

export const Route = createFileRoute("/settings/call-defaults")({
  head: () => ({ meta: [{ title: "ตั้งค่าการโทร — Ringo" }] }),
  component: CallDefaultsPage,
});

const VOICES = [
  { id: "mali",    name: "มะลิ",   role: "ผู้หญิง · สดใส",  emoji: "🌸", bg: "bg-pink-50", active: "bg-pink-50 border-pink-500",  text: "text-pink-700" },
  { id: "samorn",  name: "สมร",    role: "ผู้หญิง · ทางการ", emoji: "👩‍💼", bg: "bg-blue-50", active: "bg-blue-50 border-blue-500",  text: "text-blue-700" },
  { id: "somchai", name: "สมชาย", role: "ผู้ชาย · สุขุม",  emoji: "🧑‍💼", bg: "bg-teal-50", active: "bg-teal-50 border-teal-500",  text: "text-teal-700" },
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
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
  const [script, setScript] = useState(TEMPLATES[0].script);
  const [activeTemplate, setActiveTemplate] = useState("");
  const [dbTemplates, setDbTemplates] = useState<DbTemplate[]>([]);
  const [voice, setVoice] = useState("mali");
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyLowPoints, setNotifyLowPoints] = useState(false);
  const [confirmResponse, setConfirmResponse] = useState("ขอบคุณค่ะ ยืนยันการเข้าร่วมเรียบร้อยแล้วค่ะ แล้วพบกันนะคะ");
  const [rejectResponse, setRejectResponse] = useState("ขอบคุณค่ะ รับทราบค่ะ หากเปลี่ยนใจสามารถติดต่อกลับได้เลยนะคะ");
  const [unclearResponse, setUnclearResponse] = useState("ขออภัยค่ะ ท่านสะดวกเข้าร่วมได้ไหมคะ?");
=======
  const [scriptMode, setScriptMode] = useState<"basic" | "flow">("basic");

  // Basic script state
  const [script, setScript] = useState(TEMPLATES[0].script);
  const [activeTemplate, setActiveTemplate] = useState("wedding");

  // Voice & API
  const [apiKey, setApiKey] = useState("");
  const [voice, setVoice] = useState("mali");
  const [speed, setSpeed] = useState(1);

  // Call settings
  const [retries, setRetries] = useState(0);
  const [interval, setIntervalValue] = useState(30);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyLowPoints, setNotifyLowPoints] = useState(false);

  // Keyword detection
  const [confirmKw, setConfirmKw] = useState(["ไป", "จะไป", "ได้เลย", "ยืนยัน"]);
  const [rejectKw, setRejectKw] = useState(["ไม่ไป", "ไม่ได้", "ติดธุระ", "ปฏิเสธ"]);
  const [unclearAction, setUnclearAction] = useState<"repeat" | "log">("repeat");
  const [confirmNewKw, setConfirmNewKw] = useState("");
  const [rejectNewKw, setRejectNewKw] = useState("");
  const [confirmResponse, setConfirmResponse] = useState("ขอบคุณค่ะ เราจะรอต้อนรับท่านในวันงานค่ะ");
  const [rejectResponse, setRejectResponse] = useState("ขอบคุณค่ะ หากเปลี่ยนใจสามารถติดต่อกลับได้เลยนะคะ");
  const [unclearResponse, setUnclearResponse] = useState("ขอบคุณค่ะ");
>>>>>>> TN-Boss

  // Flow scripts
  const { data: scripts = [], isLoading: flowLoading } = useFlowScripts();
  const create = useCreateFlowScript();

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

<<<<<<< HEAD
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
=======
  const handleCreateFlow = () => {
    create.mutate(
      { name: "สคริปต์ใหม่", content: JSON.stringify(DEFAULT_FLOW) },
      {
        onSuccess: () => toast.success("เพิ่มสคริปต์ใหม่แล้ว"),
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };
>>>>>>> TN-Boss

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-8 py-8">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-700">ตั้งค่า</h1>
          {scriptMode === "basic" && (
            <Button variant="primary" size="sm" onClick={handleSave}>
              บันทึก
            </Button>
          )}
        </div>

        <SettingsTabs />

        {/* ── Script card ── */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-card">
          {/* Card header with mode toggle */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                {scriptMode === "basic" ? <FileText className="h-4 w-4" /> : <GitBranch className="h-4 w-4" />}
              </span>
              <div>
                <h3 className="font-semibold text-gray-800">สคริปต์การโทร</h3>
                <p className="text-xs text-gray-400">
                  {scriptMode === "basic"
                    ? "บอตพูดตามสคริปต์ · AI ตรวจจับคำตอบด้วย keyword"
                    : "บอตพูดตาม Flow · รอผู้รับสายกด 1 หรือ 2"}
                </p>
              </div>
            </div>

<<<<<<< HEAD
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-gray-500">เลือก Template</p>
            <div className="flex flex-wrap gap-2">
              {dbTemplates.map((t) => (
=======
            {/* Segmented control */}
            <div className="flex rounded-full border border-gray-200 bg-gray-50 p-0.5 gap-0.5 shrink-0">
              {[
                { id: "basic", icon: FileText, label: "สคริปต์ด่วน" },
                { id: "flow",  icon: GitBranch, label: "Flow ขั้นสูง" },
              ].map(({ id, icon: Icon, label }) => (
>>>>>>> TN-Boss
                <button
                  key={id}
                  type="button"
                  onClick={() => setScriptMode(id as "basic" | "flow")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                    scriptMode === id
                      ? "bg-white shadow-sm text-brand-700 border border-gray-100"
                      : "text-gray-400 hover:text-gray-600",
                  )}
                >
<<<<<<< HEAD
                  {t.name}
=======
                  <Icon className="h-3.5 w-3.5" />
                  {label}
>>>>>>> TN-Boss
                </button>
              ))}
            </div>
          </div>

<<<<<<< HEAD
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
=======
          {/* ── Basic mode ── */}
          {scriptMode === "basic" && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-gray-500">เลือก Template</p>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t) => (
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
                    {t.label}
                  </button>
                ))}
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
          )}

          {/* ── Flow mode ── */}
          {scriptMode === "flow" && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">
                  รองรับตัวแปร: {"{ชื่อ}, {ชื่องาน}, {วันที่}, {เวลา}"}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCreateFlow}
                  disabled={create.isPending}
                  className="gap-1.5"
                >
                  {create.isPending
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Plus className="h-3.5 w-3.5" />}
                  เพิ่มสคริปต์
                </Button>
              </div>

              {flowLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
                </div>
              ) : scripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
                    <GitBranch className="h-8 w-8 text-brand-300" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-700">ยังไม่มีสคริปต์</p>
                    <p className="text-sm text-gray-400 mt-1">คลิก "เพิ่มสคริปต์" เพื่อสร้าง Flow แรก</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleCreateFlow} disabled={create.isPending}>
                    {create.isPending
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Plus className="h-3.5 w-3.5" />}
                    เพิ่มสคริปต์ใหม่
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {scripts.map((s) => (
                    <ScriptFlowBuilder key={s.id} script={s} />
                  ))}
                </div>
              )}
>>>>>>> TN-Boss
            </div>
          )}
        </div>

<<<<<<< HEAD
        {/* Voice + Notification */}
=======
        {/* ── Keyword detection card (basic mode only) ── */}
        {scriptMode === "basic" && (
          <div className="mb-4 rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <GitBranch className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-semibold text-gray-800">การรับรู้คำตอบ</h3>
                <p className="text-xs text-gray-400">กำหนด keyword ที่ AI ใช้ตัดสินว่าผู้รับสายตอบว่าอะไร</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <KwSection
                icon="✅"
                label="ยืนยัน"
                keywords={confirmKw}
                newKw={confirmNewKw}
                onNewKwChange={setConfirmNewKw}
                onAdd={() => addKw("confirm")}
                onRemove={(i) => removeKw("confirm", i)}
                chipClass="bg-green-100 text-green-700"
                inputBorderClass="border-green-200 focus-within:border-green-400"
                response={confirmResponse}
                onResponseChange={setConfirmResponse}
              />

              <KwSection
                icon="❌"
                label="ปฏิเสธ"
                keywords={rejectKw}
                newKw={rejectNewKw}
                onNewKwChange={setRejectNewKw}
                onAdd={() => addKw("reject")}
                onRemove={(i) => removeKw("reject", i)}
                chipClass="bg-red-100 text-red-700"
                inputBorderClass="border-red-200 focus-within:border-red-400"
                response={rejectResponse}
                onResponseChange={setRejectResponse}
              />

              <div>
                <div className="mb-3 flex items-center gap-1.5">
                  <span className="text-sm">❓</span>
                  <span className="text-sm font-semibold text-gray-700">ไม่เข้าใจ</span>
                </div>
                <p className="mb-3 text-xs text-gray-400">เมื่อไม่ตรงกับ keyword ใดเลย</p>
                <div className="flex flex-col gap-2">
                  {[
                    { value: "repeat", label: "🔁 พูดซ้ำอีกครั้ง" },
                    { value: "log", label: "📝 บันทึกเป็น ไม่ทราบ" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setUnclearAction(opt.value as "repeat" | "log")}
                      className={cn(
                        "rounded-xl border-2 p-3 text-left text-sm transition-all",
                        unclearAction === opt.value
                          ? "border-brand-700 bg-brand-50 font-semibold text-brand-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {unclearAction === "log" && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <p className="mb-1.5 text-xs text-gray-400">AI ตอบกลับ:</p>
                    <textarea
                      value={unclearResponse}
                      onChange={(e) => setUnclearResponse(e.target.value)}
                      rows={2}
                      spellCheck={false}
                      placeholder="ข้อความปิดท้ายก่อนวางสาย..."
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-700 focus:bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Voice + Call settings ── */}
>>>>>>> TN-Boss
        <div className="grid grid-cols-2 gap-4">
          {/* Voice card */}
          <div className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Mic className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-gray-800">ตั้งค่าเสียง</h3>
            </div>

<<<<<<< HEAD
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
=======
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-sm font-medium text-gray-700">BOTNOI API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="ใส่ API Key จาก Voice.botnoi.ai"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-300"
              />
              <p className="text-xs text-gray-400">ใช้สำหรับสังเคราะห์เสียง AI ทั้งสองโหมด</p>
            </div>

            {scriptMode === "basic" ? (
              <>
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">เลือกเสียงพูด</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
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

                <div className="mt-5">
                  <label className="text-sm font-medium text-gray-700">
                    ความเร็ว: {speed.toFixed(2)}×
                  </label>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.25}
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="mt-2 w-full accent-brand-700"
                  />
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
                ในโหมด Flow เสียงและความเร็วจะตั้งค่าแยกต่อสคริปต์ ผ่าน VoicePicker ในแต่ละ Flow
              </div>
            )}
>>>>>>> TN-Boss
          </div>

          {/* Notification card */}
          <div className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Bell className="h-4 w-4" />
              </span>
<<<<<<< HEAD
              <h3 className="font-semibold text-gray-800">การแจ้งเตือน</h3>
=======
              <h3 className="font-semibold text-gray-800">ตั้งค่าการโทร</h3>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                จำนวนครั้งโทรซ้ำสูงสุด{" "}
                <span className="font-normal text-gray-400">(กรณีที่ปลายสายไม่รับ)</span>
              </label>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRetries(Math.max(0, retries - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-brand-700 hover:text-brand-700"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-16 text-center text-sm font-semibold text-gray-800">
                  {retries} ครั้ง
                </span>
                <button
                  type="button"
                  onClick={() => setRetries(Math.min(10, retries + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-brand-700 hover:text-brand-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-gray-700">ช่วงห่างระหว่างโทรซ้ำ</label>
              <div className="relative mt-2">
                <select
                  value={interval}
                  onChange={(e) => setIntervalValue(parseInt(e.target.value))}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-9 text-sm outline-none focus:border-brand-700"
                >
                  {INTERVALS.map((m) => (
                    <option key={m} value={m}>{m} นาที</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
>>>>>>> TN-Boss
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
<<<<<<< HEAD
=======

interface KwSectionProps {
  icon: string;
  label: string;
  keywords: string[];
  newKw: string;
  onNewKwChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  chipClass: string;
  inputBorderClass: string;
  response: string;
  onResponseChange: (v: string) => void;
}

function KwSection({ icon, label, keywords, newKw, onNewKwChange, onAdd, onRemove, chipClass, inputBorderClass, response, onResponseChange }: KwSectionProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <span className="text-sm">{icon}</span>
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {keywords.map((kw, i) => (
          <span key={i} className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", chipClass)}>
            {kw}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="opacity-60 hover:opacity-100"
              aria-label={`ลบ ${kw}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className={cn("flex gap-2 rounded-xl border px-3 py-2 transition-colors", inputBorderClass)}>
        <input
          type="text"
          value={newKw}
          onChange={(e) => onNewKwChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder="เพิ่ม keyword..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={onAdd}
          className="flex h-6 w-6 items-center justify-center rounded-lg border border-brand-300 text-brand-700 hover:bg-brand-50"
          aria-label="เพิ่ม keyword"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-3 border-t border-gray-100 pt-3">
        <p className="mb-1.5 text-xs text-gray-400">AI ตอบกลับ:</p>
        <textarea
          value={response}
          onChange={(e) => onResponseChange(e.target.value)}
          rows={2}
          spellCheck={false}
          placeholder="ข้อความปิดท้ายก่อนวางสาย..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-700 focus:bg-white"
        />
      </div>
    </div>
  );
}
>>>>>>> TN-Boss
