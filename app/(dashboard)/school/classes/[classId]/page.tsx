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
  BookOpen,
  UserPlus,
  Plus,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getSchoolDetails } from "@/services/schoolService";
import { getClassDetails } from "@/services/classService";
import { getClassStudents } from "@/services/studentService";
import { getSubjects, addClassSubject, getClassSubjects, assignTeacherToClassSubject, addBulkClassSubjects } from "@/services/subjectService";
import { getTeachers } from "@/services/teacherService";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const SchoolClassPage = () => {
  const params = useParams();
  const router = useRouter();
  const { classId } = params;
  const { loading, user } = useRequireRole(ROLES.SCHOOL);
  
  const [students, setStudents] = useState<any[]>([]);
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schoolSubjects, setSchoolSubjects] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [school, setSchool] = useState<any>(null);
  const [classDetails, setClassDetails] = useState<any>(null);

  // Dialog state
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const classIdStr = typeof classId === 'string' ? classId : '';

  const fetchData = async () => {
    if (user?.id) {
      setLoadingData(true);
      try {
        const [schoolData, details] = await Promise.all([
          getSchoolDetails(user.id),
          getClassDetails(classIdStr)
        ]);
        
        setSchool(schoolData);
        setClassDetails(details);

        if (schoolData?.id) {
          const [studentsData, subjectsData, schoolTeachers, allSubjects] = await Promise.all([
            getClassStudents(classIdStr, schoolData.id),
            getClassSubjects(classIdStr),
            getTeachers(schoolData.id),
            getSubjects(schoolData.id)
          ]);

          if (studentsData) setStudents(studentsData);
          if (subjectsData) setClassSubjects(subjectsData);
          if (schoolTeachers) setTeachers(schoolTeachers);
          if (allSubjects) setSchoolSubjects(allSubjects);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load class details");
      } finally {
        setLoadingData(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, classIdStr]);

  const handleAddSubjectToClass = async () => {
    if (selectedSubjectIds.length === 0 || !classIdStr) return;

    setIsSubmitting(true);
    try {
      const result = await addBulkClassSubjects(classIdStr, selectedSubjectIds);
      if (result) {
        toast.success(`${selectedSubjectIds.length} subjects added to class successfully!`);
        setIsAddSubjectOpen(false);
        setSelectedSubjectIds([]);
        fetchData();
      } else {
        toast.error("Failed to add subjects");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignTeacher = async (classSubjectId: string, teacherId: string) => {
    if (!classSubjectId || !teacherId) return;

    try {
      const result = await assignTeacherToClassSubject(classSubjectId, teacherId);
      if (result) {
        toast.success("Teacher assigned successfully!");
        fetchData();
      } else {
        toast.error("Failed to assign teacher");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

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
              Manage students, subjects, and teachers for this specific section
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-lg flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-xl h-12 mb-6">
          <TabsTrigger value="students" className="rounded-lg px-6 h-10 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm">
            <Users className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="subjects" className="rounded-lg px-6 h-10 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Subjects & Teachers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6 outline-none">
          {/* STATS SUMMARY */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="rounded-xl shadow-sm border-muted/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/50 dark:bg-purple-900/10 rounded-bl-full -mr-8 -mt-8 z-0"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center relative z-10">
                  <Users className="h-4 w-4 mr-2 text-purple-500" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Active enrollments</p>
              </CardContent>
            </Card>
          </div>

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
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-0">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-muted-foreground">
                          {new Date(student.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      No students found in this section
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6 outline-none">
          <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-muted/50">
            <p className="text-sm font-medium text-muted-foreground">
              {classSubjects.length} subjects assigned to this class
            </p>
            
            <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg gap-2">
                  <Plus className="h-4 w-4" />
                  Add Subject to Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Subject to Class</DialogTitle>
                  <DialogDescription>
                    Select a subject from the school's curriculum to add to this class.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Available Subjects</p>
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {schoolSubjects
                      .filter(sub => !classSubjects.some(cs => cs.subject_id === sub.id))
                      .map((sub) => (
                        <div key={sub.id} className="flex items-center space-x-3 p-3 rounded-xl border border-muted/40 hover:bg-slate-50 transition-colors">
                          <Checkbox 
                            id={`subject-${sub.id}`} 
                            checked={selectedSubjectIds.includes(sub.id)}
                            onCheckedChange={(checked: boolean | "indeterminate") => {
                              if (checked === true) {
                                setSelectedSubjectIds([...selectedSubjectIds, sub.id]);
                              } else {
                                setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== sub.id));
                              }
                            }}
                          />
                          <label 
                            htmlFor={`subject-${sub.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {sub.subject_name}
                          </label>
                        </div>
                      ))}
                    {schoolSubjects.filter(sub => !classSubjects.some(cs => cs.subject_id === sub.id)).length === 0 && (
                      <p className="text-sm text-center py-8 text-muted-foreground italic">
                        All school subjects are already assigned to this class.
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsAddSubjectOpen(false);
                    setSelectedSubjectIds([]);
                  }}>Cancel</Button>
                  <Button 
                    onClick={handleAddSubjectToClass} 
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={selectedSubjectIds.length === 0 || isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add {selectedSubjectIds.length > 0 ? `(${selectedSubjectIds.length})` : ""} to Class
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="rounded-2xl shadow-sm border-muted/60 overflow-hidden bg-white dark:bg-zinc-950">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-muted/40 h-14">
                <TableRow className="hover:bg-transparent border-none uppercase text-[11px] font-bold tracking-wider text-muted-foreground">
                  <TableHead className="px-6 py-4">Subject</TableHead>
                  <TableHead className="py-4">Assigned Teacher</TableHead>
                  <TableHead className="px-6 py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classSubjects.length > 0 ? (
                  classSubjects.map((cs) => (
                    <TableRow key={cs.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/50 border-b-muted/40 h-16">
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-sm text-foreground">
                            {cs.subjects?.subject_name || "Unknown Subject"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[200px]">
                        <Select 
                          value={cs.teacher_id || "none"}
                          onValueChange={(teacherId) => {
                            if (teacherId !== "none") {
                              handleAssignTeacher(cs.id, teacherId);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full max-w-[200px] h-9 rounded-lg border-muted/60">
                            <SelectValue placeholder="Assign Teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <span className="text-muted-foreground italic flex items-center gap-1.5">
                                <UserPlus className="h-3.5 w-3.5" />
                                Unassigned
                              </span>
                            </SelectItem>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-48 text-center text-muted-foreground">
                      No subjects assigned to this class yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolClassPage;