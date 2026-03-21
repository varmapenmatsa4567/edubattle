/**
 * Quiz Review Screen
 * Allows students to review their completed quiz attempts, showing correct answers, 
 * their selections, and performance statistics.
 */
'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Loader2, 
  Info 
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useRequireRole } from '@/hooks/useRequireRole';
import { Role, ROUTES } from '@/constants';
import { getQuizAttemptWithAnswers } from '@/services/quizService';
import { getStudentDetails } from '@/services/studentService';
import { QuizAttempt } from '@/types';
import { cn } from '@/lib/utils';

interface ReviewAnswer {
  id: string;
  selected_option: string;
  is_correct: boolean;
  question_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
}

export default function QuizReviewScreen() {
  const params = useParams();
  const quizId = params.id as string;
  const router = useRouter();
  const { loading: authLoading, user } = useRequireRole(Role.STUDENT);

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewData = async () => {
      if (!user?.id || !quizId) return;

      setLoading(true);
      try {
        const studentData = await getStudentDetails(user.id);
        if (!studentData) {
          toast.error('Could not load student profile.');
          setLoading(false);
          return;
        }

        const attemptData = await getQuizAttemptWithAnswers(studentData.id, quizId);
        if (attemptData) {
          setAttempt(attemptData);
          setAnswers(attemptData.answers || []);
        } else {
          toast.error('Review data not found.');
        }
      } catch (err) {
        console.error('Error fetching review:', err);
        toast.error('Failed to load review data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [user?.id, quizId]);

  const totalQuestions = answers.length;
  const currentA = answers[currentIndex];

  const goTo = (idx: number) => {
    setCurrentIndex(idx);
  };
  const goNext = () => { if (currentIndex < totalQuestions - 1) goTo(currentIndex + 1); };
  const goPrev = () => { if (currentIndex > 0) goTo(currentIndex - 1); };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading Review...</p>
      </div>
    );
  }

  if (!attempt || answers.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground font-medium text-lg">Review data not available.</p>
        <button onClick={() => router.push("/student/assignments")} className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Assignments
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 lg:px-12 shadow-sm">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => router.push(ROUTES.STUDENT.ASSIGNMENTS.LIST)} 
            className="p-3 hover:bg-gray-50 rounded-2xl transition-all active:scale-90 border border-gray-50"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="font-black text-lg text-gray-900 line-clamp-1">Review: {attempt.quiz?.title}</h1>
            <p className="text-[11px] font-black flex items-center gap-2 uppercase tracking-wide">
              <span className="text-gray-400">{attempt.quiz?.subjects?.subject_name || 'General'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm" />
              <span className="text-green-600">{attempt.correct_count ?? 0} Correct</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] shadow-sm" />
              <span className="text-[#FF6B35]">{attempt.xp_earned ?? 0} XP Earned</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs font-black text-gray-400 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 uppercase tracking-widest">
            Question {currentIndex + 1} <span className="opacity-40">/</span> {totalQuestions}
          </span>
          <button 
            onClick={() => router.push(ROUTES.STUDENT.ASSIGNMENTS.LIST)}
            className="px-6 py-2.5 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all active:scale-95 uppercase tracking-widest"
          >
            Done
          </button>
        </div>
      </header>

      {/* Correctness Bar */}
      <div className="h-1.5 bg-gray-100 flex shadow-inner">
        {answers.map((ans, i) => (
          <div 
            key={i} 
            className={cn(
              'h-full flex-1 border-r border-white/20 last:border-r-0 transition-opacity hover:opacity-80 cursor-pointer',
              ans.is_correct ? 'bg-green-500' : 'bg-red-500'
            )}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-gray-100 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Questions</p>
            <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">
              {totalQuestions > 0 ? Math.round(((attempt.correct_count ?? 0) / totalQuestions) * 100) : 0}% Accuracy
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-10">
            {answers.map((ans, i) => {
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    'w-12 h-12 rounded-2xl text-xs font-black flex items-center justify-center transition-all active:scale-90 relative border-2',
                    isCurrent ? 'bg-white border-gray-900 text-gray-900 shadow-lg scale-110 z-10' :
                    ans.is_correct ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          
          <div className="space-y-4">
            <LegendItem color="bg-green-500" label="Correct" />
            <LegendItem color="bg-red-500" label="Incorrect" />
            <LegendItem color="bg-white border-2 border-gray-900" label="Selected" />
          </div>
        </aside>

        {/* Main Review Area */}
        <main className="flex-1 flex flex-col items-center p-8 lg:p-16 overflow-y-auto custom-scrollbar bg-white/50">
          {currentA && (
            <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-500" key={currentIndex}>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black',
                    currentA.is_correct ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  )}>
                    {currentIndex + 1}
                  </span>
                  <div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Question</span>
                    <p className="text-sm font-bold text-gray-900">Reviewing Performance</p>
                  </div>
                </div>
                <span className={cn(
                  'flex items-center gap-2 text-xs font-black px-6 py-3 rounded-2xl border-2 uppercase tracking-widest',
                  currentA.is_correct ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'
                )}>
                   {currentA.is_correct ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                   {currentA.is_correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>

              {/* Question Text */}
              <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-sm border border-gray-100 mb-10">
                <h2 className="text-xl lg:text-2xl font-black text-gray-900 leading-relaxed tracking-tight">
                  {currentA.question_text}
                </h2>
              </div>

              {/* Options Analysis */}
              <div className="grid gap-4">
                {(currentA.options as string[]).map((opt: string, i: number) => {
                  const isStudentChoice = currentA.selected_option === opt;
                  const isCorrectAnswer = currentA.correct_answer === opt;
                  
                  return (
                    <div
                      key={i}
                      className={cn(
                        'w-full p-2 rounded-2xl border-2 flex items-center gap-5 transition-all duration-300',
                        isCorrectAnswer ? 'border-green-500 bg-green-50/30' : 
                        isStudentChoice ? 'border-red-500 bg-red-50/30' : 
                        'border-white bg-white shadow-sm'
                      )}
                    >
                      <span className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 border-2',
                        isCorrectAnswer ? 'bg-green-500 border-green-500 text-white' : 
                        isStudentChoice ? 'bg-red-500 border-red-500 text-white' : 
                        'bg-gray-50 border-gray-100 text-gray-400'
                      )}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className={cn(
                        'text-lg font-bold',
                        isCorrectAnswer ? 'text-green-700' : isStudentChoice ? 'text-red-700' : 'text-gray-700'
                      )}>
                        {opt}
                      </span>
                      
                      {isCorrectAnswer && <CheckCircle2 className="text-green-600 ml-auto mr-4" size={20} />}
                      {!isCorrectAnswer && isStudentChoice && <XCircle className="text-red-600 ml-auto mr-4" size={20} />}
                      
                      {isStudentChoice && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-4">Your Answer</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Learning Insight */}
              {!currentA.is_correct && (
                 <div className="mt-12 p-8 bg-blue-50/50 border-2 border-blue-100 rounded-[32px] flex gap-6 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                      <Info className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Learning Insight</p>
                        <p className="text-lg font-bold text-blue-900 mb-2">Keep going!</p>
                        <p className="text-sm text-blue-700/80 leading-relaxed font-medium">
                           You selected <b className="text-blue-900">{currentA.selected_option}</b>. The correct answer was <b className="text-green-700">{currentA.correct_answer}</b>. 
                           Tip: Revisit this topic in your dashboard to strengthen your understanding!
                        </p>
                    </div>
                 </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between mt-16 mb-12">
                <button
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-3 px-8 py-4 text-xs font-black text-gray-400 border-2 border-gray-100 rounded-2xl hover:text-gray-900 hover:border-gray-200 transition-all disabled:opacity-20 active:scale-95 uppercase tracking-widest"
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                
                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={goNext}
                    className="flex items-center gap-3 px-10 py-4 bg-gray-900 text-white text-xs font-black rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200 uppercase tracking-widest"
                  >
                    Next Question <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(ROUTES.STUDENT.ASSIGNMENTS.LIST)}
                    className="flex items-center gap-3 px-10 py-4 bg-[#FF6B35] text-white text-xs font-black rounded-2xl hover:bg-[#E85D25] transition-all active:scale-95 shadow-xl shadow-[#FF6B35]/20 uppercase tracking-widest"
                  >
                    Back to Assignments
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * Sidebar legend item component.
 */
function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">
      <span className={cn('w-4 h-4 rounded-md', color)} /> 
      <span>{label}</span>
    </div>
  );
}
