"use client";
import React, { useState, useEffect } from "react";
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  CheckCircle2,
  Clock,
  BarChart2,
  Calendar,
  BookOpen,
  LayoutGrid
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { CreateQuizButton } from "@/components/quiz/create-quiz-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getTeacherDetails } from "@/services/teacherService";
import { getQuizzesByTeacher } from "@/services/quizService";
import { format } from "date-fns";

export default function TeacherQuizzesPage() {
  const { loading, user } = useRequireRole(ROLES.TEACHER);
  const [searchTerm, setSearchTerm] = useState("");
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [teacher, setTeacher] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoadingQuizzes(true);
        const teacherData = await getTeacherDetails(user.id);
        setTeacher(teacherData);
        
        if (teacherData?.id) {
          const quizzesData = await getQuizzesByTeacher(teacherData.id);
          setQuizzes(quizzesData || []);
        }
        setLoadingQuizzes(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.classes?.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.subjects?.subject_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || loadingQuizzes) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-20 space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Quizzes 📝
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Manage your classroom assessments and student quizzes
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
          placeholder="Search quizzes..." 
          className="h-full border-none bg-transparent focus-visible:ring-0 rounded-none text-base pl-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <InputGroupAddon align="inline-end" className="bg-transparent border-none text-sm font-medium text-muted-foreground pr-4">
          {filteredQuizzes.length} results
        </InputGroupAddon>
      </InputGroup>

      {/* QUIZZES TABLE */}
      <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-950">
        {filteredQuizzes.length > 0 ? (
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-zinc-900/50 h-12">
              <TableRow className="uppercase text-[11px] font-bold tracking-wider text-muted-foreground border-b-slate-100 dark:border-zinc-800 hover:bg-transparent">
                <TableHead className="px-6">Quiz Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id} className="hover:bg-slate-50 transition-colors border-b-slate-100 dark:border-zinc-800 h-16">
                  <TableCell className="px-6 font-semibold text-sm">
                    {quiz.title}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {quiz.classes ? `${quiz.classes.class_name}-${quiz.classes.section}` : "-"}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">
                    {quiz.subjects?.subject_name || "-"}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">
                    {format(new Date(quiz.created_at), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-700 border-0 rounded-lg font-bold text-[10px] uppercase">
                      {quiz.count} Qs
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="cursor-pointer font-medium text-xs uppercase flex items-center gap-2">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-medium text-xs uppercase flex items-center gap-2">
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-medium text-xs uppercase flex items-center gap-2 text-red-600 focus:text-red-700">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-950">
            <ClipboardList className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No quizzes found.</p>
            <p className="text-slate-400 text-sm mt-1">Start by creating your first quiz!</p>
          </div>
        )}
      </Card>
    </div>
  );
}

