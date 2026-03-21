/**
 * Service for school-related database operations.
 */
import { supabase } from '@/lib/supabaseClient';
import { School } from '@/types';
import { SchoolRow } from '@/types/database.types';

/**
 * Creates a new school record.
 */
export const createSchool = async (userId: string, name: string): Promise<School | null> => {
  const { data, error } = await supabase
    .from('schools')
    .insert({
      user_id: userId,
      name: name,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating school:', error.message);
    return null;
  }

  return data as School;
};

/**
 * Fetches school details by user ID.
 */
export const getSchoolDetails = async (userId: string): Promise<School | null> => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching school details:', error.message);
    return null;
  }

  return data as School;
};

/**
 * Updates an existing school record.
 */
export const updateSchool = async (
  schoolId: string, 
  updates: Partial<SchoolRow>
): Promise<boolean> => {
  const { error } = await supabase
    .from('schools')
    .update(updates)
    .eq('id', schoolId);

  if (error) {
    console.error('Error updating school:', error.message);
    return false;
  }

  return true;
};

/**
 * Checks if a username is available for a school.
 */
export const isUserNameAvailable = async (username: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('schools')
    .select('id')
    .eq('username', username)
    .single();

  // If error is present, it likely means no record was found (available)
  if (error) {
    return true;
  }

  return !data; // If data exists, username is NOT available
};