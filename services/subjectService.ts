import { supabase } from "@/lib/supabaseClient";

export const getSubjects = async (school_id: string) => {
    const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("school_id", school_id);
    if (error) {
        console.error(error.message);
        return null;
    }
    return data;
}


export const addSubject = async (school_id: string, subject_name: string) => {
    const { data, error } = await supabase
        .from("subjects")
        .insert({
            school_id: school_id,
            subject_name: subject_name
        })
    if (error) {
        console.error(error.message);
        return null;
    }
    return true;
}

export const addClassSubject = async (class_id: string, subject_id: string) => {
    const { data, error } = await supabase
        .from("class_subjects")
        .insert({
            class_id: class_id,
            subject_id: subject_id
        })
    if (error) {
        console.error(error.message);
        return null;
    }
    return true;
}

export const getClassSubjects = async (class_id: string) => {
    const { data, error } = await supabase
        .from("class_subjects")
        .select(`
            id,
            class_id,
            subject_id,
            teacher_id,
            subjects (
                subject_name
            ),
            teachers (
                id,
                name
            )
        `)
        .eq("class_id", class_id);
    if (error) {
        console.error(error.message);
        return null;
    }
    console.log(data);
    return data;
}

export const assignTeacherToClassSubject = async (class_subject_id: string, teacher_id: string) => {
    const { data, error } = await supabase
        .from("class_subjects")
        .update({ teacher_id })
        .eq("id", class_subject_id);
    
    if (error) {
        console.error(error.message);
        return null;
    }
    return true;
}