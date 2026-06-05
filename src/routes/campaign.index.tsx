import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { AppLayout } from "@/components/vocera/AppLayout";
import { Button } from "@/components/vocera/Button";
import { CampaignCard, type Campaign } from "@/components/vocera/CampaignCard";

export const Route = createFileRoute("/campaign/")({
  head: () => ({ meta: [{ title: "แคมเปญ — Vocera" }] }),
  component: CampaignListPage,
});

const campaigns: Campaign[] = [
  {
    id: "1",
    name: "ประชุมผู้ถือหุ้น ประจำปี 2026",
    date: "12/04/2026",
    time: "10:45",
    total: 300,
    confirmed: 180,
    percent: 75,
  },
  {
    id: "2",
    name: "อบรมพนักงานใหม่ รุ่นที่ 12",
    date: "13/04/2026",
    time: "11:00",
    total: 125,
    confirmed: 90,
    percent: 80,
  },
  {
    id: "3",
    name: "สัมมนาเทคโนโลยี AI",
    date: "12/04/2026",
    time: "10:45",
    total: 1000,
    confirmed: 250,
    percent: 39.52,
  },
];

function CampaignListPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-700">แคมเปญ</h1>
          <Button
            variant="primary"
            onClick={() => navigate({ to: "/campaign/create" })}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            สร้างแคมเปญ
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
