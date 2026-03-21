/**
 * Teacher Quizzes Management Page
 * Allows teachers to view, search, and manage their created quizzes.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from '@/components/ui/input-group';
import { CreateQuizButton } from '@/components/quiz/create-quiz-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useRequireRole } from '@/hooks/useRequireRole';
import { Role, ROUTES } from '@/constants';
import { getTeacherDetails } from '@/services/teacherService';
import { getQuizzesByTeacher } from '@/services/quizService';
import { Teacher, Quiz } from '@/types';
import { cn } from '@/lib/utils';

export default function TeacherQuizzesPage() {
  const { loading: authLoading, user } = useRequireRole(Role.TEACHER);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  /**
   * Fetches teacher details and their associated quizzes.
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      setLoadingQuizzes(true);
      try {
        const teacherData = await getTeacherDetails(user.id);
        if (!teacherData) {
          toast.error('Could not load teacher profile.');
          setLoadingQuizzes(false);
          return;
        }
        setTeacher(teacherData);
        
        const quizzesData = await getQuizzesByTeacher(teacherData.id);
        setQuizzes(quizzesData || []);
      } catch (err) {
        console.error('Error fetching teacher quizzes:', err);
        toast.error('Failed to load quizzes.');
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const filteredQuizzes = quizzes.filter(quiz => 
    (quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (quiz.classes?.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (quiz.subjects?.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );
  
  if (authLoading || loadingQuizzes) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-20 space-y-8 animate-in fade-in duration-500">
      {/* Header section with refined typography */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-4xl font-black tracking-tight text-gray-900 flex items-center gap-4 uppercase">
            Quizzes <span className="opacity-20 select-none">/</span> <ClipboardList className="text-[#FF6B35]" size={32} />
          </h2>
          <p className="text-gray-400 text-sm font-black uppercase tracking-widest">
            Manage your classroom assessments and monitoring
          </p>
        </div>
        <CreateQuizButton label="Add Quiz" className="rounded-2xl h-14 px-8 bg-gray-900 border-0 hover:bg-black text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-gray-200" />
      </div>

      {/* Modernized Search Bar */}
      <InputGroup className="max-w-md h-14 bg-white rounded-3xl border-2 border-gray-100 shadow-sm transition-all focus-within:ring-8 focus-within:ring-[#FF6B35]/5 focus-within:border-[#FF6B35]/30 px-3">
        <InputGroupAddon align="inline-start" className="bg-transparent border-none pl-3 pr-1">
          <Search className="h-5 w-5 text-gray-400" />
        </InputGroupAddon>
        <InputGroupInput 
          placeholder="SEARCH QUIZZES..." 
          className="h-full border-none bg-transparent focus-visible:ring-0 rounded-none text-sm font-black uppercase tracking-widest placeholder:text-gray-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <InputGroupAddon align="inline-end" className="bg-transparent border-none text-[10px] font-black text-gray-400 pr-4 uppercase tracking-tighter">
          {filteredQuizzes.length} Results
        </InputGroupAddon>
      </InputGroup>

      {/* Refined Quizzes Table */}
      <Card className="rounded-[32px] border-2 border-gray-100 shadow-sm overflow-hidden bg-white">
        {filteredQuizzes.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50/50 h-16 border-b-2 border-gray-100">
              <TableRow className="uppercase text-[11px] font-black tracking-[0.2em] text-gray-400 hover:bg-transparent">
                <TableHead className="px-8 w-[40%]">Quiz Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="px-8 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id} className="hover:bg-gray-50/50 transition-colors border-b-2 border-gray-50 last:border-0 h-20 group">
                  <TableCell className="px-8 font-black text-gray-900 text-base">
                    {quiz.title ?? 'Untitled Quiz'}
                  </TableCell>
                  <TableCell className="text-sm font-bold text-gray-500">
                    <span className="bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 uppercase tracking-tight">
                        {quiz.classes ? `${quiz.classes.class_name}-${quiz.classes.section}` : "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-[#FF6B35] uppercase tracking-wide">
                    {quiz.subjects?.subject_name || "-"}
                  </TableCell>
                  <TableCell className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    {format(new Date(quiz.created_at), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-50 text-green-600 border-2 border-green-100 rounded-xl font-black text-[10px] uppercase px-3 py-1 tracking-widest">
                      {quiz.count} QUE
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-gray-100 transition-all active:scale-90 border-2 border-transparent">
                          <MoreVertical className="h-5 w-5 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 p-3 rounded-[24px] border-2 border-gray-100 shadow-xl space-y-1">
                        <DropdownMenuItem className="cursor-pointer font-black text-[10px] uppercase tracking-widest flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <Eye className="h-4 w-4 text-blue-500" />
                          Preview Mode
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer font-black text-[10px] uppercase tracking-widest flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                          onClick={() => router.push(`${ROUTES.TEACHER.QUIZZES.LIST}/edit?quizId=${quiz.id}`)}
                        >
                          <Edit2 className="h-4 w-4 text-amber-500" />
                          Modify Content
                        </DropdownMenuItem>
                        <div className="h-0.5 bg-gray-50 my-1 mx-2 rounded-full" />
                        <DropdownMenuItem className="cursor-pointer font-black text-[10px] uppercase tracking-widest flex items-center gap-3 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                          <Trash2 className="h-4 w-4" />
                          Erase Record
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 bg-white">
            <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-8 border-2 border-dashed border-gray-200">
                <ClipboardList className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-gray-900 font-black text-xl uppercase tracking-widest">No Quizzes Created</p>
            <p className="text-gray-400 text-sm mt-3 font-bold max-w-xs text-center leading-relaxed">
                Your assessment library is empty. Start by creating a new quiz!
            </p>
            <CreateQuizButton label="Create your first quiz" className="mt-8 rounded-2xl h-12 bg-[#FF6B35] hover:bg-[#E85D25] text-white px-8 font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-[#FF6B35]/20" />
          </div>
        )}
      </Card>
    </div>
  );
}
