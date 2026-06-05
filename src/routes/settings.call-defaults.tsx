import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Mic, Phone, Plus, Minus, ChevronDown } from "lucide-react";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { Switch } from "@/components/ui/switch";
import { SettingsTabs } from "./settings.index";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/call-defaults")({
  head: () => ({ meta: [{ title: "ตั้งค่าการโทรเริ่มต้น — Vocera" }] }),
  component: CallDefaultsPage,
});

const DEFAULT_SCRIPT = `สวัสดีค่ะ คุณ {ชื่อ} ดิฉันโทรมาจาก {ชื่องาน}

ต้องการสอบถามเพื่อยืนยันการเข้าร่วมงานในวันที่ {วันที่} เวลา {เวลา}

กรุณากด 1 เพื่อยืนยัน หรือกด 2 หากไม่สะดวก ขอบคุณค่ะ`;

const VOICES = [
  { id: "mali", name: "มะลิ", role: "ผู้หญิง-สดใส" },
  { id: "samorn", name: "สมร", role: "ผู้หญิง-ทางการ" },
  { id: "somchai", name: "สมชาย", role: "ผู้ชาย-สุขุม" },
];

const INTERVALS = [10, 20, 30, 60];

function CallDefaultsPage() {
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [apiKey, setApiKey] = useState("");
  const [voice, setVoice] = useState("mali");
  const [speed, setSpeed] = useState(1);
  const [retries, setRetries] = useState(0);
  const [interval, setIntervalValue] = useState(30);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyLowPoints, setNotifyLowPoints] = useState(false);

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-8 py-8">
        {/* Header row */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-700">ตั้งค่า</h1>
          <Button variant="primary" size="sm" onClick={() => {}}>
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
            <h3 className="font-semibold text-gray-800">สคริปต์การโทร (ค่าเริ่มต้น)</h3>
          </div>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="mt-4 min-h-40 w-full rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-gray-700 outline-none focus:border-brand-700"
            maxLength={2000}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">รองรับตัวแปร:</span>
            {["{ชื่อ}", "{ชื่องาน}", "{วันที่}", "{เวลา}"].map((v) => (
              <span
                key={v}
                className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700"
              >
                {v}
              </span>
            ))}
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

            {/* API Key */}
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">BOTNOI API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="ใส่ API Key จาก Voice.botnoi.ai"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-300"
              />
            </div>

            {/* Voice selection */}
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">เลือกเสียงพูด</span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-300 text-brand-700 hover:bg-brand-50"
                aria-label="เพิ่มเสียง"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVoice(v.id)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-center transition-colors",
                    voice === v.id
                      ? "border-brand-700 bg-brand-50"
                      : "border-gray-200 bg-white hover:border-brand-300",
                  )}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
                    {v.name.charAt(0)}
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-800">{v.name}</div>
                  <div className="text-xs text-gray-400">{v.role}</div>
                </button>
              ))}
            </div>

            {/* Speed slider */}
            <div className="mt-5">
              <label className="text-sm font-medium text-gray-700">
                ความเร็ว: {speed.toFixed(2)}X
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

            {/* Retry stepper */}
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700">จำนวนครั้งโทรซ้ำสูงสุด</div>
              <div className="text-xs text-gray-400">(กรณีที่ปลายสายไม่รับ)</div>
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

            {/* Interval dropdown */}
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

            {/* Notification toggles */}
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
                <span className="text-sm text-gray-700">แจ้งเตือนเมื่อพอยท์ต่ำกว่า 100</span>
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
