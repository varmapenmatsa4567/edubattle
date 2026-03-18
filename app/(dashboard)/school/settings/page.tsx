"use client";

import React from "react";
import { Settings, User, Building2, Shield, Camera, Calendar, LogOut, CheckCircle2 } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { loading, user } = useRequireRole(ROLES.SCHOOL);
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="w-full h-full pb-20 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <span className="text-3xl">⚙️</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage your profile and school information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: TABS */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full bg-white dark:bg-zinc-950 border rounded-xl h-14 p-1 shadow-sm mb-6 flex justify-start overflow-x-auto">
              <TabsTrigger 
                value="profile" 
                className="flex-1 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/20 dark:data-[state=active]:text-purple-400 rounded-lg h-full transition-all text-muted-foreground font-semibold"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="school" 
                className="flex-1 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/20 dark:data-[state=active]:text-purple-400 rounded-lg h-full transition-all text-muted-foreground font-semibold"
              >
                <Building2 className="w-4 h-4 mr-2" />
                School
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex-1 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/20 dark:data-[state=active]:text-purple-400 rounded-lg h-full transition-all text-muted-foreground font-semibold"
              >
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* PROFILE TAB */}
            <TabsContent value="profile" className="space-y-6 mt-0">
              <Card className="rounded-xl shadow-sm border-muted/50 overflow-hidden bg-white dark:bg-zinc-950">
                <CardContent className="p-6 md:p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Profile Information</h3>
                    
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-md rounded-full bg-purple-100 dark:bg-zinc-800">
                          <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
                          <AvatarFallback className="text-2xl font-bold text-purple-600">AU</AvatarFallback>
                        </Avatar>
                        <button className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2.5 shadow-md transition-colors">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold">Profile Photo</p>
                        <p className="text-sm text-muted-foreground mt-0.5 mb-3">Upload a new avatar. Recommended size: 400x400px</p>
                        <Button variant="outline" className="w-fit" size="sm">
                          Upload New Photo
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-muted/30 pt-6 space-y-4">
                    <div className="space-y-2.5">
                      <Label htmlFor="fullname" className="text-sm font-semibold">Full Name</Label>
                      <Input id="fullname" defaultValue="Admin User" className="h-11 rounded-lg" />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                      <Input id="email" defaultValue="admin@abcschool.edu" className="h-11 rounded-lg" />
                    </div>
                  </div>
                  
                  <div className="border-t border-muted/30 pt-6 flex justify-end">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 h-11 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SCHOOL TAB */}
            <TabsContent value="school" className="space-y-6 mt-0">
              <Card className="rounded-xl shadow-sm border-muted/50 overflow-hidden bg-white dark:bg-zinc-950">
                <CardContent className="p-6 md:p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-bold mb-4">School Information</h3>
                    
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">
                      <div className="h-20 w-28 rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm border flex items-center justify-center overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="School Logo" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-sm">School Logo</p>
                        <Button variant="outline" className="w-fit mt-2" size="sm">
                          Upload New Logo
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2.5">
                        <Label htmlFor="schoolName" className="text-sm font-semibold">School Name</Label>
                        <Input id="schoolName" defaultValue="ABC School" className="h-11 rounded-lg" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="desc" className="text-sm font-semibold">Description</Label>
                        <Textarea 
                          id="desc" 
                          defaultValue="A premier educational institution dedicated to excellence in learning and character development." 
                          className="min-h-[100px] resize-y rounded-lg" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-muted/30 pt-6 space-y-4">
                    <h3 className="text-lg font-bold mb-4">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2.5">
                        <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                        <Input id="phone" defaultValue="+1 (555) 123-4567" className="h-11 rounded-lg" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="website" className="text-sm font-semibold">Website</Label>
                        <Input id="website" defaultValue="https://abcschool.edu" className="h-11 rounded-lg" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-muted/30 pt-6 space-y-4">
                    <h3 className="text-lg font-bold mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2.5">
                        <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                        <Input id="city" defaultValue="San Francisco" className="h-11 rounded-lg" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="state" className="text-sm font-semibold">State</Label>
                        <Input id="state" defaultValue="California" className="h-11 rounded-lg" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="country" className="text-sm font-semibold">Country</Label>
                        <Input id="country" defaultValue="United States" className="h-11 rounded-lg" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-muted/30 pt-6 flex justify-end">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 h-11 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SECURITY TAB */}
            <TabsContent value="security" className="space-y-6 mt-0">
              <Card className="rounded-xl shadow-sm border-muted/50 overflow-hidden bg-white dark:bg-zinc-950">
                <CardContent className="p-6 md:p-8 space-y-8">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Change Password</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2.5">
                        <Label htmlFor="current" className="text-sm font-semibold">Current Password</Label>
                        <Input id="current" type="password" placeholder="Enter your current password" className="h-11 rounded-lg" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="new" className="text-sm font-semibold">New Password</Label>
                        <Input id="new" type="password" placeholder="Enter your new password" className="h-11 rounded-lg" />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="confirm" className="text-sm font-semibold">Confirm New Password</Label>
                        <Input id="confirm" type="password" placeholder="Confirm your new password" className="h-11 rounded-lg" />
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-4 rounded-xl mt-6 text-sm border border-blue-100 dark:border-blue-900/50">
                      <span className="font-bold">Password Requirements:</span> Minimum 8 characters with at least one uppercase letter, one number, and one special character.
                    </div>
                  </div>
                  
                  <div className="border-t border-muted/30 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full md:w-auto h-11 rounded-lg">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout from All Devices
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 h-11 rounded-lg w-full md:w-auto" onClick={handleLogout}>
                      <Shield className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN: ACCOUNT INFO (STATIC) */}
        <div className="lg:col-span-1">
          <Card className="rounded-xl shadow-sm border-muted/50 overflow-hidden bg-white dark:bg-zinc-950 sticky top-24">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Role</p>
                <p className="font-semibold">School Administrator</p>
              </div>
              
              <div className="w-full h-px bg-muted/50"></div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Account Created</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="font-semibold text-sm">January 1, 2024</p>
                </div>
              </div>

              <div className="w-full h-px bg-muted/50"></div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Last Login</p>
                <p className="font-semibold text-sm">Today at 9:30 AM</p>
              </div>

              <div className="w-full h-px bg-muted/50"></div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 mt-4">
                <h4 className="font-bold text-sm">Need Help?</h4>
                <p className="text-xs text-muted-foreground mt-1 mb-3 leading-relaxed">
                  Contact our support team for assistance.
                </p>
                <Button variant="outline" className="w-full text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700 bg-white dark:bg-zinc-950 h-9 text-xs">
                  Contact Support
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
