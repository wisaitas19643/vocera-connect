import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  BarChart3,
  CheckCircle2,
  XCircle,
  PhoneMissed,
  Clock,
  Headphones,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { KPICard } from "@/components/vocera/KPICard";
import { StatusBadge, type StatusVariant } from "@/components/vocera/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import * as campaignStore from "@/lib/campaignStore";
import type { Campaign } from "@/components/vocera/CampaignCard";

export const Route = createFileRoute("/campaign/$id/")({
  head: () => ({ meta: [{ title: "Campaign — Ringo" }] }),
  component: CampaignDetailPage,
});

type Filter = "all" | StatusVariant;

interface ActivityRow {
  id: string;
  name: string;
  phone: string;
  status: StatusVariant;
  date: string;
  time: string;
}

function CampaignDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    setCampaign(undefined);
    campaignStore.getById(id).then((c) => setCampaign(c ?? null));
  }, [id]);

  const loading = campaign === undefined;
  const notFound = campaign === null;

  const activities = useMemo<ActivityRow[]>(() => {
    if (!campaign?.contacts) return [];
    return campaign.contacts.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      status: "pending",
      date: "-",
      time: "-",
    }));
  }, [campaign]);

  const filtered = useMemo(
    () => (filter === "all" ? activities : activities.filter((a) => a.status === filter)),
    [filter, activities],
  );
  const visible = filtered.slice(0, 10);
  const hasMore = filtered.length > 10;
  const toggle = (next: Filter) => setFilter((cur) => (cur === next ? "all" : next));

  const kpis = {
    all: campaign?.total ?? 0,
    confirmed: campaign?.confirmed ?? 0,
    rejected: 0,
    missed: 0,
    pending: Math.max(0, (campaign?.total ?? 0) - (campaign?.confirmed ?? 0)),
  };

  const response = [
    { key: "confirmed" as const, label: "ยืนยัน", value: numPct(kpis.confirmed, kpis.all), color: "#10b981" },
    { key: "pending" as const, label: "รอสาย", value: numPct(kpis.pending, kpis.all), color: "#3b82f6" },
  ].filter((r) => r.value > 0);

  if (notFound) {
    return (
      <AppLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-gray-500">ไม่พบแคมเปญนี้</p>
          <Button variant="secondary" onClick={() => navigate({ to: "/campaign" })}>
            กลับไปรายการแคมเปญ
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl animate-page-in px-8 py-8">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/campaign" })}>
            <ChevronLeft className="h-4 w-4" />
            กลับ
          </Button>
          {loading ? (
            <Skeleton className="h-7 w-64" />
          ) : (
            <h1 className="text-2xl font-bold text-brand-700">{campaign!.name}</h1>
          )}
        </div>

        {loading ? (
          <CampaignDetailSkeleton />
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              <KPICard icon={<BarChart3 className="h-5 w-5" />} value={kpis.all} label="การโทรทั้งหมด" subText="แคมเปญนี้" isActive={filter === "all"} onClick={() => setFilter("all")} />
              <KPICard icon={<CheckCircle2 className="h-5 w-5 text-green-600" />} value={kpis.confirmed} label="ยืนยัน" subText={`${fmtPct(numPct(kpis.confirmed, kpis.all))}% จากทั้งหมด`} isActive={filter === "confirmed"} onClick={() => toggle("confirmed")} />
              <KPICard icon={<XCircle className="h-5 w-5 text-red-500" />} value={kpis.rejected} label="ปฏิเสธ" subText={`${fmtPct(numPct(kpis.rejected, kpis.all))}% จากทั้งหมด`} isActive={filter === "rejected"} onClick={() => toggle("rejected")} />
              <KPICard icon={<PhoneMissed className="h-5 w-5 text-yellow-500" />} value={kpis.missed} label="ไม่รับสาย" subText={`${fmtPct(numPct(kpis.missed, kpis.all))}% จากทั้งหมด`} isActive={filter === "missed"} onClick={() => toggle("missed")} />
              <KPICard icon={<Clock className="h-5 w-5 text-blue-500" />} value={kpis.pending} label="รอสาย" subText={`${fmtPct(numPct(kpis.pending, kpis.all))}% จากทั้งหมด`} isActive={filter === "pending"} onClick={() => toggle("pending")} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
              <div className="rounded-2xl bg-white p-6 shadow-card lg:col-span-3">
                <h3 className="mb-4 font-semibold text-gray-700">อัตราสำเร็จ</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{campaign!.name}</span>
                  <span className="text-right text-xl font-bold text-brand-700">
                    {fmtPct(campaign!.percent)}%
                  </span>
                </div>
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-brand-100">
                  <div className="h-full rounded-full bg-brand-700" style={{ width: `${Math.min(100, campaign!.percent)}%` }} />
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-card lg:col-span-2">
                <h3 className="mb-4 font-semibold text-gray-700">ผลตอบรับ</h3>
                {response.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="h-44 w-44 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={response} dataKey="value" nameKey="label" innerRadius={60} outerRadius={90} stroke="none" paddingAngle={2}>
                            {response.map((d) => (
                              <Cell key={d.key} fill={d.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="flex flex-1 flex-col gap-2.5">
                      {response.map((d) => (
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
                ) : (
                  <p className="py-8 text-center text-sm text-gray-400">ยังไม่มีข้อมูลผลตอบรับ</p>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
              <h3 className="mb-4 font-semibold text-gray-700">รายชื่อแขก</h3>
              <div className="overflow-x-auto">
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
                        <td className="py-4 pr-4 text-gray-400">{r.date}</td>
                        <td className="py-4 pr-4 text-gray-400">{r.time}</td>
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
                          ไม่มีรายชื่อแขก
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
                    params={{ id }}
                    className="text-sm font-medium text-brand-700 hover:underline"
                  >
                    ดูทั้งหมด →
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function CampaignDetailSkeleton() {
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
            <Skeleton className="mt-1 h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl bg-white p-6 shadow-card lg:col-span-3">
          <Skeleton className="mb-4 h-5 w-32" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-3 h-3 w-full rounded-full" />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-card lg:col-span-2">
          <Skeleton className="mb-4 h-5 w-24" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-44 w-44 rounded-full" />
            <div className="flex flex-1 flex-col gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
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

function numPct(part: number, total: number): number {
  if (!total) return 0;
  return parseFloat(((part / total) * 100).toFixed(1));
}

function fmtPct(v: number): string {
  return v.toFixed(v % 1 === 0 ? 0 : 1);
}
