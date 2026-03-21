/**
 * Teacher Quiz Creation Page
 * Supports both AI-powered quiz generation and manual question entry.
 * Includes class and subject selection, timing configuration, and due date.
 */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  Brain, 
  FileEdit, 
  Sparkles,
  Loader2,
  Clock,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Combobox, 
  ComboboxInput, 
  ComboboxContent, 
  ComboboxEmpty, 
  ComboboxList, 
  ComboboxItem 
} from '@/components/ui/combobox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

import { useRequireRole } from '@/hooks/useRequireRole';
import { Role, ROUTES } from '@/constants';
import { getTeacherDetails } from '@/services/teacherService';
import { createQuiz } from '@/services/quizService';
import { Teacher, ClassSubject } from '@/types';
import { cn } from '@/lib/utils';

// ----- Types -----
interface ClassOption { id: string; label: string; }
interface SubjectOption { id: string; label: string; }
interface QuestionInput {
  question: string;
  options: string[];
  answer: string;
}

/**
 * Inner component to handle search parameters and main creation logic.
 */
function QuizCreateContent() {
  const { loading: authLoading, user } = useRequireRole(Role.TEACHER);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const mode = (searchParams.get('mode') as 'AI' | 'Manual') || 'AI';
  const classIdFromUrl = searchParams.get('class_id') || '';
  const isClassLocked = !!classIdFromUrl;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Derived options
  const [eligibleClasses, setEligibleClasses] = useState<ClassOption[]>([]);
  const [eligibleSubjects, setEligibleSubjects] = useState<SubjectOption[]>([]);

  // Form state
  const [selectedClassId, setSelectedClassId] = useState(classIdFromUrl);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  
  // AI Flow state
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(30);
  const [dueDate, setDueDate] = useState('');
  
  // Manual Flow state
  const [manualQuestions, setManualQuestions] = useState<QuestionInput[]>([
    { question: '', options: ['', '', '', ''], answer: '' }
  ]);
  
  // UI State
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  /**
   * Fetches teacher details to build selection options.
   */
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user?.id) return;

      setLoadingData(true);
      try {
        const data = await getTeacherDetails(user.id);
        if (data) setTeacher(data as Teacher);
        else toast.error('Could not load teacher profile.');
      } catch (err) {
        console.error('Error fetching teacher:', err);
        toast.error('Failed to load system profile.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchTeacherData();
  }, [user?.id]);

  /**
   * Builds available classes from teacher assignments.
   */
  useEffect(() => {
    if (!teacher?.class_subjects) return;

    const classMap: Record<string, ClassOption> = {};
    (teacher.class_subjects as ClassSubject[]).forEach((cs: ClassSubject) => {
      if (cs.classes) {
        classMap[cs.classes.id] = {
          id: cs.classes.id,
          label: `Class ${cs.classes.class_name}-${cs.classes.section}`,
        };
      }
    });

    const classes = Object.values(classMap).sort((a, b) => a.label.localeCompare(b.label));
    setEligibleClasses(classes);

    if (isClassLocked) buildSubjects(teacher, classIdFromUrl);
  }, [teacher, classIdFromUrl, isClassLocked]);

  const buildSubjects = (teacherData: Teacher | null, classId: string) => {
    if (!teacherData?.class_subjects || !classId) {
      setEligibleSubjects([]);
      return;
    }

    const filtered: SubjectOption[] = (teacherData.class_subjects as ClassSubject[])
      .filter((cs: ClassSubject) => cs.classes?.id === classId && cs.subjects)
      .map((cs: ClassSubject) => ({
        id: cs.subjects!.id,
        label: cs.subjects!.subject_name!,
      }));

    setEligibleSubjects(filtered);
    setSelectedSubjectId(''); 
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
    if (subjectEntry) setSelectedSubjectId(subjectEntry.id);
  };

  const handleAddQuestion = () => {
    setManualQuestions([...manualQuestions, { question: '', options: ['', '', '', ''], answer: '' }]);
  };

  const handleDeleteQuestion = (index: number) => {
    setManualQuestions(manualQuestions.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, field: keyof QuestionInput, value: any) => {
    const updated = [...manualQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setManualQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].options[oIndex] = value;
    setManualQuestions(updated);
  };

  const handleGenerateTitle = async () => {
    if (!topic) return;
    setIsGeneratingTitle(true);
    try {
      const resp = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await resp.json();
      if (data.title) setQuizTitle(data.title);
    } catch (err) {
      toast.error('AI Title failed.');
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleCreateQuizSubmit = async () => {
    if (!teacher) return;
    if (!selectedClassId || !selectedSubjectId || !quizTitle) {
      toast.error('Required fields missing.');
      return;
    }

    setIsCreatingQuiz(true);
    try {
      let questionsToSave = [];
      if (mode === 'AI') {
        const genResponse = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, count: questionCount }),
        });
        const genData = await genResponse.json();
        questionsToSave = genData.questions;
      } else {
        questionsToSave = manualQuestions;
      }

      const result = await createQuiz(
        teacher.school_id!,
        selectedClassId,
        teacher.id,
        selectedSubjectId,
        quizTitle,
        questionsToSave.length,
        questionsToSave,
        timeLimit,
        dueDate
      );

      if (result) {
        toast.success('Quiz launched successfully!');
        router.push(ROUTES.TEACHER.QUIZZES.LIST);
      }
    } catch (err) {
      toast.error('Deployment failed.');
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Initializing...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 space-y-10 animate-in fade-in duration-500 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="p-4 hover:bg-gray-50 rounded-[24px] transition-all active:scale-90 border-2 border-transparent hover:border-gray-100 group"
          >
            <ArrowLeft className="h-6 w-6 text-gray-400 group-hover:text-gray-900" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 uppercase">
              {mode === 'AI' ? <Sparkles className="h-8 w-8 text-[#FF6B35]" /> : <FileEdit className="h-8 w-8 text-blue-500" />}
              {mode === 'AI' ? 'Genius Launch' : 'Manual Entry'}
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">
              Assessment Production Workflow
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()} 
            className="rounded-2xl h-14 px-8 border-2 border-gray-100 font-black text-xs uppercase tracking-widest hover:bg-gray-50"
          >
            Abort
          </Button>
          <Button 
            onClick={handleCreateQuizSubmit} 
            disabled={isCreatingQuiz}
            className={cn(
               'rounded-2xl min-w-[200px] h-14 font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 text-white',
               mode === 'AI' ? 'bg-[#FF6B35] hover:bg-[#E85D25] shadow-[#FF6B35]/20' : 'bg-gray-900 hover:bg-black shadow-gray-200'
            )}
          >
            {isCreatingQuiz ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Save className="h-5 w-5 mr-3" />}
            Launch Assessment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <Card className="p-8 space-y-8 bg-white border-2 border-gray-100 rounded-[32px] shadow-sm sticky top-24">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 border-b-2 border-gray-50 pb-4">
              Config Setup
            </h3>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Target Class</label>
                {isClassLocked ? (
                  <div className="bg-gray-50 p-4 rounded-2xl font-black text-gray-900 border-2 border-transparent">
                     {eligibleClasses.find(c => c.id === classIdFromUrl)?.label || selectedClassId}
                  </div>
                ) : (
                  <Combobox items={eligibleClasses.map(c => c.label)} onValueChange={handleClassChange}>
                    <ComboboxInput placeholder="Choose Class..." className="h-14 rounded-2xl border-2 border-gray-100 font-bold" />
                    <ComboboxContent className="rounded-2xl p-2 border-2 border-gray-100 shadow-xl mt-2">
                       <ComboboxList>
                          {eligibleClasses.map(cls => <ComboboxItem key={cls.id} value={cls.label} className="p-3 rounded-xl font-bold cursor-pointer hover:bg-gray-50">{cls.label}</ComboboxItem>)}
                       </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Subject Matter</label>
                <Combobox items={eligibleSubjects.map(s => s.label)} onValueChange={handleSubjectChange} disabled={!selectedClassId}>
                  <ComboboxInput placeholder={selectedClassId ? 'Select Subject...' : 'Lock class first'} className="h-14 rounded-2xl border-2 border-gray-100 font-bold" disabled={!selectedClassId} />
                  <ComboboxContent className="rounded-2xl p-2 border-2 border-gray-100 shadow-xl mt-2">
                     <ComboboxList>
                        {eligibleSubjects.map(sub => <ComboboxItem key={sub.id} value={sub.label} className="p-3 rounded-xl font-bold cursor-pointer hover:bg-gray-50">{sub.label}</ComboboxItem>)}
                     </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Master Title</label>
                <div className="space-y-3">
                  <Input 
                    placeholder="e.g., Biology Final Exam" 
                    className="h-14 rounded-2xl border-2 border-gray-100 font-bold" 
                    value={quizTitle} 
                    onChange={(e) => setQuizTitle(e.target.value)}
                  />
                  {mode === 'AI' && (
                    <Button 
                      variant="outline"
                      disabled={!topic || isGeneratingTitle} 
                      className="w-full text-[10px] font-black bg-gray-50/50 hover:bg-gray-100 h-11 rounded-xl gap-3 border-2 border-dashed border-gray-200 uppercase tracking-widest"
                      onClick={handleGenerateTitle}
                    >
                      {isGeneratingTitle ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-[#FF6B35]" />}
                      Auto-Analyze Title
                    </Button>
                  )}
                </div>
              </div>

              {mode === 'AI' && (
                 <div className="flex flex-col gap-2.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Concept Domain</label>
                    <Textarea 
                      placeholder="Input core topic concepts..." 
                      className="resize-none h-32 rounded-2xl p-4 border-2 border-gray-100 font-bold text-sm" 
                      value={topic} 
                      onChange={(e) => setTopic(e.target.value)}
                    />
                 </div>
              )}

              <div className="pt-6 border-t-2 border-gray-50 space-y-6">
                <div className="flex flex-col gap-2.5">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Allocated Time (Mins)</label>
                   <div className="relative font-bold">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)} className="h-14 rounded-2xl border-2 border-gray-100 font-bold pl-12" />
                   </div>
                </div>
                <div className="flex flex-col gap-2.5 text-[#FF6B35]">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Deadline Date</label>
                   <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                      <Input type="date" value={dueDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDueDate(e.target.value)} className="h-14 rounded-2xl border-2 border-gray-100 font-bold pl-12 text-gray-900" />
                   </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {mode === 'Manual' ? (
             <div className="space-y-8">
                <div className="flex items-center justify-between mb-2 px-2">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Inventory Units</h3>
                   <Button onClick={handleAddQuestion} className="rounded-2xl h-11 bg-gray-900 text-white gap-3 px-8 font-black uppercase tracking-widest text-[10px]">
                      <Plus className="h-5 w-5" /> Insert Unit
                   </Button>
                </div>
                {manualQuestions.map((q, qIndex) => (
                  <Card key={qIndex} className="group border-2 border-gray-100 rounded-[32px] shadow-sm relative overflow-hidden bg-white">
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gray-100 group-hover:bg-gray-900 transition-colors" />
                    <CardContent className="p-10 space-y-10">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-4">
                              <span className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-sm">{qIndex + 1}</span>
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Unit Definition</label>
                           </div>
                           <button onClick={() => handleDeleteQuestion(qIndex)} className="p-3 text-gray-200 hover:text-red-500 rounded-xl transition-all"><Trash2 size={20} /></button>
                        </div>
                        <Input 
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(qIndex, 'question', e.target.value)}
                          placeholder="Insert core question context..."
                          className="text-2xl font-black border-0 bg-gray-50/50 focus-visible:ring-0 rounded-2xl p-6 h-18 text-gray-900"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className={cn(
                              'group/opt flex flex-col gap-2 p-4 rounded-2xl border-2 transition-all',
                              q.answer === opt && opt !== '' ? 'border-green-500 bg-green-50/20' : 'border-gray-50 bg-gray-50/30'
                          )}>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-300 uppercase">Option {String.fromCharCode(65 + oIndex)}</span>
                                <button 
                                    onClick={() => handleUpdateQuestion(qIndex, 'answer', opt)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm',
                                        q.answer === opt && opt !== '' ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border border-gray-100 hover:text-green-600'
                                    )}
                                    disabled={!opt.trim()}
                                >
                                    {q.answer === opt && opt !== '' ? 'Correct Key' : 'Set Key'}
                                </button>
                            </div>
                            <Input value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} className="border-0 bg-transparent focus-visible:ring-0 text-base font-bold p-0" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
             </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full min-h-[600px] border-4 border-dashed border-gray-100 rounded-[48px] bg-white p-16 text-center space-y-10 group">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#FF6B35]/10 rounded-full blur-3xl animate-pulse" />
                    <div className="relative h-32 w-32 bg-gradient-to-br from-[#FF6B35] to-[#E85D25] rounded-[48px] flex items-center justify-center shadow-2xl">
                        <Brain className="h-16 w-16 text-white" />
                    </div>
                </div>
                <div className="max-w-md space-y-4">
                   <h2 className="text-3xl font-black text-gray-900 uppercase">Neural Assembly Mode</h2>
                   <p className="text-gray-400 font-bold leading-relaxed px-6">
                      Our engine will architect a comprehensive assessment based on your specified domain parameters.
                   </p>
                </div>
                {mode === 'AI' && (
                   <div className="space-y-4 w-full max-w-xs">
                      <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                         <span>Units to generate</span>
                         <span className="text-[#FF6B35]">{questionCount} UNITS</span>
                      </div>
                      <Slider min={5} max={30} step={1} value={[questionCount]} onValueChange={(v) => setQuestionCount(v[0])} />
                   </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Main wrapper with Suspense boundaries.
 */
export default function TeacherQuizCreatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Synchronizing...</div>}>
      <QuizCreateContent />
    </Suspense>
  );
}