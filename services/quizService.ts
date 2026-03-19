import { supabase } from "@/lib/supabaseClient";

export const createQuiz = async (
  school_id: string, 
  class_id: string, 
  teacher_id: string, 
  subject_id: string, 
  title: string, 
  question_count: number, 
  questions: any[]
) => {
    // 1. Create the Quiz record
    const { data: quizData, error: quizError } = await supabase
        .from("quiz")
        .insert({
            school_id,
            class_id,
            teacher_id,
            subject_id,
            title,
            count: question_count,
        })
        .select()
        .single();

    if (quizError) {
        console.error("Quiz Creation Error:", quizError.message);
        return null;
    }

    // 2. Bulk insert questions
    const questionInserts = questions.map((q: any) => ({
        quiz_id: quizData.id,
        question: q.text,
        options: q.options,
        answer: q.answer,
    }));

    const { error: questionsError } = await supabase
        .from("questions")
        .insert(questionInserts);

    if (questionsError) {
        console.error("Questions Insertion Error:", questionsError.message);
        // Optional: Clean up quiz if questions fail
        // await supabase.from("quiz").delete().eq("id", quizData.id);
        return null;
    }

    return quizData;
};

export const getQuizzesByTeacher = async (teacher_id: string) => {
    const { data, error } = await supabase
        .from("quiz")
        .select(`
            *,
            classes (
                class_name,
                section
            ),
            subjects (
                subject_name
            )
        `)
        .eq("teacher_id", teacher_id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching quizzes:", error.message);
        return null;
    }
    return data;
};