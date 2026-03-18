"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  GraduationCap, 
  LayoutDashboard, 
  Settings, 
  Trophy, 
  Users, 
  FileText
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { Spinner } from "@/components/ui/spinner";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/school",
    icon: LayoutDashboard,
  },
  {
    title: "Teachers",
    href: "/school/teachers",
    icon: Users,
  },
  {
    title: "Students",
    href: "/school/students",
    icon: GraduationCap,
  },
  {
    title: "Parents",
    href: "/school/parents",
    icon: Users,
  },
  {
    title: "Quizzes",
    href: "/school/quizzes",
    icon: FileText,
  },
  {
    title: "Leaderboard",
    href: "/school/leaderboard",
    icon: Trophy,
  },
  {
    title: "Settings",
    href: "/school/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const { loading } = useRequireRole(ROLES.SCHOOL);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <Spinner />
    </div>;
  }

  return (
    <div className="flex min-h-screen relative bg-zinc-50 dark:bg-zinc-900 border-t">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-white dark:bg-zinc-950 p-4 h-screen sticky top-0">
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold leading-tight">ABC School</h2>
            <span className="text-xs text-muted-foreground font-medium">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {sidebarLinks.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/school");
            
            // Note: Since everything is under /school currently, we might need a more robust active check later if routes expand,
            // but for this UI test we assume /school is Dashboard.

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-5 mt-4 border border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-sm mb-1">Upgrade to Pro</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Get unlimited access to all features
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm">
              Upgrade Now
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-zinc-900 min-h-screen">
        {children}
      </main>
    </div>
  );
}
