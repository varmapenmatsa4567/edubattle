"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  TrendingUp,  
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getTeacherDetails } from "@/services/teacherService";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { getTeacherStudents } from "@/services/studentService";
import { CreateQuizButton } from "@/components/quiz/create-quiz-button";

export default function TeacherDashboard() {
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

  // Group sections derived from the students list for dashboard display
  const sectionsMap: Record<string, any> = {};
  students.forEach((s: any) => {
    if (!sectionsMap[s.class_id]) {
      sectionsMap[s.class_id] = {
        id: s.class_id,
        class_name: s.class_name,
        section: s.section,
        subjects: s.subjects,
        studentCount: 0
      };
    }
    sectionsMap[s.class_id].studentCount++;
  });

  const sections = Object.values(sectionsMap);
  const uniqueClassesCount = sections.length;
  const totalStudents = students.length;

  return (
    <div className="w-full h-full pb-20 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard 👨‍🏫</h2>
        <p className="text-muted-foreground text-sm">
          Manage your classes, quizzes, and student performance
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="rounded-xl shadow-sm border-muted/50 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Total Classes
            </CardTitle>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
							<BookOpen className="h-6 w-6" />
						</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uniqueClassesCount}</div>
            <p className="text-xs font-medium text-emerald-500 mt-1">
              Assigned sections
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-muted/50 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
							<Users className="h-6 w-6" />
						</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStudents}</div>
            <p className="text-xs font-medium text-emerald-500 mt-1">
              Across all classes
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-muted/50 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Quizzes Created
            </CardTitle>
            <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
							<ClipboardList className="h-6 w-6" />
						</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-xs font-medium text-emerald-500 mt-1">
              +4 this month
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-muted/50 bg-white dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium text-muted-foreground">
              Avg. Performance
            </CardTitle>
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
							<TrendingUp className="h-6 w-6" />
						</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">78%</div>
            <p className="text-xs font-medium text-emerald-500 mt-1">
              Above target
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-3">
        {/* MY CLASSES SECTION (Styled like Top Performers) */}
        <div className="col-span-1 md:col-span-4 lg:col-span-2 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold tracking-tight">My Classes</h3>
              <span className="text-xl">📚</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Quick access to your assigned sections
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((sec: any, i: number) => (
              <Card key={i} className={`rounded-xl shadow-sm border-2 ${i % 3 === 0 ? 'border-yellow-200/50 bg-yellow-50/30 dark:bg-yellow-900/10' : i % 3 === 1 ? 'border-slate-200/50 bg-slate-50/50 dark:bg-slate-900/30' : 'border-orange-200/50 bg-orange-50/30 dark:bg-orange-900/10'} relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-16 h-16 ${i % 3 === 0 ? 'bg-linear-to-bl from-yellow-200/50' : i % 3 === 1 ? 'bg-linear-to-bl from-slate-200/50' : 'bg-linear-to-bl from-orange-200/50'} to-transparent rounded-bl-full z-0`}></div>
                <CardContent className="p-5 flex flex-col items-center justify-center text-center relative z-10 pt-8">
                  <div className={`absolute top-3 left-3 h-8 w-8 rounded-lg ${i % 3 === 0 ? 'bg-yellow-400' : i % 3 === 1 ? 'bg-slate-400' : 'bg-orange-400'} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                    {sec.class_name[0]}{sec.section}
                  </div>
                  <Avatar className={`h-16 w-16 mb-3 border-2 ${i % 3 === 0 ? 'border-yellow-400' : i % 3 === 1 ? 'border-slate-400' : 'border-orange-400'}`}>
                    <AvatarFallback className="bg-purple-600 text-white font-semibold">
                      {sec.subjects[0]?.subject_name?.[0] || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold text-foreground">Class {sec.class_name}-{sec.section}</h4>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-1">
                    {sec.subjects.map((s: any) => s.subject_name).join(", ")}
                  </p>
                  
                  <div className="flex items-center justify-between w-full mt-auto">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center text-purple-600 dark:text-purple-400">
                        <Users className="h-3 w-3 mr-1" />
                        <span className="text-sm font-bold text-foreground">{sec.studentCount}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Students</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 px-2" asChild>
                        <Link href={`/teacher/classes/${sec.id}`}>
                          View <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                      <CreateQuizButton 
                        classId={sec.id}
                        label="Quiz" 
                        className="h-8 px-3 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-0 shadow-none" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* GOALS SECTION */}
        <div className="col-span-1 md:col-span-3 lg:col-span-1">
          <Card className="rounded-xl shadow-sm border-muted/50 bg-white dark:bg-zinc-950 h-full p-6 pb-8">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">Teaching Goals</h3>
                <span className="text-xl">🎯</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Track your progress this month
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-semibold text-sm">Conduct Quizzes</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Target: 10 quizzes</p>
                  </div>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">7/10</span>
                </div>
                <Progress value={70} className="h-2.5 bg-muted" indicatorClassName="bg-purple-600 dark:bg-purple-500" />
                <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">70% complete</p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-semibold text-sm">Improve Accuracy</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Focus on Grade 10-A</p>
                  </div>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">82/100</span>
                </div>
                <Progress value={82} className="h-2.5 bg-muted" indicatorClassName="bg-purple-600 dark:bg-purple-500" />
                <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">82% complete</p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-semibold text-sm">Feedback Sent</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Personalized guidance</p>
                  </div>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">15/20</span>
                </div>
                <Progress value={75} className="h-2.5 bg-muted" indicatorClassName="bg-purple-600 dark:bg-purple-500" />
                <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">75% complete</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}