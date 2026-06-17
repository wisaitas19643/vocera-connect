import { useEffect, useMemo, useRef, useState } from "react";
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
  Phone,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { makeCall } from "@/services/botnoiService";
import { parseFlow } from "@/components/vocera/ScriptFlowBuilder";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { KPICard } from "@/components/vocera/KPICard";
import { StatusBadge, type StatusVariant } from "@/components/vocera/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "แดชบอร์ด — Ringo" }] }),
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

<<<<<<< HEAD
interface KpiData {
  total: number;
  confirmed: number;
  rejected: number;
  missed: number;
  pending: number;
}
=======
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
  { id: "12", name: "ธนวิชญ์ เรืองเมือง", phone: "082-430-8438", status: "pending", date: "17/06/2026", time: "12:00" },
];
>>>>>>> TN-Boss

interface CampaignRate {
  name: string;
  percent: number;
}

interface ResponseSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

const RESPONSE_COLORS: Pick<ResponseSlice, "key" | "label" | "color">[] = [
  { key: "confirmed", label: "ยืนยัน",    color: "#10b981" },
  { key: "rejected",  label: "ปฏิเสธ",    color: "#ef4444" },
  { key: "missed",    label: "ไม่รับสาย", color: "#f59e0b" },
  { key: "pending",   label: "รอสาย",     color: "#3b82f6" },
];

function DashboardPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Activity[]>(activities);

  // --- state จริง (แทน hardcoded constants เดิม) ---
  const [kpi, setKpi] = useState<KpiData>({ total: 0, confirmed: 0, rejected: 0, missed: 0, pending: 0 });
  const [campaignRates, setCampaignRates] = useState<CampaignRate[]>([]);
  const [responseSlices, setResponseSlices] = useState<ResponseSlice[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hasCampaigns, setHasCampaigns] = useState(false);

  // --- ดึงข้อมูลจริงจาก Supabase ---
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // 1. ดึง campaigns ของ user คนนี้
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, name, total_contacts, completed_calls")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!campaigns?.length) { setLoading(false); return; }
      setHasCampaigns(true);

      const campaignIds = campaigns.map((c) => c.id);

      // 2. ดึง call_logs พร้อม join contacts (ชื่อ + เบอร์)
      //    .select("..., contacts(full_name, phone)") = ดึง column จาก table contacts
      //    ที่มี FK (foreign key) เชื่อมกับ call_logs.contact_id
      const { data: logs } = await supabase
        .from("call_logs")
        .select("id, status, campaign_id, contact_id, created_at, contacts(full_name, phone)")
        .in("campaign_id", campaignIds)
        .order("created_at", { ascending: false })
        .limit(100);

      const safeLogs = logs ?? [];

      // 3. คำนวณ KPI จากข้อมูลจริง
      const total     = safeLogs.length;
      const confirmed = safeLogs.filter((l) => l.status === "confirmed").length;
      const rejected  = safeLogs.filter((l) => l.status === "rejected").length;
      const missed    = safeLogs.filter((l) => l.status === "missed" || l.status === "no_answer").length;
      const pending   = Math.max(0, total - confirmed - rejected - missed);
      setKpi({ total, confirmed, rejected, missed, pending });

      // 4. อัตราสำเร็จตามแคมเปญ (สูงสุด 5 อัน)
      setCampaignRates(
        campaigns.slice(0, 5).map((c) => ({
          name: c.name,
          percent: c.total_contacts > 0 ? (c.completed_calls / c.total_contacts) * 100 : 0,
        }))
      );

      // 5. Response donut slices (% จากทั้งหมด)
      setResponseSlices(
        RESPONSE_COLORS.map(({ key, label, color }) => {
          const count = key === "confirmed" ? confirmed
                      : key === "rejected"  ? rejected
                      : key === "missed"    ? missed
                      : pending;
          return { key, label, color, value: total > 0 ? (count / total) * 100 : 0 };
        })
      );

      // 6. กิจกรรมล่าสุด (สูงสุด 20 แถว)
      setActivities(
        safeLogs.slice(0, 20).map((log) => {
          const contact = log.contacts as { full_name: string; phone: string } | null;
          const d = new Date(log.created_at);
          const dd = String(d.getDate()).padStart(2, "0");
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const hh = String(d.getHours()).padStart(2, "0");
          const min = String(d.getMinutes()).padStart(2, "0");
          return {
            id:     log.id,
            name:   contact?.full_name ?? "—",
            phone:  contact?.phone     ?? "—",
            status: (log.status === "no_answer" ? "missed" : log.status) as StatusVariant,
            date:   `${dd}/${mm}/${d.getFullYear()}`,
            time:   `${hh}:${min}`,
          };
        })
      );

      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(
<<<<<<< HEAD
    () => (filter === "all" ? activities : activities.filter((a) => a.status === filter)),
    [filter, activities],
=======
    () => (filter === "all" ? rows : rows.filter((a) => a.status === filter)),
    [filter, rows],
>>>>>>> TN-Boss
  );
  const visible = filtered.slice(0, 10);
  const hasMore = filtered.length > 10;

  const toggle = (next: Filter) => setFilter((cur) => (cur === next ? "all" : next));

