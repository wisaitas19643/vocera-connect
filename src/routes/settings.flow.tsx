import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/flow")({
  beforeLoad: () => {
    throw redirect({ to: "/settings/call-defaults" });
  },
  component: () => null,
});
