import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, LayoutGrid } from "lucide-react";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { CampaignCard, type Campaign } from "@/components/vocera/CampaignCard";
import { Skeleton } from "@/components/ui/skeleton";
// import store เพื่ออ่าน campaigns จาก localStorage
import * as campaignStore from "@/lib/campaignStore";

export const Route = createFileRoute("/campaign/")({
  head: () => ({ meta: [{ title: "แคมเปญ — Vocera" }] }),
  component: CampaignListPage,
});

// ไม่มี hardcoded campaigns แล้ว — ย้ายไปอยู่ใน campaignStore.ts ทั้งหมด

function CampaignListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // useState(() => fn) คือ "lazy initializer"
  // fn จะถูกเรียกแค่ครั้งเดียวตอน component โหลด ไม่ใช่ทุก re-render
  // อ่านจาก localStorage ผ่าน campaignStore.getAll()
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => campaignStore.getAll());

  useEffect(() => {
    const t = setTimeout(() => {
      // โหลด campaigns อีกครั้งหลัง skeleton หายไป
      // เผื่อกรณีที่ navigate มาจากหน้า create (มีแคมเปญใหม่เพิ่ม)
      setCampaigns(campaignStore.getAll());
      setLoading(false);
    }, 400);
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
