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

export const getTeacherStudents = async (teacher_id: string, school_id: string) => {
  const { data: classSubjects, error: csError } = await supabase
    .from('class_subjects')
    .select('class_id, subject:subjects(id, subject_name)')
    .eq('teacher_id', teacher_id)

  if (csError) throw csError

  const classIds = (classSubjects as any[])
    .map((cs: any) => cs.class_id)
    .filter((id: any) => id !== null)

  if (classIds.length === 0) return []

  const { data, error } = await supabase
    .from('student_records')
    .select(`
      academic_year,
      is_current,
      student:students (
        id,
        name,
        user_id
      ),
      class:classes (
        id,
        class_name,
        section,
        school_id
      )
    `)
    .in('class_id', classIds)
    .eq('is_current', true)

  if (error) {
    console.log(error.message)
    return null
  }

  const classSubjectMap: Record<string, any[]> = {}
  ;(classSubjects as any[]).forEach((cs: any) => {
    if (!cs.class_id || !cs.subject) return
    if (!classSubjectMap[cs.class_id]) classSubjectMap[cs.class_id] = []
    const alreadyAdded = classSubjectMap[cs.class_id].find((s: any) => s.id === cs.subject.id)
    if (!alreadyAdded) classSubjectMap[cs.class_id].push(cs.subject)
  })

  const result = (data as any[])
    .filter((r: any) => r.student && r.class && r.class.school_id === school_id)
    .map((r: any) => ({
      ...r.student,
      class_id: r.class.id,
      class_name: r.class.class_name,
      section: r.class.section,
      academic_year: r.academic_year,
      subjects: classSubjectMap[r.class.id] ?? [],
    }))

    console.log(result);

  return result
}
export const getStudentDetails = async (user_id: string) => {
    const { data, error } = await supabase
        .from("students")
        .select(`
            id,
            name,
            user_id,
            school_id,
            student_records!inner(
                academic_year,
                is_current,
                classes(
                    id,
                    class_name,
                    section
                )
            )
        `)
        .eq("user_id", user_id)
        .eq("student_records.is_current", true);

    if (error) {
        console.error("Error fetching student details:", error.message);
        return null;
    }

    if (!data || data.length === 0) return null;

    const student = data[0];
    const currentRecord = student.student_records?.[0];
    
    return {
        ...student,
        class: Array.isArray(currentRecord?.classes) ? currentRecord.classes[0] : (currentRecord?.classes || null),
        academic_year: currentRecord?.academic_year || null
    };
};
