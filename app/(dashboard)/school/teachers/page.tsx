"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  RefreshCcw,
  Copy,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getSchoolDetails } from "@/services/schoolService";
import { getTeachers, addTeacher } from "@/services/teacherService";
import { isEmailExists, signUp } from "@/services/authService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  InputGroup, 
  InputGroupInput, 
  InputGroupAddon, 
  InputGroupText 
} from "@/components/ui/input-group";

export default function TeachersPage() {
  const { loading, user } = useRequireRole(ROLES.SCHOOL);
  const [school, setSchool] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [teacherUsername, setTeacherUsername] = useState("");
  const [isPasswordGenerated, setIsPasswordGenerated] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    generatePassword();
  }, []);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pswd = "";
    for (let i = 0; i < 12; i++) {
      pswd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setIsPasswordGenerated(pswd);
  };

  const fetchTeachers = async (schoolId: string) => {
    setLoadingData(true);
    const data = await getTeachers(schoolId);
    if (data) {
      setTeachers(data);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    const init = async () => {
      if (user?.id) {
        const schoolData = await getSchoolDetails(user.id);
        setSchool(schoolData);
        if (schoolData?.id) {
          fetchTeachers(schoolData.id);
        }
      }
    };
    init();
  }, [user]);

  const handleAddTeacher = async () => {
    if (!teacherName || !teacherUsername || !school?.id) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const email = `${teacherUsername.toLowerCase()}@${school.username.toLowerCase()}.com`;
      
      const emailExists = await isEmailExists(email);
      if (emailExists) {
        toast.error("Username already exists for this school.");
        setIsSubmitting(false);
        return;
      }

      // 1. Auth Signup
      const { data: authData, error: authError } = await signUp(email, isPasswordGenerated);
      if (authError) throw authError;
      if (!authData.user) throw new Error("Authentication failed");

      // 2. Create teacher record
      const result = await addTeacher(
        school.id,
        teacherName,
        email,
        authData.user.id
      );

      if (result) {
        toast.success("Teacher added successfully!");
        setIsDialogOpen(false);
        setTeacherName("");
        setTeacherUsername("");
        generatePassword();
        fetchTeachers(school.id);
      } else {
        toast.error("Failed to add teacher.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  const avatarColors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-rose-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  return (
    <div className="w-full h-full pb-20 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Teachers</h2>
            <span className="text-3xl">🧑‍🏫</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage your school's teaching staff
          </p>
        </div>
        
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm rounded-lg flex items-center gap-2 h-11 px-6"
        >
          <Plus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Teacher</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new account for a faculty member.
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Full Name</label>
              <Input 
                placeholder="e.g. John Doe" 
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Username</label>
              <InputGroup>
                <InputGroupInput 
                  placeholder="john.doe" 
                  value={teacherUsername}
                  onChange={(e) => setTeacherUsername(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>@{school?.username || "school"}.com</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Password (Auto-generated)</label>
              <div className="flex items-center gap-2">
                <Input readOnly value={isPasswordGenerated} className="bg-muted/30" />
                <Button variant="outline" size="icon" className="shrink-0" onClick={() => {
                  navigator.clipboard.writeText(isPasswordGenerated);
                  toast.success("Password copied!");
                }}>
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button onClick={generatePassword} variant="outline" size="icon" className="shrink-0">
                  <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddTeacher} 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search teachers..." 
            className="pl-9 h-11 rounded-xl bg-white dark:bg-zinc-950 border-muted/60" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TEACHERS TABLE */}
      <Card className="rounded-xl shadow-sm border-muted/60 overflow-hidden bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/20 text-xs text-muted-foreground font-semibold">
            <TableRow className="hover:bg-transparent tracking-wider border-b-muted/40">
              <TableHead className="px-6 py-4 uppercase">Teacher</TableHead>
              <TableHead className="py-4 uppercase">Assigned Classes</TableHead>
              <TableHead className="py-4 uppercase">Status</TableHead>
              <TableHead className="py-4 uppercase">Joined Date</TableHead>
              <TableHead className="px-6 py-4 text-right uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingData ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher, index) => {
                const color = avatarColors[index % avatarColors.length];
                const initials = teacher.name.split(' ').map((n: string) => n[0].toUpperCase()).join('').slice(0, 2);
                
                // Format classes string
                const classes = teacher.class_subjects
                  ?.map((cs: any) => `${cs.classes.class_name}-${cs.classes.section} (${cs.subjects.subject_name})`)
                  .filter((v: any, i: any, a: any) => a.indexOf(v) === i) // unique
                  .join(", ") || "No classes assigned";

                return (
                  <TableRow key={teacher.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/50 cursor-default transition-colors border-b-muted/40 h-16">
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-muted/30">
                          <AvatarFallback className={`${color} text-white text-xs font-semibold`}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground">{teacher.name}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">{teacher.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-muted-foreground whitespace-pre-wrap max-w-md">
                      {classes}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-0">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-muted-foreground">
                      {new Date(teacher.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                  No teachers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex items-center justify-between border-t px-6 py-4 bg-slate-50/30 dark:bg-transparent">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredTeachers.length}</span> teachers
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shadow-sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" className="h-8 w-8 rounded-lg shadow-sm bg-purple-600 hover:bg-purple-700 text-white p-0">
              1
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shadow-sm" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
