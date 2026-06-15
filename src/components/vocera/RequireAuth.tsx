import type { ReactNode } from "react";

// DEV ONLY — auth bypassed. Restore original to re-enable.
export function RequireAuth({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
