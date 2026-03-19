import { supabase } from "@/lib/supabaseClient";
import { createUser } from "./userService";
import { ROLES } from "@/constants/roles";

export const getTeachers = async (school_id: string) => {
    const { data, error } = await supabase
        .from("teachers")
        .select(`
            *,
            class_subjects (
                id,
                classes (
                    id,
                    class_name,
                    section
                ),
                subjects (
                    id,
                    subject_name
                )
            )
        `)
        .eq("school_id", school_id);
    
    if (error) {
        console.error(error.message);
        return null;
    }
    return data;
}

export const addTeacher = async (school_id: string, name: string, email: string, user_id: string) => {
    await createUser(user_id, email, ROLES.TEACHER);
    const { data, error } = await supabase
        .from("teachers")
        .insert({
            school_id,
            name,
            user_id
        });
    
    if (error) {
        console.error(error.message);
        return null;
    }
    return true;
}
export const getTeacherDetails = async (user_id: string) => {
    const { data, error } = await supabase
        .from("teachers")
        .select(`
            *,
            class_subjects (
                id,
                classes (
                    id,
                    class_name,
                    section
                ),
                subjects (
                    id,
                    subject_name
                )
            )
        `)
        .eq("user_id", user_id)
        .single();
    
    if (error) {
        console.error(error.message);
        return null;
    }

    console.log("teacher details", data);
    return data;
}
