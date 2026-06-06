import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, LayoutGrid } from "lucide-react";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { CampaignCard, type Campaign } from "@/components/vocera/CampaignCard";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/campaign/")({
  head: () => ({ meta: [{ title: "แคมเปญ — Vocera" }] }),
  component: CampaignListPage,
});

// mock contacts แยกตาม campaign ID
// ในระบบจริงจะดึงจาก API แทน
const contactsByCampaign: Record<string, Campaign["contacts"]> = {
  "1": [
    { id: "c1-1", name: "กฤษฎา มานะธรรม", phone: "081-234-5678" },
    { id: "c1-2", name: "พงศกร รัตนสิริ", phone: "089-111-2233" },
    { id: "c1-3", name: "ชนากานต์ ใจดี", phone: "082-555-7788" },
    { id: "c1-4", name: "อรทัย ศรีสุข", phone: "086-222-3344" },
    { id: "c1-5", name: "ธนกร สุขเกษม", phone: "084-987-6543" },
    { id: "c1-6", name: "นภัสสร พงษ์ไพศาล", phone: "087-345-2211" },
  ],
  "2": [
    { id: "c2-1", name: "วิภาวี ตั้งใจ", phone: "088-321-9988" },
    { id: "c2-2", name: "เกียรติศักดิ์ พรชัย", phone: "085-654-3210" },
    { id: "c2-3", name: "สมชาย ใจกล้า", phone: "083-444-5566" },
    { id: "c2-4", name: "อาทิตย์ ส่องแสง", phone: "082-101-2020" },
  ],
  "3": [
    { id: "c3-1", name: "ปวีณา วงศ์วิทย์", phone: "081-998-1122" },
    { id: "c3-2", name: "ธนกร สุขเกษม", phone: "084-987-6543" },
    { id: "c3-3", name: "นภัสสร พงษ์ไพศาล", phone: "087-345-2211" },
    { id: "c3-4", name: "สมหมาย ดีใจ", phone: "090-123-4567" },
    { id: "c3-5", name: "รัตนา สดใส", phone: "091-234-5678" },
  ],
};

// เพิ่ม contacts เข้าไปใน campaign object แต่ละอัน
const campaigns: Campaign[] = [
  { id: "1", name: "ประชุมผู้ถือหุ้น ประจำปี 2026", date: "12/04/2026", time: "10:45", total: 300, confirmed: 180, percent: 75, contacts: contactsByCampaign["1"] },
  { id: "2", name: "อบรมพนักงานใหม่ รุ่นที่ 12", date: "13/04/2026", time: "11:00", total: 125, confirmed: 90, percent: 80, contacts: contactsByCampaign["2"] },
  { id: "3", name: "สัมมนาเทคโนโลยี AI", date: "12/04/2026", time: "10:45", total: 1000, confirmed: 250, percent: 39.52, contacts: contactsByCampaign["3"] },
];

function CampaignListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl animate-page-in px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-700">แคมเปญ</h1>
          <Button variant="primary" onClick={() => navigate({ to: "/campaign/create" })} className="gap-1">
            <Plus className="h-4 w-4" />
            สร้างแคมเปญ
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {loading ? (
            <>
              <CampaignCardSkeleton />
              <CampaignCardSkeleton />
            </>
          ) : campaigns.length === 0 ? (
            <EmptyCampaigns onCreateClick={() => navigate({ to: "/campaign/create" })} />
          ) : (
            campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function EmptyCampaigns({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 shadow-card">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50">
        <LayoutGrid className="h-10 w-10 text-brand-300" />
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-700">ยังไม่มีแคมเปญ</p>
      <p className="mt-1 text-sm text-gray-400">เริ่มสร้างแคมเปญแรกของคุณเพื่อเริ่มต้นการโทร</p>
      <Button variant="primary" className="mt-6" onClick={onCreateClick}>
        สร้างแคมเปญแรก
      </Button>
    </div>
  );
}

function CampaignCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
      <div className="flex items-start gap-4 pr-28">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
      <Skeleton className="mt-5 h-2 w-full rounded-full" />
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}
