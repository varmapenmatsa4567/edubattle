/**
 * Service for subject and class-subject mapping database operations.
 */
import { supabase } from '@/lib/supabaseClient';
import { Subject, ClassSubject } from '@/types';

/**
 * Fetches all subjects for a specific school.
 */
export const getSubjects = async (school_id: string): Promise<Subject[] | null> => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('school_id', school_id);

  if (error) {
    console.error('Error fetching subjects:', error.message);
    return null;
  }

  return data as Subject[];
};

/**
 * Adds a new subject to the school's catalog.
 */
export const addSubject = async (school_id: string, subject_name: string): Promise<boolean> => {
  const { error } = await supabase
    .from('subjects')
    .insert({
      school_id,
      subject_name,
    });

  if (error) {
    console.error('Error adding subject:', error.message);
    return false;
  }

  return true;
};

/**
 * Maps a subject to a class in the class_subjects table.
 */
export const addClassSubject = async (class_id: string, subject_id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('class_subjects')
    .insert({
      class_id,
      subject_id,
    });

  if (error) {
    console.error('Error mapping subject to class:', error.message);
    return false;
  }

  return true;
};

/**
 * Maps multiple subjects to a class in the class_subjects table.
 */
export const addBulkClassSubjects = async (class_id: string, subject_ids: string[]): Promise<boolean> => {
  const inserts = subject_ids.map(subject_id => ({
    class_id,
    subject_id
  }));

  const { error } = await supabase
    .from('class_subjects')
    .insert(inserts);

  if (error) {
    console.error('Error bulk mapping subjects to class:', error.message);
    return false;
  }

  return true;
};

/**
 * Fetches all subjects and their assigned teachers for a specific class.
 */
export const getClassSubjects = async (class_id: string): Promise<ClassSubject[] | null> => {
  const { data, error } = await supabase
    .from('class_subjects')
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
    .eq('class_id', class_id);

  if (error) {
    console.error('Error fetching class subjects:', error.message);
    return null;
  }

  return data as unknown as ClassSubject[];
};

/**
 * Assigns a specific teacher to a class-subject mapping.
 */
export const assignTeacherToClassSubject = async (
  class_subject_id: string | number, 
  teacher_id: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('class_subjects')
    .update({ teacher_id })
    .eq('id', class_subject_id);
  
  if (error) {
    console.error('Error assigning teacher to subject:', error.message);
    return false;
  }

  return true;
};