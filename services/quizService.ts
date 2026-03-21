import { supabase } from "@/lib/supabaseClient";

export const createQuiz = async (
  school_id: string, 
  class_id: string, 
  teacher_id: string, 
  subject_id: string, 
  title: string, 
  question_count: number, 
  questions: any[],
  time?: number,
  due_date?: string
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
            time,
            due_date
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

export const getQuizById = async (quiz_id: string) => {
    const { data, error } = await supabase
        .from("quiz")
        .select(`
            *,
            questions (*)
        `)
        .eq("id", quiz_id)
        .single();

    if (error) {
        console.error("Error fetching quiz:", error.message);
        return null;
    }
    return data;
};

export const updateQuiz = async (
    quiz_id: string, 
    title: string, 
    questions: any[],
    time?: number,
    due_date?: string
) => {
    // 1. Update the Quiz record
    const { error: quizError } = await supabase
        .from("quiz")
        .update({
            title,
            count: questions.length,
            time,
            due_date
        })
        .eq("id", quiz_id);

    if (quizError) {
        console.error("Quiz Update Error:", quizError.message);
        return null;
    }

    // 2. Clear existing questions and insert new ones
    // Note: In a production app, you might want to track individual ID updates
    // but for a quiz editor, a full sync is often cleaner.
    const { error: deleteError } = await supabase
        .from("questions")
        .delete()
        .eq("quiz_id", quiz_id);

    if (deleteError) {
        console.error("Error clearing questions:", deleteError.message);
        return null;
    }

    const questionInserts = questions.map((q: any) => ({
        quiz_id,
        question: q.question, // table uses 'question' column
        options: q.options,
        answer: q.answer,
    }));

    const { error: insertError } = await supabase
        .from("questions")
        .insert(questionInserts);

    if (insertError) {
        console.error("Error inserting updated questions:", insertError.message);
        return null;
    }

    return true;
};

export const getQuizResultByStudent = async (student_id: string, quiz_id: string) => {
    const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("student_id", student_id)
        .eq("quiz_id", quiz_id);

    if (error) {
        console.error("Error fetching quiz result:", error.message);
        return null;
    }

    if(data.length == 0) return null;
    return data[0];
}
    
export const getQuizzesByClass = async (class_id: string) => {
    const { data, error } = await supabase
        .from("quiz")
        .select(`
            id,
            title,
            count,
            created_at,
            time,
            due_date,
            subjects (
                subject_name
            )
        `)
        .eq("class_id", class_id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching quizzes by class:", error.message);
        return null;
    }
    return data;
};

export const saveQuizResult = async (student_id: string, quiz_id: string, correctCount: number, total_questions: number) => {
    const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
            student_id,
            quiz_id,
            correct_count: correctCount,
            score: correctCount * 2,
            xp_earned: correctCount * 10,
        })
        .select()
        .single();

    if (error) {
        console.error("Error saving quiz result:", error.message);
        return null;
    }
    return data;
};

export const saveFullQuizResult = async (
    student_id: string, 
    quiz_id: string, 
    school_id: string,
    class_id: string,
    correctCount: number, 
    total_questions: number,
    answers: { question_id: string, selected_option: string, is_correct: boolean }[]
) => {
    const { data, error } = await supabase.rpc("submit_quiz", {
        p_student_id: student_id,
        p_quiz_id: quiz_id,
        p_school_id: school_id,
        p_class_id: class_id,
        p_correct_count: correctCount,
        p_total_questions: total_questions,
        p_answers: answers
    });

    if (error) {
        console.error("Error submitting quiz:", error.message);
        return null;
    }

    return data;
};

export const getQuizAttemptWithAnswers = async (student_id: string, quiz_id: string) => {
    // 1. Get the attempt
    const { data: attempt, error: attemptError } = await supabase
        .from("quiz_attempts")
        .select(`
            *,
            quiz:quiz (
                title,
                subjects (subject_name)
            )
        `)
        .eq("student_id", student_id)
        .eq("quiz_id", quiz_id)
        .single();

    if (attemptError || !attempt) {
        console.error("Error fetching attempt:", attemptError?.message);
        return null;
    }

    // 2. Get the answers joined with questions
    const { data: answers, error: answersError } = await supabase
        .from("quiz_answers")
        .select(`
            id,
            selected_option,
            is_correct,
            question:questions (
                id,
                question,
                options,
                answer
            )
        `)
        .eq("attempt_id", attempt.id);

    if (answersError) {
        console.error("Error fetching quiz answers:", answersError.message);
        return null;
    }

    return {
        ...attempt,
        answers: answers.map((a: any) => ({
            ...a,
            question_id: a.question.id,
            question_text: a.question.question,
            options: a.question.options,
            correct_answer: a.question.answer
        }))
    };
};
