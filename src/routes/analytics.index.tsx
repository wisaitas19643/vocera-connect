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

export const Route = createFileRoute("/analytics/")({
  head: () => ({ meta: [{ title: "Analytics — Ringo" }] }),
  component: AnalyticsPage,
});

const dailyCalls = [
  { day: "Mon", calls: 185 },
  { day: "Tue", calls: 210 },
  { day: "Wed", calls: 198 },
  { day: "Thu", calls: 240 },
  { day: "Fri", calls: 220 },
  { day: "Sat", calls: 175 },
  { day: "Sun", calls: 197 },
];

const campaigns = [
  { name: "ประชุมผู้ถือหุ้น ประจำปี 2026", calls: 480, success: 360, rate: 75 },
  { name: "อบรมพนักงานใหม่ รุ่นที่ 12", calls: 250, success: 200, rate: 80 },
  { name: "สัมมนาเทคโนโลยี AI", calls: 695, success: 275, rate: 39.5 },
];

function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl animate-page-in px-8 py-8">
        <h1 className="text-2xl font-bold text-brand-700">Analytics</h1>

        {/* KPI cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <KPICard
            icon={<PhoneCall className="h-5 w-5" />}
            value={1425}
            label="Total Calls"
            subText="ทุกแคมเปญ"
          />
          <KPICard
            icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
            value="36.5%"
            label="Success Rate"
            subText="ยืนยันแล้ว"
          />
          <KPICard
            icon={<TrendingUp className="h-5 w-5 text-brand-500" />}
            value={203}
            label="Avg / Day"
            subText="7 วันล่าสุด"
          />
          <KPICard
            icon={<Clock className="h-5 w-5 text-violet-500" />}
            value="1m 24s"
            label="Avg Duration"
            subText="ต่อสาย"
          />
        </div>

        {/* Bar chart */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
          <h3 className="mb-5 font-semibold text-gray-700">Calls per Day (7 days)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCalls} barSize={32}>
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
                <Bar dataKey="calls" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign performance table */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
          <h3 className="mb-4 font-semibold text-gray-700">Campaign Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-medium text-gray-400">
                  <th className="pb-3 pr-4 font-medium">Campaign</th>
                  <th className="pb-3 pr-4 text-right font-medium">Calls</th>
                  <th className="pb-3 pr-4 text-right font-medium">Success</th>
                  <th className="pb-3 font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
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
                        <span className="text-xs font-semibold text-brand-700">
                          {c.rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
