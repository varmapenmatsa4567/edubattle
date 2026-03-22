/**
 * Quiz Attempt Screen
 * Provides the interactive interface for students to take a quiz, including timer, 
 * navigation, and submission logic.
 */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Flag, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2 
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useRequireRole } from '@/hooks/useRequireRole';
import { Role, ROUTES, CONFIG } from '@/constants';
import { getQuizById, saveFullQuizResult } from '@/services/quizService';
import { getStudentDetails } from '@/services/studentService';
import { Quiz, Question, Student } from '@/types';
import { useQuizTimer } from '@/hooks/useQuizTimer';
import { cn } from '@/lib/utils';

export default function QuizAttemptScreen() {
  const { id: quizId } = useParams<{ id: string }>();
  const router = useRouter();
  const { loading: authLoading, user } = useRequireRole(Role.STUDENT);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const DUMMY_CHAPTER = 'General Review';

  /**
   * Fetches quiz and student data on mount.
   */
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!user?.id || !quizId) return;

      setLoading(true);
      try {
        const [quizData, studentData] = await Promise.all([
          getQuizById(quizId),
          getStudentDetails(user.id)
        ]);

        if (quizData) {
          setQuiz(quizData);
          setQuestions(quizData.questions || []);
        }
        if (studentData) {
          setStudent(studentData);
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        toast.error('Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [user?.id, quizId]);

  /**
   * Final quiz submission logic.
   */
  const handleFinalSubmit = useCallback(async () => {
    if (isSubmitting || submitted) return;
    setIsSubmitting(true);
    
    // Prepare detailed answers for persistence
    const detailedAnswers = questions.map((q, i) => {
      const selectedIndex = answers[i];
      const selectedOption = selectedIndex !== undefined ? q.options[selectedIndex] : null;
      const isCorrect = selectedOption === q.answer;
      return {
        question_id: q.id,
        selected_option: selectedOption || 'Unanswered',
        is_correct: isCorrect
      };
    });

    const correctCount = detailedAnswers.filter(a => a.is_correct).length;
    
    try {
      if (student?.id && quizId) {
        await saveFullQuizResult(
          student.id, 
          quizId, 
          student.school_id || '', 
          student.class?.id || '', 
          correctCount, 
          questions.length,
          detailedAnswers
        );
        toast.success('Quiz submitted successfully!');
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast.error('Failed to save results, but you finished the quiz!');
      setSubmitted(true); 
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, submitted, questions, answers, student, quizId]);

  // Use custom timer hook
  const initialSeconds = useMemo(() => 
    quiz ? (quiz.time || CONFIG.DEFAULT_QUIZ_TIME_MINS) * 60 : null
  , [quiz]);

  const { timeLeft, formatTime } = useQuizTimer(
    initialSeconds,
    handleFinalSubmit,
    !submitted && !loading
  );

  const totalQuestions = questions.length;
  const currentQ = questions[currentIndex];

  const selectAnswer = (optIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));
  };

  const goTo = (idx: number) => {
    setCurrentIndex(idx);
  };

  const goNext = () => { if (currentIndex < totalQuestions - 1) goTo(currentIndex + 1); };
  const goPrev = () => { if (currentIndex > 0) goTo(currentIndex - 1); };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  };

  const score = useMemo(() => 
    questions.reduce((acc, q, i) => acc + (q.options[answers[i]] === q.answer ? 1 : 0), 0)
  , [questions, answers]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
        <p className="text-gray-500 animate-pulse font-medium">Preparing your quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
          <p className="text-red-600 font-bold text-lg mb-2">Quiz not found</p>
          <p className="text-red-400 text-sm">Please check the link and try again.</p>
        </div>
        <button 
          onClick={() => router.push(ROUTES.STUDENT.ASSIGNMENTS.LIST)} 
          className="text-[#FF6B35] hover:text-[#E85D25] font-bold flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={18} /> Back to My Assignments
        </button>
      </div>
    );
  }

  if (submitted) {
    const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4">
        <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-lg w-full text-center border border-gray-100 animate-in fade-in zoom-in duration-500">
          <div className={cn(
            'w-36 h-36 rounded-full mx-auto flex flex-col items-center justify-center mb-8 shadow-xl border-4 transition-all duration-700',
            pct >= 80 ? 'bg-green-50 text-green-600 border-green-100 shadow-green-100' : 
            pct >= 60 ? 'bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100' : 
            'bg-red-50 text-red-600 border-red-100 shadow-red-100'
          )}>
            <span className="text-5xl font-black mb-1">{pct}%</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Success</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Well Done!</h2>
          <p className="text-gray-500 mb-10 text-lg font-medium">{quiz.title}</p>
          
          <div className="grid grid-cols-3 gap-4 text-center mb-10">
            <StatResult label="Correct" value={`${score}/${totalQuestions}`} color="text-green-600" />
            <StatResult label="XP Gained" value={`+${Math.round(pct * 0.36)}`} color="text-[#FF6B35]" />
            <StatResult label="Missed" value={totalQuestions - score} color="text-red-500" />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push(ROUTES.STUDENT.ASSIGNMENTS.LIST)}
              className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-700 text-sm font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
            >
              Assignments
            </button>
            <button
              onClick={() => router.push(quizId ? ROUTES.STUDENT.ASSIGNMENTS.REVIEW(quizId) : ROUTES.STUDENT.ASSIGNMENTS.LIST)}
              className="flex-1 px-6 py-4 bg-[#FF6B35] text-white text-sm font-black rounded-2xl hover:bg-[#E85D25] hover:shadow-lg shadow-[#FF6B35]/20 transition-all active:scale-95"
            >
              Review Answers
            </button>
          </div>
        </div>
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
            <h1 className="font-black text-lg text-gray-900 line-clamp-1">{quiz.title}</h1>
            <p className="text-[11px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-wide">
              <span>{quiz.subjects?.subject_name || 'General'}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{DUMMY_CHAPTER}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          {timeLeft !== null && initialSeconds !== null && (
            <div className="relative flex items-center justify-center">
              <TimerRing 
                progress={timeLeft / initialSeconds} 
                colorClass={
                  timeLeft < 60 ? 'text-red-500' : 
                  timeLeft < 300 ? 'text-orange-500' : 
                  'text-green-500'
                }
              />
              <div className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black transition-colors duration-300',
                timeLeft < 60 ? 'text-red-600' : 
                timeLeft < 300 ? 'text-orange-600' : 
                'text-green-600'
              )}>
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
          )}
          <span className="text-xs font-black text-gray-400 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 uppercase tracking-widest">
            {currentIndex + 1} <span className="opacity-40">/</span> {totalQuestions}
          </span>
        </div>
      </header>

      {/* Progress Line */}
      <div className="h-1.5 bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-[#FF6B35] transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(255,107,53,0.5)]"
          style={{ width: `${totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0}%` }}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-gray-100 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Navigation</p>
            <span className="text-xs font-black text-[#FF6B35] bg-orange-50 px-2 py-1 rounded-md">
              {Math.round((Object.keys(answers).length / totalQuestions) * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-12">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== undefined;
              const isCurrent = i === currentIndex;
              const isFlagged = flagged.has(i);
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    'w-12 h-12 rounded-2xl text-xs font-black flex items-center justify-center transition-all active:scale-90 relative border-2',
                    isCurrent ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-lg shadow-orange-100 scale-105' :
                    isAnswered ? 'bg-gray-900 text-white border-gray-900 group-hover:bg-gray-800' :
                    'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                  )}
                >
                  {i + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-[8px] text-white">
                      !
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="space-y-4 mb-12">
            <LegendItem color="bg-gray-900" label="Answered" />
            <LegendItem color="bg-[#FF6B35]" label="Current" />
            <LegendItem color="bg-orange-500" label="Flagged" isFlag />
            <LegendItem color="bg-white border-2 border-gray-100" label="Unvisited" />
          </div>

          <div className="mt-auto">
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting || Object.keys(answers).length === 0}
              className="w-full px-6 py-5 bg-[#FF6B35] text-white text-sm font-black rounded-2xl hover:bg-[#E85D25] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-[#FF6B35]/20 flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              Finish Quiz
            </button>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col items-center p-4 overflow-y-auto custom-scrollbar">
          {currentQ && (
            <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-500">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center text-lg font-black">
                    {currentIndex + 1}
                  </span>
                  <div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Question</span>
                    <p className="text-sm font-bold text-gray-900">Step to success</p>
                  </div>
                </div>
                <button
                  onClick={toggleFlag}
                  className={cn(
                    'flex items-center gap-2 text-xs font-black px-6 py-3 rounded-2xl transition-all border-2 uppercase tracking-widest',
                    flagged.has(currentIndex) 
                      ? 'text-orange-500 bg-orange-50 border-orange-100 shadow-sm' 
                      : 'text-gray-400 border-gray-50 hover:border-gray-100 hover:text-gray-600'
                  )}
                >
                  <Flag size={14} fill={flagged.has(currentIndex) ? 'currentColor' : 'none'} /> 
                  {flagged.has(currentIndex) ? 'Flagged' : 'Flag Question'}
                </button>
              </div>

              {/* Question Box */}
              <div className="bg-white rounded-[32px] px-4 py-2 lg:px-6 lg:py-4 shadow-sm border border-gray-100 mb-10">
                <h2 className="text-md lg:text-xl font-bold text-gray-900 leading-relaxed tracking-tight">
                  {currentQ.question}
                </h2>
              </div>

              {/* Options Grid */}
              <div className="grid gap-2">
                {currentQ.options.map((opt, i) => {
                  const isSelected = answers[currentIndex] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => selectAnswer(i)}
                      className={cn(
                        'w-full text-left p-2 rounded-2xl border-2 transition-all duration-300 active:scale-[0.99] flex items-center gap-5 group',
                        isSelected
                          ? 'border-[#FF6B35] bg-orange-50/30'
                          : 'border-white bg-white hover:border-[#FF6B35]/20 shadow-sm hover:shadow-md'
                      )}
                    >
                      <span className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-all duration-300',
                        isSelected
                          ? 'bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/30 scale-105'
                          : 'bg-gray-50 text-gray-400 group-hover:bg-[#FF6B35]/10 group-hover:text-[#FF6B35]'
                      )}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className={cn(
                        'text-md font-bold transition-colors',
                        isSelected ? 'text-[#FF6B35]' : 'text-gray-700 font-semibold'
                      )}>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

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
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-3 px-10 py-4 bg-green-600 text-white text-xs font-black rounded-2xl hover:bg-green-700 transition-all active:scale-95 shadow-xl shadow-green-100 uppercase tracking-widest"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Final Submission'}
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
 * Result stat atom component.
 */
function StatResult({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
      <p className={cn('text-2xl font-black mb-1', color)}>{value}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">{label}</p>
    </div>
  );
}

/**
 * Sidebar legend item.
 */
function LegendItem({ color, label, isFlag }: { color: string, label: string, isFlag?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-black text-gray-500 uppercase tracking-wider">
      <span className={cn('w-4 h-4 rounded-md relative', color)}>
        {isFlag && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 border border-white" />}
      </span> 
      <span>{label}</span>
    </div>
  );
}

/**
 * Circular progress ring for the timer.
 */
function TimerRing({ progress, colorClass }: { progress: number; colorClass: string }) {
  const size = 44;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <svg width={size} height={size} className="absolute rotate-[-90deg]">
      {/* Background Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-gray-100"
      />
      {/* Progress Ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        style={{ 
          strokeDashoffset: offset,
          transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease'
        }}
        strokeLinecap="round"
        className={colorClass}
      />
    </svg>
  );
}
