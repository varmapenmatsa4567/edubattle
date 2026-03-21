import { 
  UserRow, 
  SchoolRow, 
  ClassRow, 
  SubjectRow, 
  TeacherRow, 
  StudentRow, 
  QuizRow, 
  QuestionRow, 
  QuizAttemptRow, 
  QuizAnswerRow 
} from './database.types';
import { QuizStatus } from '@/constants/enums';

/**
 * Extended and Joined Application Types
 */

export interface User extends UserRow {}

export interface School extends SchoolRow {}

export interface Class extends ClassRow {}

export interface Subject extends SubjectRow {}

export interface Teacher extends TeacherRow {
  class_subjects?: (ClassSubject & {
    classes: Class;
    subjects: Subject;
  })[];
}

export interface Student extends StudentRow {
  class?: Class | null;
  academic_year?: string | null;
  student_records?: any[];
}

export interface ClassSubject {
  id: number;
  subject_id: string | null;
  class_id: string | null;
  teacher_id: string | null;
  classes?: Class;
  subjects?: Subject;
}

export interface Question extends QuestionRow {
  options: string[]; // Typed as string array for app use
  explanation?: string | null;
}

export interface Quiz extends QuizRow {
  questions?: Question[];
  subjects?: Subject;
  classes?: Class;
}

export interface QuizAttempt extends QuizAttemptRow {
  quiz?: Quiz;
  answers?: QuizAnswer[];
}

export interface QuizAnswer extends QuizAnswerRow {
  question?: Question;
}

// Result of joins for specific UI needs
export interface EnrichedQuiz extends Quiz {
  status: QuizStatus;
  score?: number;
  totalMarks: number;
  duration: number;
  dueDateStr: string;
  subject: string; // Flattened for UI
}
