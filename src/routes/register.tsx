import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/vocera/AuthCard";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — Ringo" }] }),
  component: () => <AuthCard mode="register" />,
});
