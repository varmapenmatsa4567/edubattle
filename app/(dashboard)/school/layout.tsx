"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Building2, 
  GraduationCap, 
  LayoutDashboard, 
  Settings, 
  Trophy, 
  Users, 
  FileText,
  Search,
  Bell
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabaseClient";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { getSchoolDetails } from "@/services/schoolService";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/school",
    icon: LayoutDashboard,
  },
  {
    title: "Classes",
    href: "/school/classes",
    icon: Building2,
  },
  {
    title: "Subjects",
    href: "/school/subjects",
    icon: FileText,
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
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const { loading, user } = useRequireRole(ROLES.SCHOOL);
  const [school, setSchool] = useState<any>(null);

  useEffect(() => {
    const fetchSchool = async () => {

      const school = await getSchoolDetails(user?.id);
      setSchool(school);
    }
    fetchSchool();
  }, [user])

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
            <h2 className="text-lg font-bold leading-tight">{school?.name}</h2>
            <span className="text-xs text-muted-foreground font-medium">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {sidebarLinks.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/school");

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
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="flex flex-col md:flex-row items-center justify-between p-4 md:px-8 bg-white dark:bg-zinc-950 border-b gap-4">
          <div className="relative w-full md:w-1/2 lg:w-1/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students, teachers, or quizzes..."
              className="w-full pl-8 bg-muted/50 border-none rounded-lg"
            />
          </div>
          <div className="flex items-center space-x-6 w-full md:w-auto justify-end">
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs text-muted-foreground">School Administrator</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 bg-purple-500 cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all outline-none">
                    <AvatarFallback className="bg-purple-500 text-white font-semibold">AU</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 mt-1">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/school/profile")} className="cursor-pointer">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/50">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-zinc-900 p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
