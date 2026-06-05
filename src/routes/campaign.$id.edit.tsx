import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/vocera/AppLayout";

export const Route = createFileRoute("/campaign/$id/edit")({
  head: () => ({ meta: [{ title: "Edit campaign — Vocera" }] }),
  component: CampaignEditPage,
});

function CampaignEditPage() {
  const { id } = Route.useParams();
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit campaign {id}</h1>
      </div>
    </AppLayout>
  );
}
