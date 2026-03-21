/**
 * Teacher Quiz Edit Page
 * Allows teachers to modify existing quizzes, including title, questions, and options.
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
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';

import { useRequireRole } from '@/hooks/useRequireRole';
import { Role, ROUTES } from '@/constants';
import { getQuizById, updateQuiz } from '@/services/quizService';
import { Question, Quiz } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Question interface for the edit form state.
 */
interface QuestionEditState extends Partial<Question> {
  isNew?: boolean;
}

/**
 * Inner component to handle quiz data fetching and editing logic.
 */
function QuizEditContent() {
  const { loading: authLoading, user } = useRequireRole(Role.TEACHER);
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = searchParams.get('quizId');

  const [loadingData, setLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionEditState[]>([]);

  /**
   * Fetches the quiz details by ID.
   */
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) {
        toast.error('No quiz ID provided.');
        router.push(ROUTES.TEACHER.QUIZZES.LIST);
        return;
      }

      setLoadingData(true);
      try {
        const data = await getQuizById(quizId);
        if (data) {
          setQuizTitle(data.title || '');
          setQuestions((data.questions as QuestionEditState[]) || []);
        } else {
          toast.error('Quiz not found in repository.');
          router.push(ROUTES.TEACHER.QUIZZES.LIST);
        }
      } catch (err) {
        console.error('Error fetching quiz for edit:', err);
        toast.error('Failed to load quiz data.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchQuiz();
  }, [quizId, router]);

  const handleAddQuestion = () => {
    const newQuestion: QuestionEditState = {
      question: '',
      options: ['', '', '', ''],
      answer: '',
      isNew: true
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, field: keyof QuestionEditState, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    const newOptions = [...(newQuestions[qIndex].options as string[])];
    newOptions[oIndex] = value;
    newQuestions[qIndex].options = newOptions;
    setQuestions(newQuestions);
  };

  /**
   * Validates and saves the updated quiz.
   */
  const handleSave = async () => {
    if (!quizTitle.trim()) {
      toast.error('Quiz title is required.');
      return;
    }

    if (questions.length === 0) {
      toast.error('At least one question is required.');
      return;
    }

    // Validation loop
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question?.trim()) {
        toast.error(`Question ${i + 1} content is missing.`);
        return;
      }
      if (!questions[i].options || (questions[i].options as string[]).some(opt => !opt.trim())) {
        toast.error(`Question ${i + 1} has incomplete options.`);
        return;
      }
      if (!questions[i].answer?.trim()) {
        toast.error(`Question ${i + 1} needs a correct answer marked.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const success = await updateQuiz(quizId!, quizTitle, questions);
      if (success) {
        toast.success('Quiz updated successfully.');
        router.push(ROUTES.TEACHER.QUIZZES.LIST);
      } else {
        toast.error('Failed to commit updates to database.');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('An unexpected error occurred during save.');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Editor...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-24 space-y-10 animate-in fade-in duration-500 px-6">
      {/* HEADER TOOLBAR */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl py-6 border-b-2 border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="p-4 hover:bg-gray-50 rounded-[20px] transition-all active:scale-90 border-2 border-transparent hover:border-gray-100 group"
          >
            <ArrowLeft className="h-6 w-6 text-gray-400 group-hover:text-gray-900" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tight uppercase">Edit Assessment</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">
              Currently Managing {questions.length} Units
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => router.back()} 
            className="rounded-2xl h-14 px-8 border-2 border-gray-100 font-black text-xs uppercase tracking-widest hover:bg-gray-50 flex-1 md:flex-none"
          >
            Discard
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="rounded-2xl min-w-[180px] h-14 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 transition-all active:scale-95 flex-1 md:flex-none"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Save className="h-5 w-5 mr-3" />}
            Sync Updates
          </Button>
        </div>
      </div>

      {/* QUIZ TITLE CARD */}
      <Card className="border-2 border-gray-100 rounded-[32px] shadow-sm overflow-hidden bg-white">
        <CardContent className="p-10">
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Repository Title</label>
            <Input 
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g., Mathematics Mastery 101"
              className="text-3xl font-black h-auto py-4 border-0 focus-visible:ring-0 px-0 placeholder:text-gray-200 text-gray-900 shadow-none leading-tight"
            />
            <div className="h-1 w-20 bg-amber-100 rounded-full" />
            <p className="text-[11px] text-gray-400 mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-500" />
              Impacts all active classroom instances
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QUESTIONS LIST */}
      <div className="space-y-10">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Inventory Items</h3>
           <Button onClick={handleAddQuestion} className="rounded-[20px] h-12 bg-gray-900 text-white gap-3 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95">
              <Plus className="h-5 w-5" /> Insert New Unit
           </Button>
        </div>
        
        {questions.map((q, qIndex) => (
          <Card key={qIndex} className="group border-2 border-gray-100 rounded-[40px] shadow-sm hover:border-amber-500/30 transition-all duration-500 relative bg-white overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-2 bg-gray-100 group-hover:bg-amber-500 transition-colors" />
             
            <CardContent className="p-10 lg:p-12 space-y-10">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <span className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-lg">{qIndex + 1}</span>
                      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Question Content</label>
                   </div>
                   <button 
                     onClick={() => handleDeleteQuestion(qIndex)} 
                     className="p-4 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                   >
                      <Trash2 className="h-6 w-6" />
                   </button>
                </div>
                <Textarea 
                  value={q.question || ''}
                  onChange={(e) => handleUpdateQuestion(qIndex, 'question', e.target.value)}
                  placeholder="Define your question here..."
                  className="text-2xl font-black min-h-[140px] border-0 bg-gray-50/50 focus-visible:ring-0 rounded-[32px] p-8 resize-none text-gray-900 placeholder:text-gray-300 leading-relaxed shadow-none"
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(q.options as string[]).map((opt, oIndex) => (
                  <div key={oIndex} className={cn(
                      'group/opt flex flex-col gap-3 p-6 rounded-[32px] border-2 transition-all duration-300',
                      q.answer === opt && opt !== '' ? 'border-green-500 bg-green-50/30 ring-8 ring-green-500/5' : 'border-gray-50 bg-gray-50/30 hover:border-gray-100'
                  )}>
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">
                            Option {String.fromCharCode(65 + oIndex)}
                        </span>
                        <button 
                            onClick={() => handleUpdateQuestion(qIndex, 'answer', opt)}
                            className={cn(
                                'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                                q.answer === opt && opt !== '' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-400 border-2 border-gray-100 hover:text-green-600'
                            )}
                            disabled={!opt.trim()}
                        >
                            {q.answer === opt && opt !== '' ? 'Key Answer' : 'Mark Key'}
                        </button>
                    </div>
                    <Input 
                      value={opt}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      placeholder={`Insert text...`}
                      className="border-0 bg-transparent focus-visible:ring-0 text-lg font-bold p-0 placeholder:text-gray-300 text-gray-900"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation (Optional) */}
              <div className="pt-8 border-t-2 border-gray-50 flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">Intellectual Insight (Optional)</label>
                  <Input 
                    value={q.explanation || ''}
                    onChange={(e) => handleUpdateQuestion(qIndex, 'explanation', e.target.value)}
                    placeholder="Provide context for the student..."
                    className="bg-transparent border-0 border-b-2 border-gray-100 rounded-none px-0 text-sm font-bold italic focus-visible:ring-0 focus-visible:border-amber-400 h-12 text-gray-600 shadow-none transition-all"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ADD QUESTION BUTTON */}
      <button 
        onClick={handleAddQuestion}
        className="w-full h-40 border-4 border-dashed border-gray-100 hover:border-amber-500/20 hover:bg-amber-500/5 rounded-[40px] transition-all group bg-white flex flex-col items-center justify-center gap-4"
      >
        <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-2xl transition-all border-2 border-gray-100 group-hover:border-amber-100">
          <Plus className="h-8 w-8 text-gray-300 group-hover:text-amber-500" />
        </div>
        <span className="font-black text-[12px] text-gray-300 group-hover:text-amber-500 uppercase tracking-[0.4em]">Increment Unit Inventory</span>
      </button>
    </div>
  );
}

/**
 * Main wrapper with Suspense boundaries.
 */
export default function TeacherQuizEditPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
            <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Context...</p>
        </div>
    }>
      <QuizEditContent />
    </Suspense>
  );
}