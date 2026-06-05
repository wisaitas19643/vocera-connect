import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  ChevronDown,
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
  LayoutGrid,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { KPICard } from "@/components/vocera/KPICard";
import { StatusBadge, type StatusVariant } from "@/components/vocera/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "แดชบอร์ด — Vocera" }] }),
  component: DashboardPage,
});

type Filter = "all" | StatusVariant;

interface Activity {
  id: string;
  name: string;
  phone: string;
  status: StatusVariant;
  date: string;
  time: string;
}

const activities: Activity[] = [
  { id: "1", name: "กฤษฎา มานะธรรม", phone: "081-234-5678", status: "confirmed", date: "12/04/2026", time: "10:32" },
  { id: "2", name: "พงศกร รัตนสิริ", phone: "089-111-2233", status: "rejected", date: "12/04/2026", time: "10:35" },
  { id: "3", name: "ชนากานต์ ใจดี", phone: "082-555-7788", status: "missed", date: "12/04/2026", time: "10:40" },
  { id: "4", name: "อรทัย ศรีสุข", phone: "086-222-3344", status: "pending", date: "12/04/2026", time: "10:42" },
  { id: "5", name: "ธนกร สุขเกษม", phone: "084-987-6543", status: "confirmed", date: "12/04/2026", time: "10:45" },
  { id: "6", name: "นภัสสร พงษ์ไพศาล", phone: "087-345-2211", status: "confirmed", date: "12/04/2026", time: "10:48" },
  { id: "7", name: "ปวีณา วงศ์วิทย์", phone: "081-998-1122", status: "missed", date: "12/04/2026", time: "10:52" },
  { id: "8", name: "สมชาย ใจกล้า", phone: "083-444-5566", status: "pending", date: "12/04/2026", time: "10:55" },
  { id: "9", name: "วิภาวี ตั้งใจ", phone: "088-321-9988", status: "confirmed", date: "12/04/2026", time: "10:58" },
  { id: "10", name: "เกียรติศักดิ์ พรชัย", phone: "085-654-3210", status: "rejected", date: "12/04/2026", time: "11:02" },
  { id: "11", name: "อาทิตย์ ส่องแสง", phone: "082-101-2020", status: "pending", date: "12/04/2026", time: "11:05" },
];

const campaignSuccess = [
  { name: "ประชุมผู้ถือหุ้น ประจำปี 2026", percent: 75 },
  { name: "อบรมพนักงานใหม่ รุ่นที่ 12", percent: 80 },
  { name: "สัมมนาเทคโนโลยี AI", percent: 39.52 },
];

const responseData = [
  { key: "confirmed", label: "ยืนยัน", value: 36.49, color: "#10b981" },
  { key: "rejected", label: "ปฏิเสธ", value: 14.18, color: "#ef4444" },
  { key: "missed", label: "ไม่รับสาย", value: 17.19, color: "#f59e0b" },
  { key: "pending", label: "รอสาย", value: 32.35, color: "#3b82f6" },
];

function DashboardPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? activities : activities.filter((a) => a.status === filter)),
    [filter],
  );
  const visible = filtered.slice(0, 10);
  const hasMore = filtered.length > 10;

  const toggle = (next: Filter) => setFilter((cur) => (cur === next ? "all" : next));

  const isEmpty = activities.length === 0;

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl animate-page-in px-8 py-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-brand-700">แดชบอร์ด</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาแคมเปญ"
                className="w-64 rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-300"
              />
            </div>
            <button
              type="button"
              className="inline-flex min-w-[12rem] items-center justify-between rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:border-brand-300"
            >
              เลือกแคมเปญ
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : isEmpty ? (
          <EmptyDashboard />
        ) : (
          <>
            {/* KPI cards */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              <KPICard
                icon={<BarChart3 className="h-5 w-5" />}
                value={1425}
                label="การโทรทั้งหมด"
                subText="ทุกแคมเปญ"
                isActive={filter === "all"}
                onClick={() => setFilter("all")}
              />
              <KPICard
                icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                value={520}
                label="ยืนยัน"
                subText="36.5% จากทั้งหมด"
                isActive={filter === "confirmed"}
                onClick={() => toggle("confirmed")}
              />
              <KPICard
                icon={<XCircle className="h-5 w-5 text-red-500" />}
                value={202}
                label="ปฏิเสธ"
                subText="14.2% จากทั้งหมด"
                isActive={filter === "rejected"}
                onClick={() => toggle("rejected")}
              />
              <KPICard
                icon={<PhoneMissed className="h-5 w-5 text-yellow-500" />}
                value={245}
                label="ไม่รับสาย"
                subText="17.2% จากทั้งหมด"
                isActive={filter === "missed"}
                onClick={() => toggle("missed")}
              />
              <KPICard
                icon={<Clock className="h-5 w-5 text-blue-500" />}
                value={461}
                label="รอสาย"
                subText="32.4% จากทั้งหมด"
                isActive={filter === "pending"}
                onClick={() => toggle("pending")}
              />
            </div>

            {/* Middle row */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
              <SuccessByCampaign page={page} onPage={setPage} />
              <ResponseDonut />
            </div>

            {/* Activity table */}
            <RecentActivity rows={visible} hasMore={hasMore} />
          </>
        )}
      </div>
    </AppLayout>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="mt-2 h-4 w-16" />
            <Skeleton className="mt-1 h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl bg-white p-6 shadow-card lg:col-span-3">
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="flex flex-col gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="mt-2 h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card lg:col-span-2">
          <Skeleton className="mb-4 h-5 w-24" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-44 w-44 rounded-full" />
            <div className="flex flex-1 flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
        <Skeleton className="mb-4 h-5 w-32" />
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

function EmptyDashboard() {
  return (
    <div className="mt-12 flex flex-col items-center justify-center py-20">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50">
        <LayoutGrid className="h-10 w-10 text-brand-300" />
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-700">ยังไม่มีข้อมูล</p>
      <p className="mt-1 text-sm text-gray-400">เริ่มสร้างแคมเปญแรกของคุณ</p>
      <Link
        to="/campaign/create"
        className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-900"
      >
        สร้างแคมเปญแรก
      </Link>
    </div>
  );
}

function SuccessByCampaign({ page, onPage }: { page: number; onPage: (n: number) => void }) {
  const totalPages = 1;
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card lg:col-span-3">
      <h3 className="mb-4 font-semibold text-gray-700">อัตราสำเร็จตามแคมเปญ</h3>
      <div className="flex flex-col gap-5">
        {campaignSuccess.map((c) => {
          const pct = c.percent;
          return (
            <div key={c.name}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{c.name}</span>
                <span className="text-right text-sm font-semibold text-brand-700">
                  {pct.toFixed(pct % 1 === 0 ? 0 : 2)}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-100">
                <div className="h-full rounded-full bg-brand-700" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onPage(Math.max(1, page - 1))}
          className="rounded-full p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-700"
          aria-label="ก่อนหน้า"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-700 px-2 text-xs font-semibold text-white">
          {page}
        </span>
        <button
          type="button"
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          className="rounded-full p-1.5 text-gray-400 hover:bg-brand-50 hover:text-brand-700"
          aria-label="ถัดไป"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ResponseDonut() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card lg:col-span-2">
      <h3 className="mb-4 font-semibold text-gray-700">ผลตอบรับ</h3>
      <div className="flex items-center gap-4">
        <div className="h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={responseData}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={90}
                stroke="none"
                paddingAngle={2}
              >
                {responseData.map((d) => (
                  <Cell key={d.key} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex flex-1 flex-col gap-2.5">
          {responseData.map((d) => (
            <li key={d.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="inline-flex items-center gap-2 text-gray-600">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.label}
              </span>
              <span className="font-semibold text-brand-700">{d.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RecentActivity({ rows, hasMore }: { rows: Activity[]; hasMore: boolean }) {
  return (
    <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-700">กิจกรรมล่าสุด</h3>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            นำเข้า CSV.
          </Button>
          <Button variant="primary" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            นำออก CSV.
          </Button>
        </div>
      </div>

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
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 transition-colors hover:bg-brand-50">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                      {r.name.charAt(0)}
                    </span>
                    <span className="text-gray-800">{r.name}</span>
                  </div>
                </td>
                <td className="py-4 pr-4 text-gray-600">{r.phone}</td>
                <td className="py-4 pr-4">
                  <StatusBadge variant={r.status} />
                </td>
                <td className="py-4 pr-4 text-gray-600">{r.date}</td>
                <td className="py-4 pr-4 text-gray-600">{r.time}</td>
                <td className="py-4 pr-4">
                  <Button variant="ghost" size="sm">
                    <Headphones className="h-4 w-4" />
                    ฟังสาย
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-end">
          <Link
            to="/campaign/$id/contacts"
            params={{ id: "1" }}
            className={cn("text-sm font-medium text-brand-700 hover:underline")}
          >
            ดูทั้งหมด →
          </Link>
        </div>
      )}
    </div>
  );
}