<<<<<<< HEAD
  const isEmpty = !hasCampaigns;
=======
  const isEmpty = rows.length === 0;
>>>>>>> TN-Boss

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
                value={kpi.total}
                label="การโทรทั้งหมด"
                subText="ทุกแคมเปญ"
                isActive={filter === "all"}
                onClick={() => setFilter("all")}
              />
              <KPICard
                icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                value={kpi.confirmed}
                label="ยืนยัน"
                subText={kpi.total > 0 ? `${((kpi.confirmed / kpi.total) * 100).toFixed(1)}% จากทั้งหมด` : "—"}
                isActive={filter === "confirmed"}
                onClick={() => toggle("confirmed")}
              />
              <KPICard
                icon={<XCircle className="h-5 w-5 text-red-500" />}
                value={kpi.rejected}
                label="ปฏิเสธ"
                subText={kpi.total > 0 ? `${((kpi.rejected / kpi.total) * 100).toFixed(1)}% จากทั้งหมด` : "—"}
                isActive={filter === "rejected"}
                onClick={() => toggle("rejected")}
              />
              <KPICard
                icon={<PhoneMissed className="h-5 w-5 text-yellow-500" />}
                value={kpi.missed}
                label="ไม่รับสาย"
                subText={kpi.total > 0 ? `${((kpi.missed / kpi.total) * 100).toFixed(1)}% จากทั้งหมด` : "—"}
                isActive={filter === "missed"}
                onClick={() => toggle("missed")}
              />
              <KPICard
                icon={<Clock className="h-5 w-5 text-blue-500" />}
                value={kpi.pending}
                label="รอสาย"
                subText={kpi.total > 0 ? `${((kpi.pending / kpi.total) * 100).toFixed(1)}% จากทั้งหมด` : "—"}
                isActive={filter === "pending"}
                onClick={() => toggle("pending")}
              />
            </div>

            {/* Middle row */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
              <SuccessByCampaign rates={campaignRates} page={page} onPage={setPage} />
              <ResponseDonut slices={responseSlices} />
            </div>

            {/* Activity table */}
            <RecentActivity rows={visible} hasMore={hasMore} onUpdate={(id, fields) =>
              setRows((prev) => prev.map((r) => r.id === id ? { ...r, ...fields } : r))
            } />
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

function SuccessByCampaign({ rates, page, onPage }: { rates: CampaignRate[]; page: number; onPage: (n: number) => void }) {
  const totalPages = 1;
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card lg:col-span-3">
      <h3 className="mb-4 font-semibold text-gray-700">อัตราสำเร็จตามแคมเปญ</h3>
      {rates.length === 0 && (
        <p className="text-sm text-gray-400">ยังไม่มีข้อมูลแคมเปญ</p>
      )}
      <div className="flex flex-col gap-5">
        {rates.map((c) => {
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

function ResponseDonut({ slices }: { slices: ResponseSlice[] }) {
  const display = slices.length > 0 ? slices : RESPONSE_COLORS.map((c) => ({ ...c, value: 0 }));
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card lg:col-span-2">
      <h3 className="mb-4 font-semibold text-gray-700">ผลตอบรับ</h3>
      <div className="flex items-center gap-4">
        <div className="h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={display}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={90}
                stroke="none"
                paddingAngle={2}
              >
                {display.map((d) => (
                  <Cell key={d.key} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex flex-1 flex-col gap-2.5">
          {display.map((d) => (
            <li key={d.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="inline-flex items-center gap-2 text-gray-600">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.label}
              </span>
              <span className="font-semibold text-brand-700">{d.value.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RecentActivity({
  rows,
  hasMore,
  onUpdate,
}: {
  rows: Activity[];
  hasMore: boolean;
  onUpdate: (id: string, fields: Partial<Pick<Activity, "name" | "phone">>) => void;
}) {
  const [callingId, setCallingId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const startEdit = (row: Activity) => {
    setEditId(row.id);
    setEditName(row.name);
    setEditPhone(row.phone);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const saveEdit = () => {
    if (!editId) return;
    onUpdate(editId, { name: editName.trim() || undefined, phone: editPhone.trim() || undefined });
    setEditId(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditPhone("");
  };

  const handleManualCall = async (row: Activity) => {
    if (callingId) return;
    if (!confirm(`โทรหา ${row.name} (${row.phone}) ใช่หรือไม่?`)) return;
    setCallingId(row.id);
    try {
      // โหลด script + voice จาก user_settings
      const { data: { user } } = await supabase.auth.getUser();
      let script = "";
      let voiceId = "5";
      let confirmMessage: string | undefined;
      let declineMessage: string | undefined;
      let fallbackMessage: string | undefined;

      if (user) {
        const { data: settings } = await supabase
          .from("user_settings")
          .select("default_script, voice_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (settings?.default_script) script = settings.default_script;
        if (settings?.voice_id) voiceId = settings.voice_id;
      }

      // ถ้ามี flow script ใน localStorage ให้ใช้แทน
      try {
        const stored = JSON.parse(localStorage.getItem("ringo_flow_scripts") ?? "[]");
        if (Array.isArray(stored) && stored.length > 0) {
          const flow = parseFlow(stored[0].content);
          script = flow.greeting;
          voiceId = flow.speaker_id || voiceId;
          confirmMessage = flow.confirm;
          declineMessage = flow.decline;
          fallbackMessage = flow.unsure;
        }
      } catch { /* ถ้า parse ไม่ได้ ใช้ค่าจาก settings ต่อไป */ }

      const result = await makeCall({
        campaignId: "manual",
        contactId: row.id,
        phoneNumber: row.phone,
        contactName: row.name,
        script,
        voiceId,
        confirmMessage,
        declineMessage,
        fallbackMessage,
      });
      if (result.status === "confirmed") toast.success(`${row.name} ยืนยันแล้ว`);
      else if (result.status === "rejected") toast.error(`${row.name} ปฏิเสธ`);
      else if (result.status === "missed") toast.warning(`${row.name} ไม่รับสาย`);
      else toast.info(`${row.name} — รอผล`);
    } catch {
      toast.error("โทรไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setCallingId(null);
    }
  };

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
              <th className="py-3 font-medium">โทรด้วยมือ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isEditing = editId === r.id;
              return (
              <tr key={r.id} className="border-b border-gray-50 transition-colors hover:bg-brand-50 group">
                {/* ชื่อ */}
                <td className="py-3 pr-4">
                  {isEditing ? (
                    <input
                      ref={nameRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                      className="w-full rounded-lg border border-brand-300 px-2.5 py-1.5 text-sm outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-300"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                        {r.name.charAt(0)}
                      </span>
                      <span className="text-gray-800">{r.name}</span>
                    </div>
                  )}
                </td>
                {/* เบอร์โทร */}
                <td className="py-3 pr-4">
                  {isEditing ? (
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                      className="w-full rounded-lg border border-brand-300 px-2.5 py-1.5 text-sm outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-300"
                    />
                  ) : (
                    <span className="text-gray-600">{r.phone}</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge variant={r.status} />
                </td>
                <td className="py-3 pr-4 text-gray-600">{r.date}</td>
                <td className="py-3 pr-4 text-gray-600">{r.time}</td>
                <td className="py-3 pr-4">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); saveEdit(); }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                        aria-label="บันทึก"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                        aria-label="ยกเลิก"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Headphones className="h-4 w-4" />
                        ฟังสาย
                      </Button>
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        className="invisible flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-brand-50 hover:text-brand-700 group-hover:visible transition-colors"
                        aria-label="แก้ไข"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    disabled={callingId !== null}
                    onClick={() => handleManualCall(r)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                      callingId === r.id
                        ? "bg-brand-100 text-brand-400 cursor-not-allowed"
                        : callingId !== null
                          ? "border border-gray-200 text-gray-300 cursor-not-allowed"
                          : "bg-brand-700 text-white hover:bg-brand-900 active:scale-95",
                    )}
                  >
                    {callingId === r.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Phone className="h-3.5 w-3.5" />
                    )}
                    {callingId === r.id ? "กำลังโทร..." : "โทร"}
                  </button>
                </td>
              </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
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
