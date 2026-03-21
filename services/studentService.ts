/**
 * Service for student-related database operations.
 */
import { Role } from '@/constants/enums';
import { supabase } from '@/lib/supabaseClient';
import { createUser } from './userService';
import { Student } from '@/types';

/**
 * Adds a new student, creates their user account, and links them to a school and class.
 */
export const addStudent = async (
  user_id: string, 
  school_id: string, 
  name: string, 
  username: string, 
  password: string, 
  class_id: string
): Promise<any | null> => {
  // Create user record with STUDENT role
  const userCreated = await createUser(user_id, username, Role.STUDENT);
  if (!userCreated) return null;

  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .insert({
      user_id: user_id,
      school_id: school_id,
      name: name,
    })
    .select()
    .single();
      
  if (studentError) {
    console.error('Error creating student record:', studentError.message);
    return null;
  }

  // Create initial student record (enrollment)
  const { error: recordError } = await supabase
    .from('student_records')
    .insert({
      student_id: studentData.id,
      class_id: class_id,
      academic_year: '',
      is_current: true,
    });    

  if (recordError) {
    console.error('Error creating student enrollment record:', recordError.message);
    return null;
  }

  return studentData;
};

/**
 * Fetches all students for a specific school, including their current class enrollment.
 */
export const getStudents = async (school_id: string): Promise<any[] | null> => {
  const { data, error } = await supabase
    .from('students')
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
    .eq('school_id', school_id)
    .eq('student_records.is_current', true);

  if (error) {
    console.error('Error fetching students:', error.message);
    return null;
  }

  return data;
};

/**
 * Fetches all students currently enrolled in a specific class.
 */
export const getClassStudents = async (
  class_id: string, 
  school_id: string
): Promise<any[] | null> => {
  const { data, error } = await supabase
    .from('students')
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
    .eq('school_id', school_id)
    .eq('student_records.class_id', class_id)
    .eq('student_records.is_current', true);

  if (error) {
    console.error('Error fetching class students:', error.message);
    return null;
  }

  return data;
};

/**
 * Fetches all students assigned to a specific teacher across all their classes.
 */
export const getTeacherStudents = async (
  teacher_id: string, 
  school_id: string | null
): Promise<any[] | null> => {
  if (!school_id) return [];

  // 1. Get classes taught by this teacher
  const { data: classSubjects, error: csError } = await supabase
    .from('class_subjects')
    .select('class_id, subject:subjects(id, subject_name)')
    .eq('teacher_id', teacher_id);

  if (csError) {
    console.error('Error fetching teacher class subjects:', csError.message);
    return null;
  }

  const classIds = (classSubjects as any[])
    .map((cs) => cs.class_id)
    .filter((id) => id !== null);

  if (classIds.length === 0) return [];

  // 2. Get active student records for those classes
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
    .eq('is_current', true);

  if (error) {
    console.error('Error fetching matching student records:', error.message);
    return null;
  }

  // 3. Map subjects to classes for the response
  const classSubjectMap: Record<string, any[]> = {};
  (classSubjects as any[]).forEach((cs) => {
    if (!cs.class_id || !cs.subject) return;
    if (!classSubjectMap[cs.class_id]) classSubjectMap[cs.class_id] = [];
    const alreadyAdded = classSubjectMap[cs.class_id].find((s) => s.id === cs.subject.id);
    if (!alreadyAdded) classSubjectMap[cs.class_id].push(cs.subject);
  });

  // 4. Return flattened student-oriented data
  return (data as any[])
    .filter((r) => r.student && r.class && r.class.school_id === school_id)
    .map((r) => ({
      ...r.student,
      class_id: r.class.id,
      class_name: r.class.class_name,
      section: r.class.section,
      academic_year: r.academic_year,
      subjects: classSubjectMap[r.class.id] ?? [],
    }));
};

/**
 * Fetches detailed information for a single student by their user ID.
 */
export const getStudentDetails = async (user_id: string): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
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
    .eq('user_id', user_id)
    .eq('student_records.is_current', true);

  if (error) {
    console.error('Error fetching student details:', error.message);
    return null;
  }

  if (!data || data.length === 0) return null;

  const student = data[0];
  const currentRecord = student.student_records?.[0] as any;
  
  return {
    ...student,
    class: Array.isArray(currentRecord?.classes) ? currentRecord.classes[0] : (currentRecord?.classes || null),
    academic_year: currentRecord?.academic_year || null,
  } as Student;
};
