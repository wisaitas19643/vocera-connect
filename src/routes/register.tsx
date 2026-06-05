import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — Vocera" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-brand-700">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Join Vocera to launch outbound campaigns.</p>
        <p className="mt-6 text-sm text-gray-400">Register form coming soon.</p>
      </div>
    </div>
  );
}
