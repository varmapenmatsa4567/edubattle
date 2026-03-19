"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getQuizById, updateQuiz } from "@/services/quizService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Question {
  id?: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  isNew?: boolean;
}

function QuizEditContent() {
  const { loading, user } = useRequireRole(ROLES.TEACHER);
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = searchParams.get("quizId");

  const [loadingData, setLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (quizId) {
        setLoadingData(true);
        const data = await getQuizById(quizId);
        if (data) {
          setQuizTitle(data.title);
          setQuestions(data.questions || []);
        } else {
          toast.error("Quiz not found");
          router.push("/teacher/quizzes");
        }
        setLoadingData(false);
      }
    };
    fetchQuiz();
  }, [quizId, router]);

  // Handlers
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      question: "",
      options: ["", "", "", ""],
      answer: "",
      isNew: true
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleUpdateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[oIndex] = value;
    newQuestions[qIndex].options = newOptions;
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!quizTitle.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }

    if (questions.length === 0) {
      toast.error("Quiz must have at least one question");
      return;
    }

    // Basic validation
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return;
      }
      if (!questions[i].options || questions[i].options.some(opt => !opt.trim())) {
        toast.error(`Question ${i + 1} has empty options`);
        return;
      }
      if (!questions[i].answer.trim()) {
        toast.error(`Question ${i + 1} has no correct answer selected`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const success = await updateQuiz(quizId!, quizTitle, questions);
      if (success) {
        toast.success("Quiz updated successfully");
        router.push("/teacher/quizzes");
      } else {
        toast.error("Failed to update quiz");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* TOOLBAR */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">Edit Quiz</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {questions.length} Questions Total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()} className="rounded-lg">
            Discard
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-500 rounded-lg min-w-[120px] shadow-lg shadow-purple-500/10 text-white"
          >
            {isSaving ? <Spinner className="h-4 w-4 border-white mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* QUIZ TITLE CARD */}
      <Card className="border-l-4 border-l-purple-600 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-1">Quiz Title</label>
            <Input 
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g., Advanced Mathematics Assessment"
              className="text-2xl font-bold h-auto py-3 border-none focus-visible:ring-0 px-0 placeholder:opacity-50 text-black shadow-none"
            />
            <div className="h-px w-full bg-slate-100" />
            <p className="text-xs text-muted-foreground mt-2 italic font-medium">
              Changes will be applied to all sections where this quiz is active.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QUESTIONS LIST */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <Card key={qIndex} className="group border shadow-sm hover:border-purple-200 transition-all duration-300 overflow-visible relative bg-white">
             <div className="absolute -left-3 top-8 bg-white border h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs text-purple-600 shadow-sm z-10 group-hover:bg-purple-600 group-hover:text-white group-hover:scale-110 transition-all">
                {qIndex + 1}
              </div>

            <CardContent className="p-8 space-y-6">
              {/* Question Text */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Question Content</label>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteQuestion(qIndex)}
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea 
                  value={q.question}
                  onChange={(e) => handleUpdateQuestion(qIndex, "question", e.target.value)}
                  placeholder="Ask your question here..."
                  className="text-lg font-medium min-h-[100px] border-none bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-purple-200 rounded-xl p-4 resize-none text-black shadow-none"
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="group/opt relative">
                    <div className={cn(
                      "flex items-center gap-3 p-1 rounded-xl border transition-all",
                      q.answer === opt && opt !== "" 
                        ? "border-emerald-200 bg-emerald-50/30 ring-2 ring-emerald-500/20" 
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}>
                      <div className="flex-1 flex items-center gap-2 px-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 uppercase">
                          {String.fromCharCode(65 + oIndex)}
                        </div>
                        <Input 
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          className="border-none bg-transparent focus-visible:ring-0 font-medium h-9 text-sm text-black shadow-none"
                        />
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateQuestion(qIndex, "answer", opt)}
                        className={cn(
                          "h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider px-3 mr-1",
                          q.answer === opt && opt !== ""
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "text-slate-400 hover:bg-slate-100"
                        )}
                        disabled={!opt.trim()}
                      >
                        {q.answer === opt && opt !== "" ? (
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Correct</span>
                        ) : "Mark Correct"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanation (Optional) */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Explanation (Optional)</label>
                </div>
                <Input 
                  value={q.explanation || ""}
                  onChange={(e) => handleUpdateQuestion(qIndex, "explanation", e.target.value)}
                  placeholder="Explain why this answer is correct..."
                  className="bg-transparent border-t-0 border-x-0 border-b border-slate-100 rounded-none px-0 text-sm italic focus-visible:ring-0 focus-visible:border-purple-400 h-9 text-slate-600 shadow-none"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ADD QUESTION BUTTON */}
      <Button 
        onClick={handleAddQuestion}
        variant="outline"
        className="w-full h-16 border-dashed border-2 hover:border-purple-400 hover:bg-purple-50 rounded-2xl transition-all group bg-white"
      >
        <Plus className="h-5 w-5 mr-2 text-slate-400 group-hover:text-purple-600 group-hover:scale-110 transition-all" />
        <span className="font-bold text-slate-500 group-hover:text-purple-600">Add Another Question</span>
      </Button>
    </div>
  );
}

export default function TeacherQuizEditPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
      <QuizEditContent />
    </Suspense>
  );
}