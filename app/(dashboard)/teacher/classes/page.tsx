"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Users, 
  Plus, 
  Search,
  Filter,
  ArrowRight,
  GraduationCap,
  MoreVertical,
  Edit2,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getTeacherDetails } from "@/services/teacherService";
import { getTeacherStudents } from "@/services/studentService";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { CreateQuizButton } from "@/components/quiz/create-quiz-button";

export default function MyClassesPage() {
  const { loading, user } = useRequireRole(ROLES.TEACHER);
  const [teacher, setTeacher] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Group classes and sections derived from the students list
  const sectionsMap: Record<string, any> = {};
  students.forEach((s: any) => {
    if (!sectionsMap[s.class_id]) {
      sectionsMap[s.class_id] = {
        id: s.class_id,
        class_name: s.class_name,
        section: s.section,
        subjects: s.subjects,
        students: []
      };
    }
    sectionsMap[s.class_id].students.push(s);
  });

  const allSections = Object.values(sectionsMap);
  
  const groupedClasses: Record<string, any[]> = {};
  allSections.forEach((sec: any) => {
    if (!groupedClasses[sec.class_name]) {
      groupedClasses[sec.class_name] = [];
    }
    groupedClasses[sec.class_name].push(sec);
  });

  const classNames = Object.keys(groupedClasses).sort();

  return (
    <div className="w-full h-full pb-20 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Classes & Sections 🏫
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Manage your assigned classes, sections, and organizational structure
          </p>
        </div>
        <CreateQuizButton label="Add Quiz" className="rounded-lg h-11" />
      </div>

      {/* SEARCH */}
      <InputGroup className="max-w-md h-12 bg-white dark:bg-zinc-950 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm transition-all focus-within:ring-4 focus-within:ring-purple-500/10 focus-within:border-purple-400 px-2">
        <InputGroupAddon align="inline-start" className="bg-transparent border-none pl-3 pr-1">
          <Search className="h-5 w-5 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput 
          placeholder="Search classes..." 
          className="h-full border-none bg-transparent focus-visible:ring-0 rounded-none text-base pl-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <InputGroupAddon align="inline-end" className="bg-transparent border-none text-sm font-medium text-muted-foreground pr-4">
          {classNames.length} result{classNames.length !== 1 ? 's' : ''}
        </InputGroupAddon>
      </InputGroup>

      {/* CLASSES LIST */}
      <div className="space-y-6">
        {classNames.length > 0 ? (
          classNames.map((className) => {
            const sections = groupedClasses[className];
            const totalStudents = sections.reduce((acc, curr) => acc + curr.students.length, 0);

            return (
              <Card key={className} className="rounded-2xl border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-950">
                <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <GraduationCap className="h-7 w-7" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Class {className}</CardTitle>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border-0 font-bold px-2 py-0">
                          {sections.length} {sections.length === 1 ? 'Section' : 'Sections'}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                          <Users className="h-3.5 w-3.5" />
                          {totalStudents} {totalStudents === 1 ? 'Student' : 'Students'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-purple-600">
                      <Plus className="h-4 w-4 mr-1" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">Add Section</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-purple-600">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sections.map((sec: any) => {
                      const studentCount = sec.students.length;

                      return (
                        <Link key={sec.id} href={`/teacher/classes/${sec.id}`}>
                          <Card className="rounded-2xl border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 hover:border-purple-200 hover:bg-purple-50/20 transition-all group cursor-pointer p-4">
                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-lg">Section {sec.section}</h4>
                                <div className="flex -space-x-2">
                                  {sec.students.slice(0, 3).map((s: any) => (
                                    <Avatar key={s.id} className="h-6 w-6 border-2 border-white dark:border-zinc-900 ring-0">
                                      <AvatarFallback className="bg-purple-200 dark:bg-purple-900 text-[8px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                                        {s.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {studentCount > 3 && (
                                    <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                      +{studentCount - 3}
                                    </div>
                                  )}
                                  {studentCount === 0 && (
                                    <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[7px] font-bold text-slate-400">
                                      0
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                <Users className="h-3.5 w-3.5" />
                                {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
                              </div>
                              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Subjects</p>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {sec.subjects.map((sub: any) => (
                                    <Badge key={sub.id} variant="outline" className="text-[9px] font-bold py-0 border-purple-100 text-purple-600 dark:text-purple-400">
                                      {sub.subject_name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-lg">No classes found</h4>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">We couldn't find any classes matching your teaching schedule.</p>
          </div>
        )}
      </div>
    </div>
  );
}
