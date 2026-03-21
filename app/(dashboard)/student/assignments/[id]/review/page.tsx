"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Flag, CheckCircle2, XCircle, ArrowLeft, Loader2, Info } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getQuizAttemptWithAnswers } from "@/services/quizService";
import { getStudentDetails } from "@/services/studentService";
import { toast } from "sonner";

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
  const { id: quizId } = useParams<{ id: string }>();
  const router = useRouter();
  const { loading: authLoading, user } = useRequireRole(ROLES.STUDENT);

  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<ReviewAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewData = async () => {
      if (!user?.id || !quizId) return;

      setLoading(true);
      try {
        const studentData = await getStudentDetails(user.id);
        if (!studentData) {
          toast.error("Could not load student profile.");
          setLoading(false);
          return;
        }
        const attemptData = await getQuizAttemptWithAnswers(studentData.id, quizId);

        if (attemptData) {
          setAttempt(attemptData);
          setAnswers(attemptData.answers || []);
        } else {
          toast.error("Review data not found.");
        }
      } catch (err) {
        console.error("Error fetching review:", err);
        toast.error("Failed to load review data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [user, quizId]);

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
    <div className="bg-background flex flex-col min-h-screen">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/student/assignments")} className="p-2 hover:bg-background rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-base text-foreground line-clamp-1">Review: {attempt.quiz?.title}</h1>
            <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <span>{attempt.quiz?.subjects?.subject_name || "General"}</span>
              <span>•</span>
              <span className="text-success">{attempt.correct_count} Correct</span>
              <span>•</span>
              <span className="text-primary">{attempt.xp_earned} XP Earned</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-muted-foreground bg-background px-3 py-1.5 rounded-lg border border-border">
            Question {currentIndex + 1} / {totalQuestions}
          </span>
          <button 
            onClick={() => router.push("/student/assignments")}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all"
          >
            Done
          </button>
        </div>
      </header>

      {/* ── Correctness indicator bar ── */}
      <div className="h-1.5 bg-border flex">
        {answers.map((ans, i) => (
          <div 
            key={i} 
            className={`h-full flex-1 border-r border-card last:border-r-0 ${ans.is_correct ? 'bg-success' : 'bg-destructive'}`}
          />
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ── Question grid sidebar ── */}
        <aside className="hidden lg:flex flex-col w-[260px] bg-card border-r border-border p-6 overflow-y-auto">
          <p className="text-[11px] font-bold text-muted-foreground mb-4 uppercase tracking-widest flex items-center justify-between">
            Question Index
            <span className="text-xs font-bold text-success">{Math.round((attempt.correct_count / totalQuestions) * 100)}%</span>
          </p>
          <div className="grid grid-cols-4 gap-3">
            {answers.map((ans, i) => {
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-10 h-10 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all active:scale-[0.9] relative border-2 ${
                    isCurrent
                      ? "bg-primary text-primary-foreground border-primary shadow-lg ring-2 ring-primary/20"
                      : ans.is_correct
                      ? "bg-success/10 text-success border-success/30 hover:bg-success/20"
                      : "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 space-y-3 px-1">
            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="w-4 h-4 rounded-md bg-success border border-success/40" /> 
              <span>Correct Answer</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="w-4 h-4 rounded-md bg-destructive border border-destructive/40" /> 
              <span>Incorrect Answer</span>
            </div>
          </div>
        </aside>

        {/* ── Main display area ── */}
        <div className="flex-1 flex flex-col items-center p-6 lg:p-12 overflow-y-auto bg-background/50">
          {currentA && (
            <div className="w-full max-w-3xl animate-slide-up" key={currentIndex}>
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentA.is_correct ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                    {currentIndex + 1}
                  </span>
                  Question of {totalQuestions}
                </span>
                <span className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border ${currentA.is_correct ? 'text-success bg-success/10 border-success/20' : 'text-destructive bg-destructive/10 border-destructive/20'}`}>
                   {currentA.is_correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                   {currentA.is_correct ? "Correct" : "Incorrect"}
                </span>
              </div>

              {/* Question text */}
              <div className="bg-card rounded-3xl p-6 lg:p-8 shadow-sm border border-border mb-8">
                <h2 className="text-lg lg:text-xl font-bold text-foreground leading-[1.4]">{currentA.question_text}</h2>
              </div>

              {/* Options */}
              <div className="grid gap-3">
                {currentA.options.map((opt, i) => {
                  const isStudentChoice = currentA.selected_option === opt;
                  const isCorrectAnswer = currentA.correct_answer === opt;
                  
                  let borderClass = "border-border";
                  let bgClass = "bg-card";
                  let icon = null;

                  if (isCorrectAnswer) {
                    borderClass = "border-green-600 bg-success/5 shadow-sm";
                    icon = <CheckCircle2 className="text-success ml-auto" size={20} />;
                  } else if (isStudentChoice && !isCorrectAnswer) {
                    borderClass = "border-destructive bg-destructive/5 shadow-sm";
                    icon = <XCircle className="text-destructive ml-auto" size={20} />;
                  }

                  return (
                    <div
                      key={i}
                      className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 ${bgClass} ${borderClass}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        isCorrectAnswer ? "bg-success border" : isStudentChoice ? "bg-destructive text-white" : "bg-background text-muted-foreground border border-border"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className={`text-base font-semibold ${isCorrectAnswer ? 'text-success' : isStudentChoice ? 'text-destructive' : 'text-foreground'}`}>
                        {opt}
                      </span>
                      {icon}
                      {isStudentChoice && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-black mr-2">Your Choice</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Feedback Area */}
              {!currentA.is_correct && (
                 <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-4">
                    <Info className="text-blue-500 shrink-0" size={24} />
                    <div>
                        <p className="text-sm font-bold text-blue-900 mb-1">Learning Note</p>
                        <p className="text-sm text-blue-700 leading-relaxed">
                           You selected <b>{currentA.selected_option}</b>. The correct answer was <b>{currentA.correct_answer}</b>. 
                           Review the core concepts related to this topic to master it!
                        </p>
                    </div>
                 </div>
              )}

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
                    className="flex items-center gap-2 px-8 py-3.5 bg-foreground text-background text-sm font-black rounded-2xl hover:opacity-90 transition-all active:scale-[0.97] shadow-lg"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => router.push("/student/assignments")}
                    className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground text-sm font-black rounded-2xl hover:opacity-90 transition-all active:scale-[0.97] shadow-lg"
                  >
                    Back to Assignments
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
