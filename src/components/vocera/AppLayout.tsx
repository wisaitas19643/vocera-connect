import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, User, Settings as SettingsIcon, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  matchPrefix?: string;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutGrid className="h-5 w-5" /> },
  { to: "/campaign", label: "Campaign", icon: <User className="h-5 w-5" />, matchPrefix: "/campaign" },
  { to: "/settings", label: "Settings", icon: <SettingsIcon className="h-5 w-5" />, matchPrefix: "/settings" },
];

interface AppLayoutProps {
  children: ReactNode;
  userName?: string;
  points?: number;
}

export function AppLayout({ children, userName = "User", points = 1250 }: AppLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-white">
      <aside
        className="fixed left-0 top-0 flex h-screen flex-col bg-brand-50 px-4 py-6"
        style={{ width: 240 }}
      >
        <Link to="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-white shadow-brand">
            <Phone className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold text-brand-700">Voice Confirm</span>
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

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/60 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">
            {initial}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">{userName}</span>
            <span className="text-xs font-semibold text-brand-700">
              {points.toLocaleString()} point
            </span>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-white" style={{ marginLeft: 240 }}>
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
