"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  FileText,
  Sword,
  Trophy,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Flame,
  Award,
  Loader2,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getStudentDetails } from "@/services/studentService";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, user } = useRequireRole(ROLES.STUDENT);
  const [student, setStudent] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const location = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchStudent = async () => {
      if (user?.id) {
        const data = await getStudentDetails(user.id);
        setStudent(data);
      }
    };
    fetchStudent();
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out. Please try again.");
      setIsLoggingOut(false);
    } else {
      toast.success("Signed out successfully!");
      router.push("/login");
    }
  };

  const studentName = student?.name || user?.email?.split("@")[0] || "Student";
  const gradeLabel = student?.class
    ? `Grade ${student.class.class_name}-${student.class.section}`
    : "Student";

  const nextLevelXP = 3000;
  const xpPoints = 1850; // Will be dynamic when XP tracking is added
  const level = 7;
  const xpProgress = (xpPoints / nextLevelXP) * 100;
  const xpToNextLevel = nextLevelXP - xpPoints;
  const streakDays = 12;

  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/student', badge: null, highlight: false },
    { icon: FileText, label: 'My Assignments', path: '/student/assignments', badge: 3, highlight: false },
    { icon: Sword, label: 'Play Game', path: '/student/play', badge: null, highlight: true },
    { icon: Trophy, label: 'Leaderboard', path: '/student/leaderboard', badge: null, highlight: false },
    { icon: BookOpen, label: 'Study Room', path: '/student/study-room', badge: null, highlight: false },
    { icon: Bell, label: 'Notifications', path: '/student/notifications', badge: 5, highlight: false },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0A1628] text-white transition-transform duration-300 flex flex-col`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold text-[#FF6B35]">EduBattle</h1>
            <p className="text-xs text-gray-400 mt-1">Competitive Learning</p>
          </div>

          {/* Student Info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] flex items-center justify-center text-white font-bold text-xl">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{studentName}</p>
                <p className="text-sm text-gray-400">{gradeLabel}</p>
              </div>
            </div>
            <div className="mt-3 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-lg px-3 py-1.5 inline-flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FFB347]" />
              <span className="text-sm font-medium">Level {level}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navigationItems.map((item, index) => {
              const isActive = item.path === '/student'
                ? location === '/student'
                : item.path !== '#' && location.startsWith(item.path);

              return (
                <Link
                  key={index}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-[#FF6B35]/10 border-r-4 border-[#FF6B35] text-white'
                      : item.highlight
                      ? 'hover:bg-[#FF6B35]/5 text-[#FF6B35]'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-[#FF6B35] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-white/10">
            <button className="w-full flex items-center gap-3 px-6 py-3 text-left text-gray-300 hover:bg-white/5 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-6 py-3 text-left text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-60"
            >
              {isLoggingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
              <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                  {getGreeting()}, {studentName.split(' ')[0]}!
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Flame className="w-4 h-4 text-[#FF6B35]" />
                  <span className="text-sm text-gray-600 font-medium">
                    {streakDays}-day streak 🔥
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/student/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B35] rounded-full"></span>
              </Link>
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Level {level}</p>
                  <p className="text-xs text-gray-500">{xpPoints} XP</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] flex items-center justify-center text-white font-bold">
                  {studentName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress to Level {level + 1}</span>
              <span className="text-sm font-semibold text-[#FF6B35]">
                {xpToNextLevel} XP to go
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347] rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
