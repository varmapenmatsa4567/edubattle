"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock, Flag, BookOpen, CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getQuizById, saveFullQuizResult } from "@/services/quizService";
import { getStudentDetails } from "@/services/studentService";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string; // index
}

export default function QuizAttemptScreen() {
  const { id: quizId } = useParams<{ id: string }>();
  const router = useRouter();
  const { loading: authLoading, user } = useRequireRole(ROLES.STUDENT);

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [student, setStudent] = useState<any>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Constants / Dummy data for beauty
  const MARKS_PER_QUESTION = 2;
  const DUMMY_CHAPTER = "General Review";
  const DEFAULT_TIME_LIMIT = 30; // 30 mins

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
          // Use real count or default
          const timeLimit = quizData.time_limit || DEFAULT_TIME_LIMIT;
          setTimeLeft(timeLimit * 60);
        }
        if (studentData) {
          setStudent(studentData);
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        toast.error("Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [user, quizId]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;
    const interval = setInterval(() => setTimeLeft((t) => (t !== null && t > 0 ? t - 1 : t)), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, submitted]);

  // Auto-submit on time up
  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      handleFinalSubmit();
    };
  }, [timeLeft, submitted]);

  const totalQuestions = questions.length;
  const currentQ = questions[currentIndex];

  const selectAnswer = (optIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));
    // In actual quiz mode, we don't usually show explanations immediately
    // but the original code had a practice mode check. Keeping it simple.
  };

  const goTo = (idx: number) => {
    setShowExplanation(false);
    setCurrentIndex(idx);
  };
  const goNext = () => { if (currentIndex < totalQuestions - 1) goTo(currentIndex + 1); };
  const goPrev = () => { if (currentIndex > 0) goTo(currentIndex - 1); };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(currentIndex) ? next.delete(currentIndex) : next.add(currentIndex);
      return next;
    });
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Prepare detailed answers for the database
    const detailedAnswers = questions.map((q, i) => {
      const selectedIndex = answers[i];
      const selectedOption = selectedIndex !== undefined ? q.options[selectedIndex] : null;
      const isCorrect = selectedOption === q.answer;
      return {
        question_id: q.id,
        selected_option: selectedOption || "Unanswered",
        is_correct: isCorrect
      };
    });

    const correctCount = detailedAnswers.filter(a => a.is_correct).length;
    
    try {
      if (student?.id && quizId) {
        // saveFullQuizResult handles: attempts, answers, xp_logs, and student_xp update
        await saveFullQuizResult(
          student.id, 
          quizId, 
          student.school_id, 
          student.class?.id, 
          correctCount, 
          totalQuestions,
          detailedAnswers
        );
        toast.success("Quiz submitted successfully!");
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error("Failed to save results, but you finished the quiz!");
      setSubmitted(true); // Still show success screen locally
    } finally {
      setIsSubmitting(false);
    }
  };

  const score = submitted
    ? questions.reduce((acc, q, i) => acc + (q.options[answers[i]] === q.answer ? 1 : 0), 0)
    : 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading Quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground font-medium text-lg">Quiz not found.</p>
        <button onClick={() => router.push("/student/assignments")} className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Assignments
        </button>
      </div>
    );
  }

  if (submitted) {
    const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-card p-10 max-w-lg w-full text-center border border-border animate-slide-up">
          <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center text-4xl font-extrabold mb-6 shadow-sm ${
            pct >= 80 ? "bg-success/10 text-success border-2 border-success/20" : pct >= 60 ? "bg-warning/10 text-warning border-2 border-warning/20" : "bg-destructive/10 text-destructive border-2 border-destructive/20"
          }`}>
            {pct}%
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Quiz Completed!</h2>
          <p className="text-muted-foreground mb-8 text-lg font-medium">{quiz.title}</p>
          
          <div className="grid grid-cols-3 gap-4 text-center mb-8">
            <div className="bg-background rounded-xl p-4 border border-border">
              <p className="text-xl font-bold text-foreground">{score}/{totalQuestions}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Correct</p>
            </div>
            <div className="bg-background rounded-xl p-4 border border-border bg-accent/5">
              <p className="text-xl font-bold text-accent">+{Math.round(pct * 0.36)} XP</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Earned</p>
            </div>
            <div className="bg-background rounded-xl p-4 border border-border">
              <p className="text-xl font-bold text-foreground">{totalQuestions - score}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Wrong</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/student/assignments")}
              className="flex-1 px-6 py-3 border border-border text-foreground text-sm font-bold rounded-xl hover:bg-background transition-all active:scale-[0.98] shadow-sm"
            >
              Assignments
            </button>
            <button
              onClick={() => router.push("/student")}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex flex-col min-h-screen">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/student/assignments")} className="p-2 hover:bg-background rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-base text-foreground line-clamp-1">{quiz.title}</h1>
            <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <span>{quiz.subjects?.subject_name || "General"}</span>
              <span>•</span>
              <span>{DUMMY_CHAPTER}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-extrabold shadow-sm border ${
              timeLeft < 60 ? "bg-destructive/10 text-destructive border-destructive/20" : timeLeft < 300 ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20"
            }`}>
              <Clock size={14} className="animate-pulse" />
              {formatTime(timeLeft)}
            </div>
          )}
          <span className="text-xs font-bold text-muted-foreground bg-background px-3 py-1.5 rounded-lg border border-border">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
      </header>

      {/* ── Progress bar ── */}
      <div className="h-1.5 bg-border">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0}%` }}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ── Question grid sidebar ── */}
        <aside className="hidden lg:flex flex-col w-[260px] bg-card border-r border-border p-6 overflow-y-auto">
          <p className="text-[11px] font-bold text-muted-foreground mb-4 uppercase tracking-widest flex items-center justify-between">
            Navigation
            <span className="text-xs font-bold text-primary">{Math.round((Object.keys(answers).length / totalQuestions) * 100)}%</span>
          </p>
          <div className="grid grid-cols-4 gap-3">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== undefined;
              const isCurrent = i === currentIndex;
              const isFlagged = flagged.has(i);
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-10 h-10 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all active:scale-[0.9] relative border-2 ${
                    isCurrent
                      ? "bg-[#fe6b36] text-primary-foreground border-[#fe6b36] shadow-lg ring-2 ring-primary/20"
                      : isAnswered
                      ? "bg-green-800 text-white border-success/30 hover:bg-success/20"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {i + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-black border-2 border-card" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 space-y-3 px-1">
            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="w-4 h-4 rounded-md bg-green-800 border border-success/40" /> 
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="w-4 h-4 rounded-md bg-[#fe6b36] shadow-sm" /> 
              <span>Current</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="w-4 h-4 rounded-md bg-black border border-border relative">
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-warning" />
              </span> 
              <span>Flagged</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="w-4 h-4 rounded-md bg-background border-2 border-border" /> 
              <span>Unanswered</span>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting || Object.keys(answers).length === 0}
              className="w-full px-4 py-4 bg-[#fe6b36] text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Submit {Object.keys(answers).length}/{totalQuestions}
            </button>
          </div>
        </aside>

        {/* ── Main question area ── */}
        <div className="flex-1 flex flex-col items-center p-6 lg:p-12 overflow-y-auto bg-background/50">
          {currentQ && (
            <div className="w-full max-w-3xl animate-slide-up" key={currentIndex}>
              {/* Question number + flag */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{currentIndex + 1}</span>
                  Question of {totalQuestions}
                </span>
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all border ${
                    flagged.has(currentIndex) 
                      ? "text-warning bg-warning/10 border-warning/20 shadow-sm" 
                      : "text-muted-foreground hover:text-warning border-transparent hover:bg-warning/5"
                  }`}
                >
                  <Flag size={16} fill={flagged.has(currentIndex) ? "currentColor" : "none"} /> 
                  {flagged.has(currentIndex) ? "Flagged" : "Flag"}
                </button>
              </div>

              {/* Question text */}
              <div className="bg-card rounded-3xl p-4 shadow-sm border border-border mb-10">
                <h2 className="text-md lg:text-lg font-bold text-foreground leading-[1.4]">{currentQ.question}</h2>
              </div>

              {/* Options */}
              <div className="grid gap-3">
                {currentQ.options.map((opt, i) => {
                  const isSelected = answers[currentIndex] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => selectAnswer(i)}
                      className={`w-full text-left p-2 rounded-2xl border-2 transition-all duration-200 active:scale-[0.99] flex items-center gap-4 group ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-card/80 bg-card shadow-sm"
                      }`}
                    >
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20"
                          : "bg-background text-muted-foreground border-2 border-border group-hover:border-primary/30"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-base lg:text-md font-semibold text-foreground">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-12 mb-8">
                <button
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-muted-foreground border-2 border-border rounded-2xl hover:text-foreground hover:bg-card transition-all disabled:opacity-30 active:scale-[0.97]"
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                
                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={goNext}
                    className="flex items-center gap-2 px-8 py-3.5 bg-[#fe6b36] text-background text-sm font-black rounded-2xl hover:opacity-90 transition-all active:scale-[0.97] shadow-lg"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3.5 bg-success text-success-foreground text-sm font-black rounded-2xl hover:bg-success/90 transition-all active:scale-[0.97] shadow-lg"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Submit Quiz"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
