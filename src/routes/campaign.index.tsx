import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/vocera/AppLayout";

export const Route = createFileRoute("/campaign/")({
  head: () => ({ meta: [{ title: "Campaigns — Vocera" }] }),
  component: CampaignListPage,
});

function CampaignListPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Campaigns</h1>
      </div>
    </AppLayout>
  );
}
