import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/vocera/AppLayout";

export const Route = createFileRoute("/campaign/$id/")({
  head: () => ({ meta: [{ title: "Campaign — Vocera" }] }),
  component: CampaignDetailPage,
});

function CampaignDetailPage() {
  const { id } = Route.useParams();
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Campaign {id}</h1>
      </div>
    </AppLayout>
  );
}
