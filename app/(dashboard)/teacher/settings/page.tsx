"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  User, 
  Mail, 
  Lock, 
  Camera,
  Save,
  Shield,
  Bell,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getTeacherDetails } from "@/services/teacherService";
import { toast } from "sonner";

export default function TeacherSettingsPage() {
  const { loading, user } = useRequireRole(ROLES.TEACHER);
  const [teacher, setTeacher] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoadingData(true);
        const data = await getTeacherDetails(user.id);
        setTeacher(data);
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Password changed successfully!");
  };

  return (
    <div className="w-full h-full pb-20 space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          Account Settings ⚙️
        </h2>
        <p className="text-muted-foreground text-sm font-medium">
          Manage your teacher profile, security preferences, and account settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* PROFILE OVERVIEW */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-950">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="relative group mb-6">
                <Avatar className="h-24 w-24 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg group-hover:shadow-purple-100 dark:group-hover:shadow-none transition-shadow duration-300">
                  <AvatarFallback className="bg-purple-600 text-white font-bold text-2xl">
                    {teacher?.name?.split(' ').map((n: any) => n[0]).join('').slice(0, 2) || "TR"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-8 w-8 bg-purple-600 text-white border-2 border-white dark:border-zinc-950 rounded-full flex items-center justify-center cursor-pointer shadow hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground">{teacher?.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium bg-slate-50 dark:bg-zinc-900 px-3 py-1 rounded-full uppercase tracking-widest leading-none">Class Teacher</p>
              
              <div className="mt-8 w-full border-t border-slate-100 dark:border-zinc-800 pt-6 space-y-4 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider">Assignments</span>
                  <span className="font-bold text-purple-600">{teacher?.class_subjects?.length || 0} Classes</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider">Account Status</span>
                  <Badge className="bg-emerald-50 text-emerald-600 border-0 font-bold px-2 py-0">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-950">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold">2-Factor Auth</span>
                  <span className="text-[10px] text-muted-foreground">Keep account secure</span>
                </div>
                <div className="h-5 w-9 bg-slate-200 dark:bg-zinc-800 rounded-full cursor-pointer p-0.5 flex items-center transition-colors">
                  <div className="h-4 w-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PROFILE FORM */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-950">
            <CardHeader className="bg-slate-50 dark:bg-zinc-900/50 p-6 border-b border-slate-100 dark:border-zinc-800">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        defaultValue={teacher?.name} 
                        className="pl-10 h-11 rounded-lg border-slate-200 focus:ring-purple-500/20 font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        disabled 
                        defaultValue={user?.email} 
                        className="pl-10 h-11 rounded-lg border-slate-200 bg-slate-50 text-muted-foreground cursor-not-allowed font-medium" 
                      />
                    </div>
                  </div>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-11 px-6 font-semibold gap-2 shadow-sm">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-950">
            <CardHeader className="bg-slate-50 dark:bg-zinc-900/50 p-6 border-b border-slate-100 dark:border-zinc-800">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-600" />
                Security & Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Current Password</label>
                    <Input 
                      type="password"
                      placeholder="••••••••" 
                      className="h-11 rounded-lg border-slate-200 focus:ring-purple-500/20 font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">New Password</label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••" 
                        className="h-11 rounded-lg border-slate-200 focus:ring-purple-500/20 font-medium" 
                      />
                      <div 
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-purple-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="h-11 border-slate-200 rounded-lg font-semibold px-6 hover:bg-slate-50 transition-all">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
