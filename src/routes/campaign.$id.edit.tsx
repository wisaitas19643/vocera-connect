import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  X,
  Calendar as CalendarIcon,
  Phone,
  UploadCloud,
  CheckCircle2,
  FileText,
  Mic,
  Plus,
  Minus,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/vocera/Button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RequireAuth } from "@/components/vocera/RequireAuth";
import * as campaignStore from "@/lib/campaignStore";

export const Route = createFileRoute("/campaign/$id/edit")({
  head: () => ({ meta: [{ title: "Edit campaign — Ringo" }] }),
  component: CampaignEditPage,
});

function CampaignEditPage() {
  return (
    <RequireAuth>
      <CampaignEditPageInner />
    </RequireAuth>
  );
}

const VOICES = [
  { id: "mali", name: "มะลิ", role: "ผู้หญิง-สดใส" },
  { id: "samorn", name: "สมร", role: "ผู้หญิง-ทางการ" },
  { id: "somchai", name: "สมชาย", role: "ผู้ชาย-สุขุม" },
];

const INTERVALS = [10, 20, 30, 60];

function CampaignEditPageInner() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loadError, setLoadError] = useState("");

  // Step 1 state
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [eventTime, setEventTime] = useState("");
  const [callStartDate, setCallStartDate] = useState<Date | undefined>();
  const [callEndDate, setCallEndDate] = useState<Date | undefined>();
  const [callStartTime, setCallStartTime] = useState("");
  const [callEndTime, setCallEndTime] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [existingCsv, setExistingCsv] = useState<{ name: string; contacts: number } | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 2 state
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("mali");
  const [speed, setSpeed] = useState(1);
  const [retries, setRetries] = useState(0);
  const [interval, setIntervalValue] = useState(10);

  // ดึงข้อมูลแคมเปญจาก Supabase
  useEffect(() => {
    campaignStore.getById(id).then((camp) => {
      if (!camp) {
        setLoadError("ไม่พบแคมเปญนี้");
        return;
      }
      setName(camp.name);
      setEventTime(camp.time ?? "");
      if (camp.date) {
        const [d, m, y] = camp.date.split("/").map(Number);
        if (d && m && y) setEventDate(new Date(y, m - 1, d));
      }
      if (camp.contacts && camp.contacts.length > 0) {
        setExistingCsv({ name: "contacts.csv", contacts: camp.contacts.length });
      }
    });
  }, [id]);

  const close = () => navigate({ to: "/campaign" });

  const goNext = () => {
    if (!name.trim() || !eventDate || !eventTime || (!csvFile && !existingCsv)) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setError("");
    setStep(2);
  };

  const submit = async () => {
    const { format } = await import("date-fns");
    await campaignStore.update(id, {
      name: name.trim(),
      date: eventDate ? format(eventDate, "dd/MM/yyyy") : undefined,
      time: eventTime || undefined,
    });
    toast.success(`✅ บันทึกแคมเปญ "${name.trim()}" สำเร็จ`);
    navigate({ to: "/campaign" });
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("รองรับเฉพาะไฟล์ .csv");
      return;
    }
    setError("");
    setExistingCsv(null);
    setCsvFile(file);
  };

  const hasFile = csvFile || existingCsv;

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 px-4 py-8">
      <div className="mx-auto mt-8 max-w-2xl rounded-3xl bg-white p-8 shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-700">แก้ไข</h1>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={close}>
              ยกเลิก
            </Button>
            <Button variant="primary" size="sm" onClick={submit}>
              บันทึกการเปลี่ยนแปลง
            </Button>
            <button
              type="button"
              onClick={close}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="ปิด"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stepper */}
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
                {hasFile ? (
                  <div className="flex w-full flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {csvFile ? csvFile.name : existingCsv!.name}
                      </span>
                      {existingCsv && !csvFile && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          {existingCsv.contacts.toLocaleString()} รายชื่อ
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setCsvFile(null);
                          setExistingCsv(null);
                        }}
                        className="text-sm text-gray-400 hover:text-brand-700"
                      >
                        ลบ
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
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
                        เปลี่ยนไฟล์
                      </Button>
                    </div>
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
            {/* Script card */}
            <div className="rounded-2xl bg-white p-5 shadow-card">
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Voice card */}
              <div className="rounded-2xl bg-white p-5 shadow-card">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Mic className="h-4 w-4" />
                  </span>
                  <h3 className="font-semibold text-gray-800">ตั้งค่าเสียง</h3>
                </div>
                <div className="mt-4 flex items-center justify-between">
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
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                ← ย้อนกลับ
              </Button>
              <Button variant="primary" onClick={submit} className="flex-1">
                บันทึกการเปลี่ยนแปลง
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
