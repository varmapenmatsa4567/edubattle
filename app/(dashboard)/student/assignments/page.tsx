"use client";
import { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, CheckCircle, AlertCircle, Play, Loader2 } from 'lucide-react';
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getStudentDetails } from "@/services/studentService";
import { getQuizzesByClass, getQuizResultByStudent } from "@/services/quizService";

// --- Helpers (hardcoded/static values) ---
const HARDCODED_DUE_DATE = "2026-04-30";
const HARDCODED_DURATION_MINS = 30;
const MARKS_PER_QUESTION = 2;

interface EnrichedQuiz {
  id: string;
  title: string;
  subject: string;
  questions: number;
  totalMarks: number;
  duration: number;
  dueDate: string;
  status: 'pending' | 'completed';
  score?: number;
}

export default function Assignments() {
  const { loading: authLoading, user } = useRequireRole(ROLES.STUDENT);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [assignments, setassignments] = useState<EnrichedQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        // 1. Get student details (for class_id and student id)
        const student = await getStudentDetails(user.id);
        if (!student?.class?.id) {
          setIsLoading(false);
          return;
        }

        // 2. Fetch assignments for this student's class
        const rawassignments = await getQuizzesByClass(student.class.id);
        if (!rawassignments) {
          setIsLoading(false);
          return;
        }

        // 3. Check completion status for each quiz in parallel
        const enriched = await Promise.all(
          rawassignments.map(async (quiz: any) => {
            const result = await getQuizResultByStudent(student.id, quiz.id);
            const questionCount = quiz.count ?? 0;
            return {
              id: quiz.id,
              title: quiz.title,
              subject: quiz.subjects?.subject_name ?? "General",
              questions: questionCount,
              totalMarks: questionCount * MARKS_PER_QUESTION,
              duration: HARDCODED_DURATION_MINS,
              dueDate: HARDCODED_DUE_DATE,
              status: result ? 'completed' : 'pending',
              score: result?.score ?? undefined,
            } as EnrichedQuiz;
          })
        );

        setassignments(enriched);
      } catch (err) {
        console.error("Failed to load assignments:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredassignments = filter === 'all'
    ? assignments
    : assignments.filter((q) => q.status === filter);

  const pendingCount = assignments.filter((q) => q.status === 'pending').length;
  const completedCount = assignments.filter((q) => q.status === 'completed').length;

  const getDueDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: 'Overdue', cls: 'text-[#E24B4A] bg-red-50' };
    if (diff === 0) return { label: 'Due Today', cls: 'text-[#FF6B35] bg-orange-50' };
    return {
      label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      cls: 'text-gray-600 bg-gray-50',
    };
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
        <p className="text-gray-600">Complete your assignments to earn XP and improve your rank</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#FF6B35]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              <p className="text-sm text-gray-600">Total assignments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-2 shadow-sm mb-6 inline-flex gap-2">
        {(['all', 'pending', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === tab ? 'bg-[#FF6B35] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Quiz Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredassignments.map((quiz) => {
          const due = getDueDateLabel(quiz.dueDate);
          return (
            <div
              key={quiz.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-3 h-3 rounded-full mt-2 ${quiz.status === 'completed' ? 'bg-green-500' : 'bg-[#FF6B35]'}`} />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                    <p className="text-sm text-gray-600">{quiz.subject}</p>
                  </div>
                </div>
                {quiz.status === 'completed' && (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${due.cls}`}>
                    {due.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{quiz.duration} min</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{quiz.questions}</span> Questions
                  <span className="mx-2">•</span>
                  <span className="font-medium text-gray-900">{quiz.totalMarks}</span> Marks
                </div>
                {quiz.status === 'pending' ? (
                  <button className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#FF6B35]/90 transition-colors flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Start
                  </button>
                ) : (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-lg font-bold text-[#1D9E75]">
                      {quiz.score !== undefined ? `${quiz.score}/${quiz.totalMarks}` : `✓ Done`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredassignments.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600">
            {filter === 'pending'
              ? "You're all caught up! No pending assignments."
              : filter === 'completed'
              ? "You haven't completed any assignments yet."
              : 'No assignments have been assigned to your class yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
