"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  GraduationCap, 
  Users, 
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  MoreVertical
} from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getSchoolDetails } from "@/services/schoolService";
import { getClassDetails } from "@/services/classService";
import { getClassStudents } from "@/services/studentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const SchoolClassPage = () => {
  const params = useParams();
  const router = useRouter();
  const { classId } = params;
  const { loading, user } = useRequireRole(ROLES.SCHOOL);
  
  const [students, setStudents] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [school, setSchool] = useState<any>(null);
  const [classDetails, setClassDetails] = useState<any>(null);

  // Parse classId (now a database ID)
  const classIdStr = typeof classId === 'string' ? classId : '';

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoadingData(true);
        const [schoolData, details] = await Promise.all([
          getSchoolDetails(user.id),
          getClassDetails(classIdStr)
        ]);
        
        setSchool(schoolData);
        setClassDetails(details);

        if (schoolData?.id) {
          const studentsData = await getClassStudents(classIdStr, schoolData.id);
          if (studentsData) {
            setStudents(studentsData);
          }
        }
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user, classIdStr]);

  if (loading || loadingData) {
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
      <div className="flex flex-col gap-4 border-b border-muted/50 pb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()} 
          className="w-fit text-muted-foreground hover:text-foreground p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Classes
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight">
                Class {classDetails?.class_name || "..."} - Section {classDetails?.section || "..."}
              </h2>
              <span className="text-3xl">👨‍🎓</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Manage and view all students enrolled in this class and section
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-lg flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export List
            </Button>
          </div>
        </div>
      </div>

      {/* STATS SUMMARY */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-xl shadow-sm border-muted/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/50 dark:bg-purple-900/10 rounded-bl-full -mr-8 -mt-8 z-0"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center relative z-10">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              Total Enrolled
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Students in this section</p>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-2">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search students..." 
            className="pl-9 h-11 rounded-xl bg-white dark:bg-zinc-950 border-muted/60 focus:ring-purple-500/20" 
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="rounded-xl flex-1 md:flex-none h-11 gap-2 bg-white dark:bg-zinc-950">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <Card className="rounded-2xl shadow-sm border-muted/60 overflow-hidden bg-white dark:bg-zinc-950">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-muted/40 h-14">
            <TableRow className="hover:bg-transparent border-none uppercase text-[11px] font-bold tracking-wider text-muted-foreground">
              <TableHead className="px-6 py-4">Student Name</TableHead>
              <TableHead className="py-4">User ID</TableHead>
              <TableHead className="py-4">Status</TableHead>
              <TableHead className="py-4">Joined Date</TableHead>
              <TableHead className="px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length > 0 ? (
              students.map((student, index) => {
                const color = avatarColors[index % avatarColors.length];
                const initials = student.name
                  .split(' ')
                  .map((n: string) => n[0].toUpperCase())
                  .join('')
                  .slice(0, 2);

                return (
                  <TableRow key={student.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/50 cursor-default transition-colors border-b-muted/40 h-16">
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-muted/30">
                          <AvatarFallback className={`${color} text-white text-xs font-semibold`}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm text-foreground">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground font-medium">
                      {student.user_id?.slice(0, 8) || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className="font-medium text-xs rounded-full border-0 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                      >
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-muted-foreground">
                      {new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="px-6 text-right align-middle">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <GraduationCap className="h-10 w-10 mb-2 opacity-20" />
                    <p>No students found in this section</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default SchoolClassPage;