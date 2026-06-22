import { useRef, useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Download,
  Phone,
  UploadCloud,
  CheckCircle2,
  FileText,
  Mic,
} from "lucide-react";
// toast ใช้แสดง notification มุมขวาบน
import { toast } from "sonner";

import { Button } from "@/components/vocera/Button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import * as campaignStore from "@/lib/campaignStore";
import { RequireAuth } from "@/components/vocera/RequireAuth";
import { supabase } from "@/lib/supabase";

interface DbTemplate { id: string; name: string; script: string; }

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

const DEFAULT_SCRIPT = `สวัสดีค่ะ ดิฉันโทรมาจาก {Org_name}

ต้องการสอบถามเพื่อยืนยันการเข้าร่วมงาน ในวันที่ {Appointment Date} เวลา {Appointment Time} น.

ท่านสะดวกเข้าร่วมได้ไหมคะ?`;

const VOICES = [
  { id: "6",  name: "ไซเรน",      role: "ผู้หญิง-วัยรุ่น" },
  { id: "4",  name: "แม็กซ์",     role: "ผู้ชาย-วัยผู้ใหญ่" },
  { id: "37", name: "ผู้ใหญ่ลี", role: "ผู้ชาย-สำเนียงสุพรรณ" },
];


function CampaignCreatePageInner() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

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
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [voice, setVoice] = useState("6");
  const [dbTemplates, setDbTemplates] = useState<DbTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("user_settings")
        .select("default_script, voice_id")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.default_script) setScript(data.default_script);
          if (data?.voice_id) setVoice(data.voice_id);
        });
      supabase
        .from("script_templates")
        .select("id, name, script")
        .eq("user_id", user.id)
        .order("created_at")
        .then(({ data }) => { if (data?.length) setDbTemplates(data); });
    });
  }, []);

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
        script,
        voice_id: voice,
      });
      toast.success(`✅ สร้างแคมเปญสำเร็จ! "${name.trim()}" (${contacts.length} รายชื่อ)`);
      navigate({ to: "/campaign" });
    };
    reader.readAsText(csvFile);
  };

  const downloadTemplate = () => {
    // BOM (﻿) ทำให้ Excel เปิดภาษาไทยได้ถูกต้อง
    const csv = "﻿ชื่อ-นามสกุล,เบอร์โทรศัพท์\nสมชาย ใจดี,0812345678\nสมหญิง ใจงาม,0898765432";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ringo-template.csv";
    a.click();
    URL.revokeObjectURL(url);
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

            <FormField
              label="อัพโหลดรายชื่อผู้เข้าร่วม (CSV) *"
              action={
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline"
                >
                  <Download className="h-3 w-3" />
                  ดาวน์โหลด Template
                </button>
              }
            >
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
            {/* Script card */}
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <FileText className="h-4 w-4" />
                </span>
                <h3 className="font-semibold text-gray-800">สคริปต์การโทร</h3>
              </div>
              {dbTemplates.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">เลือก Template</p>
                  <div className="flex flex-wrap gap-2">
                    {dbTemplates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => { setScript(t.script); setActiveTemplate(t.id); }}
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
              )}
              <textarea
                value={script}
                onChange={(e) => { setScript(e.target.value); setActiveTemplate(""); }}
                className="mt-4 min-h-40 w-full rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-gray-700 outline-none focus:border-brand-700"
                maxLength={2000}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">ตัวแปรที่ใช้ได้:</span>
                {["{Org_name}", "{Appointment Date}", "{Appointment Time}"].map((v) => (
                  <span key={v} className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
                    {v}
                  </span>
                ))}
              </div>
            </div>

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
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                ← ย้อนกลับ
              </Button>
              <Button variant="primary" onClick={submit} className="flex-1">
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

function FormField({ label, action, children }: { label: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {action}
      </div>
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
    <div className="relative">
      <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          inputClass,
          "pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
          !value && "text-gray-400",
        )}
      />
    </div>
  );
}
