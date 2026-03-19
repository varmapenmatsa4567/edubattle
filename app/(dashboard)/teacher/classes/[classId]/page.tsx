"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  Search,
  Filter,
  MoreVertical,
  Plus,
  ClipboardList,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getTeacherDetails } from "@/services/teacherService";
import { getTeacherStudents } from "@/services/studentService";
import { CreateQuizButton } from "@/components/quiz/create-quiz-button";

export default function TeacherClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { classId } = params;
  const { loading, user } = useRequireRole(ROLES.TEACHER);
  const [teacher, setTeacher] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoadingData(true);
        const teacherData = await getTeacherDetails(user.id);
        if (teacherData) {
          setTeacher(teacherData);
          const studentData = await getTeacherStudents(teacherData.id, teacherData.school_id);
          if (studentData) {
            setStudents(studentData);
          }
        }
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

  // Find students for the current class
  const classStudents = students.filter(s => s.class_id === classId);
  
  // Find the current class details from teacher's assignments
  const currentClassSubjects = teacher?.class_subjects?.filter((cs: any) => cs.classes?.id === classId) || [];
  const classInfo = currentClassSubjects[0]?.classes;

  // Add mock performance to real students for UI display
  const studentsWithStats = classStudents.map(s => ({
    ...s,
    performance: 70 + Math.floor(Math.random() * 25), // Mock performance for now
    lastActivity: "Active now",
    status: "Active"
  }));

  return (
    <div className="w-full h-full pb-20 space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()} 
          className="w-fit text-muted-foreground hover:text-purple-600 p-0 h-auto font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Classes
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              Class {classInfo?.class_name}-{classInfo?.section} <Users className="h-8 w-8 text-purple-600" />
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              Dashboard for your assigned section and students
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-bold h-11 px-6 border-slate-200">
              View Results
            </Button>
            <CreateQuizButton 
              classId={classId as string}
              className="rounded-xl shadow-md shadow-purple-100 h-11 px-6" 
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        {/* LEFT COLUMN: SUBJECTS TAUGHT & QUICK ACTIONS */}
        <div className="flex flex-col md:flex-row gap-6 w-full mb-8">
          <Card className="flex-1 rounded-3xl shadow-sm border-muted/50 overflow-hidden bg-white dark:bg-zinc-950">
            <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-muted/30">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Subjects Taught
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {currentClassSubjects.map((cs: any) => (
                  <Badge key={cs.id} className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0 rounded-xl px-4 py-2 font-bold text-sm">
                    {cs.subjects?.subject_name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 rounded-3xl shadow-sm border-muted/50 overflow-hidden bg-white dark:bg-zinc-950">
            <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-muted/30">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground uppercase">Enrollment</span>
                <span className="text-sm font-black">{classStudents.length} Students</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground uppercase">Avg Performance</span>
                <span className="text-sm font-black text-emerald-600">82.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground uppercase">Completion Rate</span>
                <span className="text-sm font-black text-purple-600">94.0%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: STUDENTS LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Student Roster</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search student name..." className="pl-10 h-10 rounded-xl bg-white border-muted/50 font-medium" />
            </div>
          </div>

          <Card className="rounded-3xl shadow-sm border-muted/50 overflow-hidden bg-white dark:bg-zinc-950">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50 h-14">
                <TableRow className="uppercase text-[11px] font-black tracking-widest text-muted-foreground border-b-muted/30">
                  <TableHead className="px-6">Student Name</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="px-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsWithStats.map((student: any, i: number) => (
                  <TableRow key={student.id} className="group hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors border-b-muted/30 h-16">
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded-xl shadow-sm">
                          <AvatarFallback className="bg-purple-600 text-white font-black text-xs">
                            {student.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-sm text-foreground">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                          <span className={student.performance > 80 ? 'text-emerald-500' : student.performance > 70 ? 'text-purple-500' : 'text-orange-500'}>
                            {student.performance}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${student.performance > 80 ? 'bg-emerald-500' : student.performance > 70 ? 'bg-purple-500' : 'bg-orange-500'}`}
                            style={{ width: `${student.performance}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-muted-foreground">
                      {student.lastActivity}
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-purple-50 text-muted-foreground hover:text-purple-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-muted/30 bg-slate-50/30 text-center">
              <Button variant="link" className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                View all {classStudents.length} students
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
