/**
 * Service for class-related database operations.
 */
import { supabase } from '@/lib/supabaseClient';
import { Class } from '@/types';

/**
 * Adds a new class with multiple sections.
 * Performs a bulk insert for all sections.
 */
export const addClass = async (
  school_id: string, 
  class_name: string, 
  sections: string[]
): Promise<boolean> => {
  const classInserts = sections.map((section) => ({
    school_id,
    class_name,
    section,
  }));

  const { error } = await supabase
    .from('classes')
    .insert(classInserts);

  if (error) {
    console.error('Error adding classes:', error.message);
    return false;
  }

  return true;
};

/**
 * Fetches all classes for a specific school.
 */
export const getClasses = async (school_id: string): Promise<Class[] | null> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('school_id', school_id);

  if (error) {
    console.error('Error fetching classes:', error.message);
    return null;
  }

  return data as Class[];
};

/**
 * Fetches details for a single class by its ID.
 */
export const getClassDetails = async (class_id: string): Promise<Class | null> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', class_id)
    .single();

  if (error) {
    console.error('Error fetching class details:', error.message);
    return null;
  }

  return data as Class;
};
    