import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/vocera/AppLayout";

export const Route = createFileRoute("/campaign/create")({
  head: () => ({ meta: [{ title: "Create campaign — Vocera" }] }),
  component: CampaignCreatePage,
});

function CampaignCreatePage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create campaign</h1>
      </div>
    </AppLayout>
  );
}
