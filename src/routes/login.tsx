import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Vocera" }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-brand-700">Vocera</h1>
        <p className="mt-1 text-sm text-gray-500">The new era of outbound calling.</p>
        <p className="mt-6 text-sm text-gray-400">Login form coming soon.</p>
      </div>
    </div>
  );
}
