import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/vocera/AuthCard";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Ringo" }] }),
  component: () => <AuthCard mode="login" />,
});
