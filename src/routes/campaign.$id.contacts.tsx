import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/vocera/AppLayout";

export const Route = createFileRoute("/campaign/$id/contacts")({
  head: () => ({ meta: [{ title: "Contacts — Vocera" }] }),
  component: CampaignContactsPage,
});

function CampaignContactsPage() {
  const { id } = Route.useParams();
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Contacts — Campaign {id}</h1>
      </div>
    </AppLayout>
  );
}
