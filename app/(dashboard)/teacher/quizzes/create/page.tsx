"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
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

// ----- Types -----
interface ClassOption { id: string; label: string; }
interface SubjectOption { id: string; label: string; }

// ----- Inner component (needs searchParams) -----
function QuizCreateContent() {
  const { loading, user } = useRequireRole(ROLES.TEACHER);
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const [topic, setTopic] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  
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

  // Build class options from teacher data
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

    // If class is locked via URL, no need to wait for selection
    if (isClassLocked) {
      buildSubjects(teacher, classIdFromUrl);
    }
  }, [teacher, classIdFromUrl, isClassLocked]);

  // Build subjects based on selected class
  const buildSubjects = (teacherData: any, classId: string) => {
    if (!teacherData?.class_subjects || !classId) {
      setEligibleSubjects([]);
      return;
    }
    const filtered: SubjectOption[] = teacherData.class_subjects
      .filter((cs: any) => cs.classes?.id === classId && cs.subjects)
      .map((cs: any) => ({
        id: cs.subjects.id, // Actual subject id
        label: cs.subjects.subject_name,
      }));
    setEligibleSubjects(filtered);
    setSelectedSubjectId(""); // reset subject when class changes
  };

  // When class changes
  const handleClassChange = (value: string | null) => {
    const classEntry = eligibleClasses.find(c => c.label === value || c.id === value);
    if (classEntry) {
      setSelectedClassId(classEntry.id);
      buildSubjects(teacher, classEntry.id);
    }
  };

  // When subject changes
  const handleSubjectChange = (value: string | null) => {
    const subjectEntry = eligibleSubjects.find(s => s.label === value || s.id === value);
    if (subjectEntry) {
      setSelectedSubjectId(subjectEntry.id);
    }
  };

  // Logic: Auto-generate title
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
      if (data.title) {
        setQuizTitle(data.title);
      } else {
        toast.error("Failed to generate title");
      }
    } catch (error) {
      console.error("Title generation error:", error);
      toast.error("Something went wrong while generating title");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // Logic: Create Quiz (AI Flow)
  const handleCreateQuiz = async () => {
    if (!selectedClassId || !selectedSubjectId || !topic || !quizTitle) {
      toast.error("Please fill all fields");
      return;
    }

    setIsCreatingQuiz(true);
    try {
      // 1. Generate questions via AI
      const genResponse = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count: questionCount }),
      });
      
      const genData = await genResponse.json();
      
      if (!genData.questions || genData.questions.length === 0) {
        throw new Error("AI failed to generate questions");
      }

      // 2. Save to database
      const result = await createQuiz(
        teacher.school_id,
        selectedClassId,
        teacher.id,
        selectedSubjectId,
        quizTitle,
        questionCount,
        genData.questions
      );

      if (result) {
        toast.success("Quiz created successfully!");
        router.push("/teacher/quizzes");
      } else {
        toast.error("Failed to save quiz to database");
      }
    } catch (error: any) {
      console.error("Quiz creation error:", error);
      toast.error(error.message || "Something went wrong during quiz creation");
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  // Locked class display name
  const lockedClassName = eligibleClasses.find(c => c.id === classIdFromUrl)?.label || selectedClassId;

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="bg-white/80 backdrop-blur-md border border-gray-200 w-full max-w-xl p-6 px-10 space-y-4">
        <div className="text-center mb-2">
          <p className="text-[#e271d8] text-3xl font-bold">Create New Quiz</p>
          <p className="text-[#5c6067] text-md font-medium mt-1">
            Enter a topic and let AI generate the questions for you.
          </p>
        </div>

        {/* CLASS */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#5c6067]">Class / Grade</label>
          {isClassLocked ? (
            <Input
              value={lockedClassName}
              readOnly
              disabled
              className="text-black placeholder:text-slate-400 opacity-70 cursor-not-allowed bg-slate-50"
            />
          ) : (
            <Combobox items={eligibleClasses.map(c => c.label)} onValueChange={handleClassChange}>
              <ComboboxInput
                placeholder="Select a Class"
                className="text-black py-5 placeholder:text-slate-400"
              />
              <ComboboxContent>
                <ComboboxEmpty>No classes found.</ComboboxEmpty>
                <ComboboxList>
                  {eligibleClasses.map((cls) => (
                    <ComboboxItem key={cls.id} value={cls.label}>
                      {cls.label}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          )}
        </div>

        {/* SUBJECT */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#5c6067]">Subject</label>
          <Combobox
            items={eligibleSubjects.map(s => s.label)}
            onValueChange={handleSubjectChange}
            disabled={!selectedClassId}
          >
            <ComboboxInput
              placeholder={selectedClassId ? "Select a Subject" : "Select a class first"}
              className="text-black py-5 placeholder:text-slate-400"
              disabled={!selectedClassId}
            />
            <ComboboxContent>
              <ComboboxEmpty>No subjects found.</ComboboxEmpty>
              <ComboboxList>
                {eligibleSubjects.map((sub) => (
                  <ComboboxItem key={sub.id} value={sub.label}>
                    {sub.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        {/* TOPIC */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#5c6067]">Topic</label>
          <Textarea
            placeholder="Provide context or topic"
            className="text-black placeholder:text-slate-400 resize-none h-20 overflow-y-auto"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        {/* QUIZ TITLE */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#5c6067]">Quiz Title</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter a title"
              className="text-black placeholder:text-slate-400"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
            />
            <Button 
              disabled={!topic || isGeneratingTitle} 
              className="bg-[#5d7ec9] hover:bg-[#4a6bbd] px-5 min-w-[120px]"
              onClick={handleGenerateTitle}
            >
              {isGeneratingTitle ? <Spinner className="h-4 w-4 border-white" /> : "Auto-generate"}
            </Button>
          </div>
        </div>

        {/* NUMBER OF QUESTIONS */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-[#5c6067]">Number of Questions</label>
            <span className="text-purple-400 font-bold text-base">{questionCount}</span>
          </div>
          <div className="px-2">
            <Slider
              min={5}
              max={50}
              step={1}
              value={[questionCount]}
              onValueChange={(val) => setQuestionCount(val[0])}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
              <span>5</span>
              <span>50</span>
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="pt-4">
          <Button
            className="w-full bg-purple-600 hover:bg-purple-500 h-12 font-bold text-base rounded-xl transition-all shadow-md active:scale-[0.98]"
            disabled={!selectedClassId || !selectedSubjectId || !topic || !quizTitle || isCreatingQuiz}
            onClick={handleCreateQuiz}
          >
            {isCreatingQuiz ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-5 w-5 border-white" />
                <span>Generating & Saving...</span>
              </div>
            ) : (
              "Create Quiz"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function TeacherQuizCreatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
      <QuizCreateContent />
    </Suspense>
  );
}