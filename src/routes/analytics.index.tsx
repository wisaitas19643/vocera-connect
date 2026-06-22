import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  Clock,
} from "lucide-react";

import { AppLayout } from "@/components/vocera/AppLayout";
import { KPICard } from "@/components/vocera/KPICard";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/analytics/")({
  head: () => ({ meta: [{ title: "Analytics — Ringo" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [totalCalls, setTotalCalls] = useState(0);
  const [successRate, setSuccessRate] = useState("0");
  const [avgPerDay, setAvgPerDay] = useState(0);
  const [avgDuration, setAvgDuration] = useState("—");
  const [dailyData, setDailyData] = useState<{ day: string; calls: number }[]>([]);
  const [campaignStats, setCampaignStats] = useState<{ name: string; calls: number; success: number; rate: number }[]>([]);

  useEffect(() => {
    async function load() {
      const [{ data: logs }, { data: camps }] = await Promise.all([
        supabase.from("call_logs").select("status, duration_seconds, started_at, campaign_id"),
        supabase.from("campaigns").select("id, name"),
      ]);

      if (!logs) return;

      // KPI: total + success rate
      const total = logs.length;
      const confirmed = logs.filter((l) => l.status === "confirmed").length;
      setTotalCalls(total);
      setSuccessRate(total > 0 ? ((confirmed / total) * 100).toFixed(1) : "0");

      // KPI: avg duration
      const withDuration = logs.filter((l) => l.duration_seconds != null);
      if (withDuration.length > 0) {
        const avg = Math.round(
          withDuration.reduce((sum, l) => sum + (l.duration_seconds ?? 0), 0) / withDuration.length,
        );
        setAvgDuration(`${Math.floor(avg / 60)}m ${avg % 60}s`);
      }

      // Chart: calls per day (last 7 days)
      const DAY_NAMES = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
      const today = new Date();
      const buckets = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return { day: DAY_NAMES[d.getDay()], dateStr: d.toDateString(), calls: 0 };
      });

      logs.forEach((log) => {
        if (!log.started_at) return;
        const bucket = buckets.find((b) => b.dateStr === new Date(log.started_at!).toDateString());
        if (bucket) bucket.calls++;
      });

      const daily = buckets.map(({ day, calls }) => ({ day, calls }));
      setDailyData(daily);
      setAvgPerDay(Math.round(daily.reduce((s, d) => s + d.calls, 0) / 7));

      // Campaign performance table
      if (camps) {
        const stats = camps
          .map((c) => {
            const campLogs = logs.filter((l) => l.campaign_id === c.id);
            const success = campLogs.filter((l) => l.status === "confirmed").length;
            const rate =
              campLogs.length > 0
                ? parseFloat(((success / campLogs.length) * 100).toFixed(1))
                : 0;
            return { name: c.name, calls: campLogs.length, success, rate };
          })
          .filter((c) => c.calls > 0);
        setCampaignStats(stats);
      }
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl animate-page-in px-8 py-8">
        <h1 className="text-2xl font-bold text-brand-700">สถิติ</h1>

        {/* KPI cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <KPICard
            icon={<PhoneCall className="h-5 w-5" />}
            value={totalCalls}
            label="สายทั้งหมด"
            subText="ทุกแคมเปญ"
          />
          <KPICard
            icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
            value={`${successRate}%`}
            label="อัตราสำเร็จ"
            subText="ยืนยันแล้ว"
          />
          <KPICard
            icon={<TrendingUp className="h-5 w-5 text-brand-500" />}
            value={avgPerDay}
            label="เฉลี่ยต่อวัน"
            subText="7 วันล่าสุด"
          />
          <KPICard
            icon={<Clock className="h-5 w-5 text-violet-500" />}
            value={avgDuration}
            label="ระยะเวลาเฉลี่ย"
            subText="ต่อสาย"
          />
        </div>

        {/* Bar chart */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
          <h3 className="mb-5 font-semibold text-gray-700">การโทรต่อวัน (7 วันล่าสุด)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  width={36}
                />
                <Tooltip
                  cursor={{ fill: "#f5f3ff" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #ede9fe",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="calls" name="สาย" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign performance table */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
          <h3 className="mb-4 font-semibold text-gray-700">ประสิทธิภาพแคมเปญ</h3>
          {campaignStats.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">ยังไม่มีข้อมูลการโทร</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-medium text-gray-400">
                    <th className="pb-3 pr-4 font-medium">แคมเปญ</th>
                    <th className="pb-3 pr-4 text-right font-medium">สาย</th>
                    <th className="pb-3 pr-4 text-right font-medium">สำเร็จ</th>
                    <th className="pb-3 font-medium">อัตรา</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignStats.map((c) => (
                    <tr key={c.name} className="border-b border-gray-50 hover:bg-brand-50">
                      <td className="py-3.5 pr-4 text-gray-800">{c.name}</td>
                      <td className="py-3.5 pr-4 text-right text-gray-600">{c.calls.toLocaleString()}</td>
                      <td className="py-3.5 pr-4 text-right text-green-600 font-medium">{c.success.toLocaleString()}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-brand-100">
                            <div
                              className="h-full rounded-full bg-brand-700"
                              style={{ width: `${c.rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-brand-700">{c.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
