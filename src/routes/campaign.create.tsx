import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  X,
  Calendar as CalendarIcon,
  Phone,
  UploadCloud,
  CheckCircle2,
  GitBranch,
  Check,
  Minus,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/vocera/Button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import * as campaignStore from "@/lib/campaignStore";
import { RequireAuth } from "@/components/vocera/RequireAuth";
import { useFlowScripts } from "@/lib/flowStore";
import { parseFlow } from "@/components/vocera/ScriptFlowBuilder";

export const Route = createFileRoute("/campaign/create")({
  head: () => ({ meta: [{ title: "Create campaign — Ringo" }] }),
  component: CampaignCreatePage,
});

function CampaignCreatePage() {
  return (
    <RequireAuth>
      <CampaignCreatePageInner />
    </RequireAuth>
  );
}

const INTERVALS = [10, 20, 30, 60];

function CampaignCreatePageInner() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const { data: flowScripts = [] } = useFlowScripts();

  // Step 1 state
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [eventTime, setEventTime] = useState("");
  const [callStartDate, setCallStartDate] = useState<Date | undefined>();
  const [callEndDate, setCallEndDate] = useState<Date | undefined>();
  const [callStartTime, setCallStartTime] = useState("");
  const [callEndTime, setCallEndTime] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 2 state
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [retries, setRetries] = useState(0);
  const [interval, setIntervalValue] = useState(10);

  const selectedFlow = flowScripts.find((s) => s.id === selectedFlowId) ?? null;

  const close = () => navigate({ to: "/campaign" });

  const goNext = () => {
    if (
      !name.trim() ||
      !eventDate ||
      !eventTime ||
      !callStartDate ||
      !callEndDate ||
      !callStartTime ||
      !callEndTime ||
      !csvFile
    ) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setError("");
    setStep(2);
  };

  const submit = () => {
    if (!csvFile) return;
    if (!selectedFlow) {
      toast.error("กรุณาเลือก Flow สคริปต์ก่อนสร้างแคมเปญ");
      return;
    }

    const flowData = parseFlow(selectedFlow.content);

    const reader = new FileReader();
    reader.onload = async () => {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const contacts = lines.slice(1).map((line, i) => {
        const cols = line.split(",").map((s) => s.replace(/^"|"$/g, "").trim());
        return { id: `imp-${Date.now()}-${i}`, name: cols[0] || "", phone: cols[1] || "" };
      }).filter((c) => c.name || c.phone);

      await campaignStore.add({
        name: name.trim(),
        date: eventDate ? format(eventDate, "dd/MM/yyyy") : "-",
        time: eventTime,
        contacts,
        script: selectedFlow.content,
        voice_id: flowData.speaker_id,
        voice_speed: speed,
        max_retries: retries,
      });
      toast.success(`✅ สร้างแคมเปญสำเร็จ! "${name.trim()}" (${contacts.length} รายชื่อ)`);
      navigate({ to: "/campaign" });
    };
    reader.readAsText(csvFile);
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("รองรับเฉพาะไฟล์ .csv");
      return;
    }
    setError("");
    setCsvFile(file);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 px-4 py-8">
      <div className="mx-auto mt-8 max-w-2xl rounded-3xl bg-white p-8 shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-700">สร้างแคมเปญ</h1>
          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="ปิด"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Stepper step={step} />

        {step === 1 ? (
          <div className="mt-8 flex flex-col gap-5">
            <FormField label="ชื่อแคมเปญ *">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น งานแต่งคุณสมชาย"
                className={inputClass}
                maxLength={200}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="วันที่จัดงาน *">
                <DateInput value={eventDate} onChange={setEventDate} />
              </FormField>
              <FormField label="เวลาที่จัดงาน *">
                <TimeInput value={eventTime} onChange={setEventTime} />
              </FormField>
            </div>

            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-brand-700" />
                <h3 className="font-semibold text-brand-700">ตั้งค่าการโทร</h3>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="วันที่เริ่มโทร *">
                  <DateInput value={callStartDate} onChange={setCallStartDate} />
                </FormField>
                <FormField label="วันที่สิ้นสุดการโทร *">
                  <DateInput value={callEndDate} onChange={setCallEndDate} />
                </FormField>
                <FormField label="เวลาที่เริ่มโทร *">
                  <TimeInput value={callStartTime} onChange={setCallStartTime} />
                </FormField>
                <FormField label="เวลาที่สิ้นสุดการโทร *">
                  <TimeInput value={callEndTime} onChange={setCallEndTime} />
                </FormField>
              </div>
            </div>

            <FormField label="อัพโหลดรายชื่อผู้เข้าร่วม (CSV) *">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFile(e.dataTransfer.files?.[0] ?? null);
                }}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 p-8 text-center"
              >
                {csvFile ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">{csvFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setCsvFile(null)}
                      className="text-sm text-gray-400 hover:text-brand-700"
                    >
                      ลบ
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-brand-700" />
                    <p className="text-sm text-gray-600">ลากไฟล์มาวางที่นี่ หรือ</p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                    >
                      เลือกไฟล์
                    </Button>
                  </>
                )}
              </div>
            </FormField>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button variant="primary" onClick={goNext} className="w-full">
              ถัดไป →
            </Button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-5">
            {/* Flow script picker */}
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <GitBranch className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-800">เลือก Flow สคริปต์</h3>
                    <p className="text-xs text-gray-400">
                      ตัวแปร {"{ชื่อ}"}, {"{ชื่องาน}"}, {"{วันที่}"}, {"{เวลา}"} จะถูกแทนค่าอัตโนมัติ
                    </p>
                  </div>
                </div>
                <Link
                  to="/settings/flow"
                  className="flex items-center gap-1 text-xs text-brand-700 hover:underline shrink-0"
                >
                  จัดการ Flow
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {flowScripts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 text-center">
                  <GitBranch className="h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">ยังไม่มี Flow สคริปต์</p>
                  <Link to="/settings/flow">
                    <Button variant="secondary" size="sm">
                      สร้าง Flow สคริปต์
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {flowScripts.map((s) => {
                    const flow = parseFlow(s.content);
                    const isSelected = selectedFlowId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedFlowId(s.id)}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                          isSelected
                            ? "border-brand-700 bg-brand-50"
                            : "border-gray-200 bg-white hover:border-brand-300",
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                            isSelected
                              ? "border-brand-700 bg-brand-700"
                              : "border-gray-300 bg-white",
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-800">{s.name}</div>
                          <div className="mt-1 text-xs text-gray-400 line-clamp-2">
                            {flow.greeting}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium text-brand-700">
                              เสียง #{flow.speaker_id}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                              4 nodes
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Call settings */}
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Phone className="h-4 w-4" />
                </span>
                <h3 className="font-semibold text-gray-800">ตั้งค่าการโทร</h3>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-gray-700">ความเร็วเสียง</div>
                  <div className="text-xs text-gray-400 mb-2">{speed.toFixed(2)}X</div>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.25}
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-brand-700"
                  />
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">จำนวนครั้งโทรซ้ำสูงสุด</div>
                  <div className="text-xs text-gray-400 mb-2">กรณีปลายสายไม่รับ</div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRetries(Math.max(0, retries - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-brand-700 hover:text-brand-700"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-12 text-center text-sm font-semibold text-gray-800">
                      {retries} ครั้ง
                    </span>
                    <button
                      type="button"
                      onClick={() => setRetries(Math.min(10, retries + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-brand-700 hover:text-brand-700"
                    >
                      <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
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
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                ← ย้อนกลับ
              </Button>
              <Button
                variant="primary"
                onClick={submit}
                disabled={!selectedFlow}
                className="flex-1"
              >
                สร้างแคมเปญ
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-300";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 }) {
  const steps = [
    { n: 1, label: "ข้อมูลแคมเปญ" },
    { n: 2, label: "สคริปต์และเสียง" },
  ];
  return (
    <div className="mt-8 px-4">
      <div className="flex items-center">
        {steps.map((s, i) => {
          const active = step >= s.n;
          return (
            <div key={s.n} className={cn("flex items-center", i === 0 ? "flex-1" : "flex-1")}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                    active
                      ? "bg-brand-700 text-white"
                      : "border-2 border-gray-300 bg-white text-gray-400",
                  )}
                >
                  {s.n}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs",
                    active ? "font-medium text-brand-700" : "text-gray-400",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 mb-6 h-0.5 flex-1 bg-gray-200">
                  <div
                    className={cn("h-full bg-brand-700 transition-all", step > s.n ? "w-full" : "w-0")}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            inputClass,
            "flex items-center gap-2 text-left",
            !value && "text-gray-400",
          )}
        >
          <CalendarIcon className="h-4 w-4 text-gray-400" />
          {value ? format(value, "dd/MM/yyyy") : "วว/ดด/ปปปป"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          className={cn("pointer-events-auto p-3")}
        />
      </PopoverContent>
    </Popover>
  );
}

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="00:00 น."
      className={inputClass}
    />
  );
}
