import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Mic, Phone, Plus, Minus, ChevronDown, GitBranch, X } from "lucide-react";
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
  { id: "mali",    name: "มะลิ",   role: "ผู้หญิง · สดใส",  emoji: "🌸", bg: "bg-pink-50",  active: "bg-pink-50 border-pink-500",  text: "text-pink-700"  },
  { id: "samorn",  name: "สมร",    role: "ผู้หญิง · ทางการ", emoji: "👩‍💼", bg: "bg-blue-50",  active: "bg-blue-50 border-blue-500",  text: "text-blue-700"  },
  { id: "somchai", name: "สมชาย", role: "ผู้ชาย · สุขุม",  emoji: "🧑‍💼", bg: "bg-teal-50",  active: "bg-teal-50 border-teal-500",  text: "text-teal-700"  },
];

const TEMPLATES = [
  {
    id: "wedding",
    label: "💍 งานแต่งงาน",
    script: `สวัสดีค่ะ คุณ {ชื่อ} ดิฉันโทรมาจาก {ชื่องาน}

ขอสอบถามว่าท่านสะดวกเข้าร่วมงานแต่งงานในวันที่ {วันที่} เวลา {เวลา} ได้ไหมคะ?`,
  },
  {
    id: "meeting",
    label: "📋 ประชุม",
    script: `สวัสดีครับ คุณ {ชื่อ} ผมโทรมาจาก {ชื่องาน}

ท่านได้รับเชิญเข้าร่วมประชุมในวันที่ {วันที่} เวลา {เวลา} ครับ

ท่านสะดวกเข้าร่วมได้ไหมครับ?`,
  },
  {
    id: "training",
    label: "🎓 อบรม/สัมมนา",
    script: `สวัสดีค่ะ คุณ {ชื่อ} ดิฉันโทรมาจาก {ชื่องาน}

ท่านได้ลงทะเบียน {ชื่ออีเวนต์} ในวันที่ {วันที่} เวลา {เวลา} ค่ะ

ท่านสะดวกเข้าร่วมได้ไหมคะ?`,
  },
];

const SCRIPT_VARS = ["{ชื่อ}", "{ชื่องาน}", "{ชื่ออีเวนต์}", "{วันที่}", "{เวลา}"];
const INTERVALS = [10, 20, 30, 60];

function CallDefaultsPage() {
  const [script, setScript] = useState(TEMPLATES[0].script);
  const [activeTemplate, setActiveTemplate] = useState("wedding");
  const [apiKey, setApiKey] = useState("");
  const [voice, setVoice] = useState("mali");
  const [speed, setSpeed] = useState(1);
  const [retries, setRetries] = useState(0);
  const [interval, setIntervalValue] = useState(30);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyLowPoints, setNotifyLowPoints] = useState(false);

  const [confirmKw, setConfirmKw] = useState(["ไป", "จะไป", "ได้เลย", "ยืนยัน"]);
  const [rejectKw, setRejectKw] = useState(["ไม่ไป", "ไม่ได้", "ติดธุระ", "ปฏิเสธ"]);
  const [unclearAction, setUnclearAction] = useState<"repeat" | "log">("repeat");
  const [confirmNewKw, setConfirmNewKw] = useState("");
  const [rejectNewKw, setRejectNewKw] = useState("");
  const [confirmResponse, setConfirmResponse] = useState("ขอบคุณค่ะ เราจะรอต้อนรับท่านในวันงานค่ะ");
  const [rejectResponse, setRejectResponse] = useState("ขอบคุณค่ะ หากเปลี่ยนใจสามารถติดต่อกลับได้เลยนะคะ");
  const [unclearResponse, setUnclearResponse] = useState("ขอบคุณค่ะ");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (!data) return;
          if (data.default_script) { setScript(data.default_script); setActiveTemplate(""); }
          if (data.api_key) setApiKey(data.api_key);
          if (data.voice_id) setVoice(data.voice_id);
          setSpeed(data.voice_speed);
          setRetries(data.max_retries);
          setIntervalValue(data.retry_interval_minutes);
          if (data.notify_campaign_success !== null) setNotifySuccess(data.notify_campaign_success ?? false);
          if (data.notify_low_points !== null) setNotifyLowPoints(data.notify_low_points ?? false);
          if (data.confirm_keywords?.length) setConfirmKw(data.confirm_keywords);
          if (data.reject_keywords?.length) setRejectKw(data.reject_keywords);
          if (data.confirm_response) setConfirmResponse(data.confirm_response);
          if (data.reject_response) setRejectResponse(data.reject_response);
          if (data.unclear_action) setUnclearAction(data.unclear_action as "repeat" | "log");
          if (data.unclear_response) setUnclearResponse(data.unclear_response);
        });
    });
  }, []);

  const handleTemplate = (t: typeof TEMPLATES[number]) => {
    setActiveTemplate(t.id);
    setScript(t.script);
  };

  const addKw = (target: "confirm" | "reject") => {
    const kw = (target === "confirm" ? confirmNewKw : rejectNewKw).trim();
    if (!kw) return;
    if (target === "confirm") {
      setConfirmKw((p) => [...p, kw]);
      setConfirmNewKw("");
    } else {
      setRejectKw((p) => [...p, kw]);
      setRejectNewKw("");
    }
  };

  const removeKw = (target: "confirm" | "reject", i: number) => {
    if (target === "confirm") setConfirmKw((p) => p.filter((_, j) => j !== i));
    else setRejectKw((p) => p.filter((_, j) => j !== i));
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const settings: TablesInsert<"user_settings"> = {
      user_id: user.id,
      default_script: script,
      api_key: apiKey || null,
      voice_id: voice,
      voice_speed: speed,
      max_retries: retries,
      retry_interval_minutes: interval,
      notify_campaign_success: notifySuccess,
      notify_low_points: notifyLowPoints,
      confirm_keywords: confirmKw,
      reject_keywords: rejectKw,
      confirm_response: confirmResponse,
      reject_response: rejectResponse,
      unclear_action: unclearAction,
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
                <span
                  key={v}
                  className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700"
                >
                  {v}
                </span>
              ))}
            </div>
            <span className="shrink-0 text-xs text-gray-400">{script.length}/2000</span>
          </div>
        </div>

        {/* Call Flow card */}
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <GitBranch className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-semibold text-gray-800">Call Flow</h3>
              <p className="text-xs text-gray-400">กำหนดคำสำคัญที่ระบบใช้ตัดสินว่าผู้รับสายตอบว่าอะไร</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-6">
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

        {/* Voice + Call settings */}
        <div className="grid grid-cols-2 gap-4">
          {/* Voice card */}
          <div className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Mic className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-gray-800">ตั้งค่าเสียง</h3>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">BOTNOI API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="ใส่ API Key จาก Voice.botnoi.ai"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-300"
              />
            </div>

            <div className="mt-5">
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
                      : `border-gray-100 bg-white hover:border-gray-200`,
                  )}
                >
                  <div
                    className={cn(
                      "mx-auto flex h-14 w-14 items-center justify-center rounded-full text-3xl",
                      v.bg,
                    )}
                  >
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
          </div>

          {/* Call settings card */}
          <div className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Phone className="h-4 w-4" />
              </span>
              <h3 className="font-semibold text-gray-800">ตั้งค่าการโทร</h3>
            </div>

            <div className="mt-4">
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
                    <option key={m} value={m}>
                      {m} นาที
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
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
          <span
            key={i}
            className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", chipClass)}
          >
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
