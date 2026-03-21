/**
 * Service for teacher-related database operations.
 */
import { supabase } from '@/lib/supabaseClient';
import { createUser } from './userService';
import { Role } from '@/constants/enums';
import { Teacher } from '@/types';

/**
 * Fetches all teachers for a specific school, including their assigned subjects and classes.
 */
export const getTeachers = async (school_id: string): Promise<Teacher[] | null> => {
  const { data, error } = await supabase
    .from('teachers')
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
    .eq('school_id', school_id);
  
  if (error) {
    console.error('Error fetching teachers:', error.message);
    return null;
  }

  return data as unknown as Teacher[];
};

/**
 * Adds a new teacher, creates their user account, and links them to a school.
 */
export const addTeacher = async (
  school_id: string, 
  name: string, 
  email: string, 
  user_id: string
): Promise<boolean> => {
  // Create user record with TEACHER role
  const userCreated = await createUser(user_id, email, Role.TEACHER);
  if (!userCreated) return false;

  const { error } = await supabase
    .from('teachers')
    .insert({
      school_id,
      name,
      user_id,
    });
  
  if (error) {
    console.error('Error adding teacher record:', error.message);
    return false;
  }

  return true;
};

/**
 * Fetches detailed information for a single teacher by their user ID.
 */
export const getTeacherDetails = async (user_id: string): Promise<Teacher | null> => {
  const { data, error } = await supabase
    .from('teachers')
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
    .eq('user_id', user_id)
    .single();
  
  if (error) {
    console.error('Error fetching teacher details:', error.message);
    return null;
  }

  return data as unknown as Teacher;
};
