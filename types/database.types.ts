/**
 * Raw Database Row Types
 * These match the Supabase PostgreSQL schema exactly.
 */

export type Role = 'admin' | 'school' | 'teacher' | 'student';

export type UserRow = {
  id: string;
  email: string | null;
  role: Role | null;
  created_at: string | null;
};

export type SchoolRow = {
  id: string;
  user_id: string | null;
  name: string | null;
  username: string | null;
  created_at: string | null;
};

export type ClassRow = {
  id: string;
  created_at: string;
  class_name: string | null;
  section: string | null;
  school_id: string | null;
};

export type SubjectRow = {
  id: string;
  created_at: string;
  school_id: string | null;
  subject_name: string | null;
};

export type TeacherRow = {
  id: string;
  user_id: string | null;
  school_id: string | null;
  name: string | null;
  created_at: string | null;
};

export type StudentRow = {
  id: string;
  user_id: string | null;
  school_id: string | null;
  name: string | null;
  created_at: string | null;
};

export type StudentRecordRow = {
  id: string;
  created_at: string;
  student_id: string | null;
  class_id: string | null;
  academic_year: string | null;
  is_current: boolean | null;
};

export type ClassSubjectRow = {
  id: number;
  created_at: string;
  subject_id: string | null;
  class_id: string | null;
  teacher_id: string | null;
};

export type QuizRow = {
  id: string;
  created_at: string;
  school_id: string | null;
  class_id: string | null;
  teacher_id: string | null;
  subject_id: string | null;
  title: string | null;
  count: number | null;
  time: number | null;
  due_date: string | null;
};

export type QuestionRow = {
  id: string;
  created_at: string;
  question: string | null;
  options: any | null; // JSON
  answer: string | null;
  quiz_id: string | null;
};

export type QuizAttemptRow = {
  id: string;
  created_at: string;
  quiz_id: string;
  student_id: string;
  score: number | null;
  correct_count: number | null;
  xp_earned: number;
};

export type QuizAnswerRow = {
  id: string;
  created_at: string;
  attempt_id: string;
  question_id: string;
  selected_option: string | null;
  is_correct: boolean | null;
};

export type XpLogRow = {
  id: string;
  student_id: string;
  school_id: string;
  class_id: string | null;
  source: string;
  source_id: string | null;
  xp: number;
  metadata: any | null; // JSONB
  created_at: string | null;
};

export type StudentXpRow = {
  id: string;
  student_id: string;
  school_id: string;
  class_id: string | null;
  total_xp: number;
};
