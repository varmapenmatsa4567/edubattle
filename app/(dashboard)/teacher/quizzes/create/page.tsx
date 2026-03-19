"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Brain,
  FileEdit,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxEmpty, ComboboxList, ComboboxItem } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { useRequireRole } from "@/hooks/useRequireRole";
import { ROLES } from "@/constants/roles";
import { getTeacherDetails } from "@/services/teacherService";
import { createQuiz } from "@/services/quizService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ----- Types -----
interface ClassOption { id: string; label: string; }
interface SubjectOption { id: string; label: string; }
interface Question {
  question: string;
  options: string[];
  answer: string;
}

// ----- Inner component (needs searchParams) -----
function QuizCreateContent() {
  const { loading, user } = useRequireRole(ROLES.TEACHER);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const mode = (searchParams.get("mode") as "AI" | "Manual") || "AI";
  const classIdFromUrl = searchParams.get("class_id") || "";
  const isClassLocked = !!classIdFromUrl;

  const [teacher, setTeacher] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Derived options
  const [eligibleClasses, setEligibleClasses] = useState<ClassOption[]>([]);
  const [eligibleSubjects, setEligibleSubjects] = useState<SubjectOption[]>([]);

  // Form state
  const [selectedClassId, setSelectedClassId] = useState(classIdFromUrl);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  
  // AI Flow state
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  
  // Manual Flow state
  const [manualQuestions, setManualQuestions] = useState<Question[]>([
    { question: "", options: ["", "", "", ""], answer: "" }
  ]);
  
  // UI State
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  // Fetch teacher data
  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoadingData(true);
        const data = await getTeacherDetails(user.id);
        setTeacher(data);
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  // Build options
  useEffect(() => {
    if (!teacher?.class_subjects) return;

    const classMap: Record<string, ClassOption> = {};
    teacher.class_subjects.forEach((cs: any) => {
      if (cs.classes) {
        classMap[cs.classes.id] = {
          id: cs.classes.id,
          label: `Class ${cs.classes.class_name}-${cs.classes.section}`,
        };
      }
    });
    const classes = Object.values(classMap).sort((a, b) => a.label.localeCompare(b.label));
    setEligibleClasses(classes);

    if (isClassLocked) {
      buildSubjects(teacher, classIdFromUrl);
    }
  }, [teacher, classIdFromUrl, isClassLocked]);

  const buildSubjects = (teacherData: any, classId: string) => {
    if (!teacherData?.class_subjects || !classId) {
      setEligibleSubjects([]);
      return;
    }
    const filtered: SubjectOption[] = teacherData.class_subjects
      .filter((cs: any) => cs.classes?.id === classId && cs.subjects)
      .map((cs: any) => ({
        id: cs.subjects.id,
        label: cs.subjects.subject_name,
      }));
    setEligibleSubjects(filtered);
    setSelectedSubjectId(""); 
  };

  const handleClassChange = (value: string | null) => {
    const classEntry = eligibleClasses.find(c => c.label === value || c.id === value);
    if (classEntry) {
      setSelectedClassId(classEntry.id);
      buildSubjects(teacher, classEntry.id);
    }
  };

  const handleSubjectChange = (value: string | null) => {
    const subjectEntry = eligibleSubjects.find(s => s.label === value || s.id === value);
    if (subjectEntry) {
      setSelectedSubjectId(subjectEntry.id);
    }
  };

  // Manual Question Handlers
  const handleAddQuestion = () => {
    setManualQuestions([...manualQuestions, { question: "", options: ["", "", "", ""], answer: "" }]);
  };

  const handleDeleteQuestion = (index: number) => {
    setManualQuestions(manualQuestions.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...manualQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setManualQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].options[oIndex] = value;
    setManualQuestions(updated);
  };

  // AI Helpers
  const handleGenerateTitle = async () => {
    if (!topic) return;
    setIsGeneratingTitle(true);
    try {
      const response = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();
      if (data.title) setQuizTitle(data.title);
      else toast.error("Failed to generate title");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // Submit Logic
  const handleCreateQuizSubmit = async () => {
    if (!selectedClassId || !selectedSubjectId || !quizTitle) {
      toast.error("Please fill all required fields");
      return;
    }

    if (mode === "AI" && !topic) {
      toast.error("Please provide a topic for AI generation");
      return;
    }

    if (mode === "Manual") {
       if (manualQuestions.length === 0) {
         toast.error("Please add at least one question");
         return;
       }
       for (let i = 0; i < manualQuestions.length; i++) {
         const q = manualQuestions[i];
         if (!q.question.trim() || q.options.some(o => !o.trim()) || !q.answer.trim()) {
           toast.error(`Please complete Question ${i + 1}`);
           return;
         }
       }
    }

    setIsCreatingQuiz(true);
    try {
      let questionsToSave = [];
      let finalCount = questionCount;

      if (mode === "AI") {
        const genResponse = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, count: questionCount }),
        });
        const genData = await genResponse.json();
        if (!genData.questions || genData.questions.length === 0) throw new Error("AI Generation failed");
        questionsToSave = genData.questions;
      } else {
        questionsToSave = manualQuestions.map(q => ({
          text: q.question, // createQuiz uses 'text' property internally for bulk insert mapping
          options: q.options,
          answer: q.answer
        }));
        finalCount = manualQuestions.length;
      }

      const result = await createQuiz(
        teacher.school_id,
        selectedClassId,
        teacher.id,
        selectedSubjectId,
        quizTitle,
        finalCount,
        questionsToSave
      );

      if (result) {
        toast.success("Quiz created successfully!");
        router.push("/teacher/quizzes");
      } else {
        toast.error("Failed to save quiz");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsCreatingQuiz(false);
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
    <div className="w-full max-w-4xl mx-auto pb-24 space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              {mode === "AI" ? <Sparkles className="h-6 w-6 text-purple-600" /> : <FileEdit className="h-6 w-6 text-purple-600" />}
              Create New {mode === "AI" ? "AI" : "Manual"} Quiz
            </h1>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              {mode === "AI" ? "AI-Powered Generation" : "Direct Manual Entry"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()} className="rounded-lg h-11 px-6">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateQuizSubmit} 
            disabled={isCreatingQuiz}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg min-w-[160px] h-11 shadow-lg shadow-purple-500/10 font-bold"
          >
            {isCreatingQuiz ? <Spinner className="h-4 w-4 border-white mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {mode === "AI" ? "Generate & Create" : "Create Quiz"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: SETUP */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 space-y-6 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-sm sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b pb-2">Quiz Setup</h3>
            
            {/* CLASS */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Class / Grade</label>
              {isClassLocked ? (
                <Input value={eligibleClasses.find(c => c.id === classIdFromUrl)?.label || selectedClassId} readOnly disabled className="bg-slate-50 font-medium h-10 rounded-xl" />
              ) : (
                <Combobox items={eligibleClasses.map(c => c.label)} onValueChange={handleClassChange}>
                  <ComboboxInput placeholder="Select Class" className="h-10 rounded-xl" />
                  <ComboboxContent>
                    <ComboboxEmpty>No classes found.</ComboboxEmpty>
                    <ComboboxList>
                      {eligibleClasses.map(cls => <ComboboxItem key={cls.id} value={cls.label}>{cls.label}</ComboboxItem>)}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              )}
            </div>

            {/* SUBJECT */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
              <Combobox items={eligibleSubjects.map(s => s.label)} onValueChange={handleSubjectChange} disabled={!selectedClassId}>
                <ComboboxInput placeholder={selectedClassId ? "Select Subject" : "Select class first"} className="h-10 rounded-xl" disabled={!selectedClassId} />
                <ComboboxContent>
                  <ComboboxEmpty>No subjects found.</ComboboxEmpty>
                  <ComboboxList>
                    {eligibleSubjects.map(sub => <ComboboxItem key={sub.id} value={sub.label}>{sub.label}</ComboboxItem>)}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {/* AI SPECIFIC: TOPIC */}
            {mode === "AI" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Topic / Context</label>
                <Textarea 
                  placeholder="e.g., Photosynthesis basics..." 
                  className="resize-none h-24 rounded-xl text-sm" 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            )}

            {/* QUIZ TITLE */}
            <div className="flex flex-col gap-1.5 pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Quiz Title</label>
              <div className={cn("space-y-2", mode === "AI" && "flex flex-col")}>
                <Input 
                  placeholder="Assessment Title" 
                  className="h-10 rounded-xl" 
                  value={quizTitle} 
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
                {mode === "AI" && (
                  <Button 
                    variant="outline"
                    disabled={!topic || isGeneratingTitle} 
                    className="w-full text-xs font-bold bg-slate-50 hover:bg-slate-100 h-9 rounded-xl gap-2 border-dashed"
                    onClick={handleGenerateTitle}
                  >
                    {isGeneratingTitle ? <Spinner className="h-3 w-3" /> : <Sparkles className="h-3 w-3 text-purple-600" />}
                    Auto-generate Title
                  </Button>
                )}
              </div>
            </div>

            {/* AI SPECIFIC: QUESTION COUNT */}
            {mode === "AI" && (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                  <span>Count</span>
                  <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{questionCount} Qs</span>
                </div>
                <Slider min={5} max={50} step={1} value={[questionCount]} onValueChange={(val) => setQuestionCount(val[0])} />
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: PREVIEW/ENTRY */}
        <div className="lg:col-span-2">
          {mode === "Manual" ? (
             <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Questions List</h3>
                   <Button onClick={handleAddQuestion} variant="outline" size="sm" className="rounded-full bg-white gap-2 border-purple-200 text-purple-600 hover:bg-purple-50">
                      <Plus className="h-4 w-4" /> Add Question
                   </Button>
                </div>
                {manualQuestions.map((q, qIndex) => (
                  <Card key={qIndex} className="group border shadow-sm hover:border-purple-200 transition-all duration-300 relative bg-white dark:bg-zinc-950">
                    <div className="absolute -left-3 top-6 bg-white dark:bg-zinc-900 border h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] text-purple-600 shadow-sm z-10 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      {qIndex + 1}
                    </div>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Question Content</label>
                           <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(qIndex)} className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md">
                              <Trash2 className="h-3.5 w-3.5" />
                           </Button>
                        </div>
                        <Input 
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(qIndex, "question", e.target.value)}
                          placeholder="Your question here..."
                          className="text-base font-semibold border-none bg-slate-50 dark:bg-zinc-900/50 focus-visible:ring-1 focus-visible:ring-purple-200 rounded-lg p-4 h-12"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2 p-1 bg-white dark:bg-zinc-900 border rounded-lg hover:border-slate-300 transition-all">
                            <Input 
                              value={opt}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                              className="border-none bg-transparent focus-visible:ring-0 text-xs py-0 h-8"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleUpdateQuestion(qIndex, "answer", opt)}
                              className={cn(
                                "h-7 rounded-md text-[9px] font-bold uppercase tracking-tight px-2",
                                q.answer === opt && opt !== "" ? "bg-emerald-500 text-white hover:bg-emerald-600" : "text-slate-400 hover:bg-slate-50"
                              )}
                              disabled={!opt.trim()}
                            >
                              {q.answer === opt && opt !== "" ? "Correct" : "Set Correct"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button 
                  onClick={handleAddQuestion}
                  variant="outline"
                  className="w-full h-20 border-dashed border-2 hover:border-purple-400 hover:bg-purple-50 rounded-2xl transition-all group bg-white dark:bg-zinc-950"
                >
                  <Plus className="h-5 w-5 mr-2 text-slate-300 group-hover:text-purple-600 transition-all" />
                  <span className="font-bold text-slate-400 group-hover:text-purple-600">Click here to add another question</span>
                </Button>
             </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-3xl bg-slate-50/30 dark:bg-zinc-900/10 p-12 text-center space-y-6">
                <div className="h-20 w-20 bg-purple-100 dark:bg-purple-900/30 rounded-3xl flex items-center justify-center animate-bounce duration-3000">
                   <Brain className="h-10 w-10 text-purple-600" />
                </div>
                <div className="max-w-sm space-y-2">
                   <h2 className="text-xl font-bold">AI Quiz Generation Mode</h2>
                   <p className="text-sm text-muted-foreground">Setup your quiz on the left, and our AI will generate the full assessment including questions and options instantly.</p>
                </div>
                <div className="flex gap-2">
                   <Badge variant="outline" className="bg-white dark:bg-zinc-950 text-purple-600 border-purple-100">Smart Scaffolding</Badge>
                   <Badge variant="outline" className="bg-white dark:bg-zinc-950 text-purple-600 border-purple-100">Bulk Creation</Badge>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border", className)}>
      {children}
    </span>
  );
}

export default function TeacherQuizCreatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
      <QuizCreateContent />
    </Suspense>
  );
}