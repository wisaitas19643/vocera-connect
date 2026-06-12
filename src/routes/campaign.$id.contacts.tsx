import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  XCircle,
  PhoneMissed,
  Clock,
  Download,
  Upload,
  Headphones,
} from "lucide-react";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { StatusBadge, type StatusVariant } from "@/components/vocera/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import * as campaignStore from "@/lib/campaignStore";

export const Route = createFileRoute("/campaign/$id/contacts")({
  head: () => ({ meta: [{ title: "Contacts — Ringo" }] }),
  component: CampaignContactsPage,
});

type Filter = "all" | StatusVariant;

interface Contact {
  id: string;
  name: string;
  phone: string;
  status: StatusVariant;
  date: string;
  time: string;
}

const filterStyles: Record<Filter, string> = {
  all: "border-brand-700 bg-brand-50",
  confirmed: "border-green-500 bg-green-50",
  rejected: "border-red-500 bg-red-50",
  missed: "border-yellow-500 bg-yellow-50",
  pending: "border-blue-500 bg-blue-50",
};

const PAGE_SIZE = 10;

function CampaignContactsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [campaignName, setCampaignName] = useState(`Campaign ${id}`);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    campaignStore.getById(id)
      .then((camp) => {
        if (!camp) return;
        setCampaignName(camp.name);
        setContacts(
          (camp.contacts ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            status: "pending" as StatusVariant,
            date: "",
            time: "",
          })),
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = useMemo(() => {
    let list = filter === "all" ? contacts : contacts.filter((c) => c.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q),
      );
    }
    return list;
  }, [contacts, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  const counts = useMemo(() => {
    const c = { all: contacts.length, confirmed: 0, rejected: 0, missed: 0, pending: 0 };
    for (const x of contacts) c[x.status]++;
    return c;
  }, [contacts]);

  const setFilterReset = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  const handleExport = () => {
    const rows = [
      ["ชื่อ-นามสกุล", "เบอร์โทรศัพท์", "สถานะ", "วันที่โทร", "เวลาโทร"],
      ...filtered.map((c) => [c.name, c.phone, c.status, c.date, c.time]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length <= 1) return;
      const parsed: Contact[] = lines.slice(1).map((line, i) => {
        const cols = line.split(",").map((s) => s.replace(/^"|"$/g, "").trim());
        const status = (["confirmed", "rejected", "missed", "pending"] as StatusVariant[]).includes(
          cols[2] as StatusVariant,
        )
          ? (cols[2] as StatusVariant)
          : "pending";
        return {
          id: `imp-${Date.now()}-${i}`,
          name: cols[0] || "",
          phone: cols[1] || "",
          status,
          date: cols[3] || "",
          time: cols[4] || "",
        };
      });
      setContacts((prev) => {
        const merged = [...prev, ...parsed];
        // fire-and-forget — บันทึก contacts ที่ import ลง Supabase
        void campaignStore.updateContacts(
          id,
          merged.map((c) => ({ id: c.id, name: c.name, phone: c.phone })),
        );
        return merged;
      });
      setPage(1);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl animate-page-in px-8 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/campaign" })}
            >
              <ChevronLeft className="h-4 w-4" />
              กลับ
            </Button>
            <h1 className="text-2xl font-bold text-brand-700">{campaignName}</h1>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ค้นหาแขก"
              className="w-64 rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-300"
            />
          </div>
        </div>

        {loading ? (
          <ContactsSkeleton />
        ) : (
          <>
            {/* KPI filter cards */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              <FilterCard active={filter === "all"} variant="all" onClick={() => setFilterReset("all")}>
                <KPICardInner icon={<BarChart3 className="h-5 w-5" />} value={counts.all} label="การโทรทั้งหมด" />
              </FilterCard>
              <FilterCard active={filter === "confirmed"} variant="confirmed" onClick={() => setFilterReset("confirmed")}>
                <KPICardInner
                  icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                  value={counts.confirmed}
                  label="ยืนยัน"
                  subText={`${pct(counts.confirmed, counts.all)}% จากทั้งหมด`}
                />
              </FilterCard>
              <FilterCard active={filter === "rejected"} variant="rejected" onClick={() => setFilterReset("rejected")}>
                <KPICardInner
                  icon={<XCircle className="h-5 w-5 text-red-500" />}
                  value={counts.rejected}
                  label="ปฏิเสธ"
                  subText={`${pct(counts.rejected, counts.all)}% จากทั้งหมด`}
                />
              </FilterCard>
              <FilterCard active={filter === "missed"} variant="missed" onClick={() => setFilterReset("missed")}>
                <KPICardInner
                  icon={<PhoneMissed className="h-5 w-5 text-yellow-500" />}
                  value={counts.missed}
                  label="ไม่รับสาย"
                  subText={`${pct(counts.missed, counts.all)}% จากทั้งหมด`}
                />
              </FilterCard>
              <FilterCard active={filter === "pending"} variant="pending" onClick={() => setFilterReset("pending")}>
                <KPICardInner
                  icon={<Clock className="h-5 w-5 text-blue-500" />}
                  value={counts.pending}
                  label="รอสาย"
                  subText={`${pct(counts.pending, counts.all)}% จากทั้งหมด`}
                />
              </FilterCard>
            </div>

            {/* Table card */}
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-700">รายชื่อแขกทั้งหมด</h3>
                <div className="flex items-center gap-2">
                  <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
                  <Button variant="secondary" size="sm" className="gap-2" onClick={() => fileRef.current?.click()}>
                    <Download className="h-4 w-4" />
                    นำเข้า CSV.
                  </Button>
                  <Button variant="primary" size="sm" className="gap-2" onClick={handleExport}>
                    <Upload className="h-4 w-4" />
                    นำออก CSV.
                  </Button>
                </div>
              </div>

              {contacts.length === 0 ? (
                <EmptyContacts onImportClick={() => fileRef.current?.click()} />
              ) : (
                <>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-sm font-medium text-gray-400">
                          <th className="py-3 pr-4 font-medium">ชื่อ-นามสกุล</th>
                          <th className="py-3 pr-4 font-medium">เบอร์โทรศัพท์</th>
                          <th className="py-3 pr-4 font-medium">สถานะ</th>
                          <th className="py-3 pr-4 font-medium">วันที่โทร</th>
                          <th className="py-3 pr-4 font-medium">เวลาโทร</th>
                          <th className="py-3 pr-4 font-medium">รายละเอียด</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((r) => (
                          <tr
                            key={r.id}
                            className="border-b border-gray-50 transition-colors hover:bg-brand-50"
                          >
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                                  {r.name.charAt(0)}
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-gray-800">{r.name}</span>
                                  <span className="text-xs text-gray-400">{campaignName}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4 text-gray-600">{r.phone}</td>
                            <td className="py-4 pr-4">
                              <StatusBadge variant={r.status} />
                            </td>
                            <td className="py-4 pr-4 text-gray-600">{r.date}</td>
                            <td className="py-4 pr-4 text-gray-600">{r.time}</td>
                            <td className="py-4 pr-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate({
                                    to: "/campaign/$id/contacts/$contactId",
                                    params: { id, contactId: r.id },
                                  })
                                }
                              >
                                <Headphones className="h-4 w-4" />
                                ฟังสาย
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {visible.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                              ไม่พบข้อมูล
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm text-gray-400">
                      แสดง {visible.length} จากทั้งหมด {filtered.length} รายการ
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="rounded-full p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40"
                        aria-label="ก่อนหน้า"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const n = i + 1;
                        const active = n === currentPage;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setPage(n)}
                            className={cn(
                              "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold",
                              active
                                ? "bg-brand-700 text-white"
                                : "text-gray-500 hover:bg-brand-50 hover:text-brand-700",
                            )}
                          >
                            {n}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-full p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40"
                        aria-label="ถัดไป"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function EmptyContacts({ onImportClick }: { onImportClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <p className="text-base font-semibold text-gray-600">ยังไม่มีรายชื่อ</p>
      <p className="mt-1 text-sm text-gray-400">นำเข้าไฟล์ CSV เพื่อเพิ่มรายชื่อผู้เข้าร่วม</p>
      <Button variant="secondary" className="mt-5" onClick={onImportClick}>
        นำเข้า CSV.
      </Button>
    </div>
  );
}

function ContactsSkeleton() {
  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="mt-2 h-4 w-14" />
            <Skeleton className="mt-1 h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
        <Skeleton className="mb-4 h-5 w-40" />
        <table className="w-full">
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </td>
                <td className="py-4 pr-4"><Skeleton className="h-4 w-28" /></td>
                <td className="py-4 pr-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                <td className="py-4 pr-4"><Skeleton className="h-4 w-20" /></td>
                <td className="py-4 pr-4"><Skeleton className="h-4 w-12" /></td>
                <td className="py-4 pr-4"><Skeleton className="h-7 w-20 rounded-full" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FilterCard({
  active,
  variant,
  onClick,
  children,
}: {
  active: boolean;
  variant: Filter;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-2 rounded-2xl border-2 bg-white p-5 text-left shadow-card transition-all",
        active ? filterStyles[variant] : "border-transparent hover:border-brand-300",
      )}
    >
      {children}
    </button>
  );
}

function KPICardInner({
  icon,
  value,
  label,
  subText,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  subText?: string;
}) {
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="text-brand-700">{icon}</div>
        <div className="text-3xl font-semibold text-gray-900">{value.toLocaleString()}</div>
      </div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      {subText && <div className="text-xs text-gray-400">{subText}</div>}
    </>
  );
}

function pct(part: number, total: number): string {
  if (!total) return "0";
  const v = (part / total) * 100;
  return v.toFixed(v % 1 === 0 ? 0 : 1);
}
