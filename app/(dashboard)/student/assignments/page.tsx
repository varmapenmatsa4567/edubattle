/**
 * Student Assignments Page
 * Displays a list of quizzes (assignments) with status filtering and results review.
 */
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Loader2 
} from 'lucide-react';
import { isToday, isBefore, startOfDay, format } from 'date-fns';

import { cn } from '@/lib/utils';
import { useRequireRole } from '@/hooks/useRequireRole';
import { Role, ROUTES, CONFIG, QuizStatus } from '@/constants';
import { getStudentDetails } from '@/services/studentService';
import { getQuizzesByClass, getQuizResultByStudent } from '@/services/quizService';
import { EnrichedQuiz, Student } from '@/types';
import StatusPill from '@/components/common/StatusPill';

export default function AssignmentsPage() {
  const { loading: authLoading, user } = useRequireRole(Role.STUDENT);
  const [filter, setFilter] = useState<'all' | QuizStatus>('all');
  const [assignments, setAssignments] = useState<EnrichedQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches student details and their assigned quizzes, then enriches them with current status.
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const student = await getStudentDetails(user.id);
        if (!student?.class?.id) {
          setIsLoading(false);
          return;
        }

        const rawQuizzes = await getQuizzesByClass(student.class.id);
        if (!rawQuizzes) {
          setIsLoading(false);
          return;
        }

        const enriched = await Promise.all(
          rawQuizzes.map(async (quiz) => {
            const result = await getQuizResultByStudent(student.id, quiz.id);
            const questionCount = quiz.count ?? 0;
            
            return {
              ...quiz,
              subject: quiz.subjects?.subject_name ?? 'General',
              totalMarks: questionCount * CONFIG.MARKS_PER_QUESTION,
              duration: quiz.time ?? CONFIG.DEFAULT_QUIZ_TIME_MINS,
              dueDateStr: quiz.due_date ?? '',
              status: result ? QuizStatus.COMPLETED : QuizStatus.PENDING,
              score: result?.score ?? undefined,
            } as EnrichedQuiz;
          })
        );

        setAssignments(enriched);
      } catch (err) {
        console.error('Failed to load assignments:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredAssignments = useMemo(() => {
    return filter === 'all'
      ? assignments
      : assignments.filter((q) => q.status === filter);
  }, [assignments, filter]);

  const stats = useMemo(() => ({
    total: assignments.length,
    pending: assignments.filter((q) => q.status === QuizStatus.PENDING).length,
    completed: assignments.filter((q) => q.status === QuizStatus.COMPLETED).length,
  }), [assignments]);

  /**
   * Determines the status type for the StatusPill based on the due date string.
   */
  const getStatusType = (dateStr: string) => {
    if (!dateStr) return 'no-date';
    const date = new Date(dateStr);
    const today = startOfDay(new Date());
    const dueDate = startOfDay(date);

    if (isToday(date)) return 'due-today';
    if (isBefore(dueDate, today)) return 'overdue';
    return 'future';
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
        <p className="text-gray-600">Complete your assignments to earn XP and improve your rank</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<FileText className="w-6 h-6 text-[#FF6B35]" />}
          title={stats.total}
          label="Total assignments"
          borderColor="border-[#FF6B35]"
          iconBg="bg-[#FF6B35]/10"
        />
        <StatCard 
          icon={<AlertCircle className="w-6 h-6 text-orange-500" />}
          title={stats.pending}
          label="Pending"
          borderColor="border-orange-500"
          iconBg="bg-orange-50"
        />
        <StatCard 
          icon={<CheckCircle className="w-6 h-6 text-green-500" />}
          title={stats.completed}
          label="Completed"
          borderColor="border-green-500"
          iconBg="bg-green-50"
        />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-2 shadow-sm mb-8 inline-flex gap-2 border border-gray-100">
        {(['all', QuizStatus.PENDING, QuizStatus.COMPLETED] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 rounded-lg font-medium capitalize transition-all ${
              filter === tab 
                ? 'bg-[#FF6B35] text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAssignments.map((quiz) => (
          <div
            key={quiz.id}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#FF6B35]/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-2 shrink-0 ${
                  quiz.status === QuizStatus.COMPLETED ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-[#FF6B35] shadow-[0_0_8px_rgba(255,107,53,0.4)]'
                }`} />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#FF6B35] transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-500">{quiz.subject}</p>
                </div>
              </div>
              {quiz.status === QuizStatus.COMPLETED && (
                <div className="bg-green-50 p-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <StatusPill 
                  status={getStatusType(quiz.dueDateStr)} 
                  dateStr={quiz.dueDateStr ? format(new Date(quiz.dueDateStr), 'dd MMM yyyy') : undefined} 
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{quiz.duration} min</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                <span><span className="text-gray-900 font-bold">{quiz.count}</span> Questions</span>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                <span><span className="text-gray-900 font-bold">{quiz.totalMarks}</span> Marks</span>
              </div>
              
              {quiz.status === QuizStatus.PENDING ? (
                <Link 
                  href={ROUTES.STUDENT.ASSIGNMENTS.ATTEMPT(quiz.id)}
                  className="bg-[#FF6B35] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#E85D25] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FF6B35]/20 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link 
                    href={ROUTES.STUDENT.ASSIGNMENTS.REVIEW(quiz.id)}
                    className="bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all flex items-center gap-2 border border-gray-100"
                  >
                    <FileText className="w-4 h-4" />
                    Review
                  </Link>
                  <div className="text-right border-l pl-4 border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-extrabold mb-0.5">Score</p>
                    <p className="text-xl font-black text-[#20C997]">
                      {quiz.score !== undefined ? `${quiz.score}/${quiz.totalMarks}` : '--'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <EmptyState filter={filter} />
      )}
    </div>
  );
}

/**
 * Helper component for statistic cards.
 */
interface StatCardProps {
  icon: React.ReactNode;
  title: string | number;
  label: string;
  borderColor: string;
  iconBg: string;
}

function StatCard({ icon, title, label, borderColor, iconBg }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl p-4 shadow-sm border-l-4 transition-transform hover:scale-[1.02]', borderColor)}>
      <div className="flex items-center gap-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBg)}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-black text-gray-900 leading-none mb-1">{title}</p>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{label}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper component for empty states.
 */
function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-50">
      <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <FileText className="w-10 h-10 text-gray-200" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No assignments found</h3>
      <p className="text-gray-500 max-w-sm mx-auto font-medium">
        {filter === QuizStatus.PENDING
          ? "You're all caught up! No pending assignments at the moment."
          : filter === QuizStatus.COMPLETED
          ? "You haven't completed any assignments yet. Start one now!"
          : 'No assignments have been assigned to your class yet.'}
      </p>
    </div>
  );
}
