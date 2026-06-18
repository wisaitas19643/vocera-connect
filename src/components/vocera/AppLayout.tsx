import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, User, Settings as SettingsIcon, LogOut, Coins, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { PointsProvider, usePoints } from "@/lib/PointsContext";
import { RequireAuth } from "@/components/vocera/RequireAuth";
import logoUrl from "@/assets/logo.png";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  matchPrefix?: string;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutGrid className="h-5 w-5" /> },
  { to: "/campaign", label: "Campaign", icon: <User className="h-5 w-5" />, matchPrefix: "/campaign" },
  { to: "/analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" />, matchPrefix: "/analytics" },
  { to: "/settings", label: "Settings", icon: <SettingsIcon className="h-5 w-5" />, matchPrefix: "/settings" },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <RequireAuth>
      <AppLayoutInner>{children}</AppLayoutInner>
    </RequireAuth>
  );
}

function SidebarPoints() {
  const { pointsBalance } = usePoints();
  return (
    <div className="mb-3 rounded-xl bg-white/60 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Coins className="h-3.5 w-3.5 text-brand-500" />
          <span>Points Balance</span>
        </div>
        <span className="text-xs font-semibold text-brand-700">
          {pointsBalance !== null ? `${pointsBalance.toLocaleString()} pts` : "— pts"}
        </span>
      </div>
    </div>
  );
}

function AppLayoutInner({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user } = useAuth();

  const email = user?.email ?? "";
  const initial = (user?.user_metadata?.full_name ?? email).charAt(0).toUpperCase() || "U";
  const displayName = user?.user_metadata?.full_name ?? email;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <PointsProvider userId={user?.id}>
      <div className="flex min-h-screen w-full bg-white">
        <aside
          className="fixed left-0 top-0 flex h-screen flex-col bg-brand-50 px-4 py-6"
          style={{ width: 240 }}
        >
          <Link to="/dashboard" className="mb-8 flex items-center gap-2 px-2">
            <img src={logoUrl} alt="Ringo" className="h-8 w-8 object-contain" />
            <span className="text-base font-semibold text-brand-700">Ringo</span>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const active = item.matchPrefix
                ? pathname.startsWith(item.matchPrefix)
                : pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-brand-100 font-semibold text-brand-700"
                      : "text-gray-500 hover:bg-brand-100",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <SidebarPoints />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-xl bg-white/60 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">
                {initial}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-gray-800">{displayName}</span>
                {user?.user_metadata?.full_name && (
                  <span className="truncate text-xs text-gray-400">{email}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </button>
          </div>
        </aside>

        <main className="flex-1 bg-white" style={{ marginLeft: 240 }}>
          {children}
        </main>
      </div>
    </PointsProvider>
  );
}

export default AppLayout;
