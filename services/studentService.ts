import { ROLES } from "@/constants/roles";
import { supabase } from "@/lib/supabaseClient";
import { createUser } from "./userService";

export const addStudent = async (user_id: string, school_id: string, name: string, username: string, password: string, class_id: string) => {
    const data = await createUser(user_id, username, ROLES.STUDENT);

    const { data: studentData, error: studentError } = await supabase
        .from("students")
        .insert({
            user_id: user_id,
            school_id: school_id,
            name: name,
        })
        .select()
        .single();
        
    if (studentError) {
        console.error(studentError.message);
        return null;
    }

    const { data: classStudentData, error: classStudentError } = await supabase
        .from("student_records")
        .insert({
            student_id: studentData.id,
            class_id: class_id,
            academic_year: "",
            is_current: true
        });    

    return studentData;
}

export const getStudents = async (school_id: string) => {
    const { data, error } = await supabase
        .from("students")
        .select(`
            id,
            name,
            user_id,
            created_at,
            student_records!inner(
                id,
                classes(
                    id,
                    class_name,
                    section
                )
            )
        `)
        .eq("school_id", school_id)
        .eq("student_records.is_current", true);

    if (error) {
        console.error(error.message);
        return null;
    }

    console.log(data);

    return data;
}

export const getClassStudents = async (class_id: string, school_id: string) => {
    const { data, error } = await supabase
        .from("students")
        .select(`
            id,
            name,
            user_id,
            created_at,
            student_records!inner(
                id,
                classes(
                    class_name,
                    section
                )
            )
        `)
        .eq("school_id", school_id)
        .eq("student_records.class_id", class_id)
        .eq("student_records.is_current", true);

    if (error) {
        console.error(error.message);
        return null;
    }

    console.log(data);

    return data;
}

