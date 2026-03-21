/**
 * Service for user-related database operations.
 */
import { supabase } from '@/lib/supabaseClient';
import { Role } from '@/constants/enums';
import { User } from '@/types';

/**
 * Fetches the role of a user by their ID.
 */
export const getUserRole = async (userId: string): Promise<Role | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error.message);
    return null;
  }

  return data?.role as Role;
};

/**
 * Creates a new user record in the users table.
 */
export const createUser = async (
  userId: string, 
  email: string, 
  role: Role
): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: email,
      role: role,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error.message);
    return null;
  }

  return data as User;
};
    
    