/**
 * Roles for authorization and user management.
 */
export enum Role {
  ADMIN = 'admin',
  SCHOOL = 'school',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

/**
 * Common status values for quizzes and assignments.
 */
export enum QuizStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

/**
 * Sources for XP rewards.
 */
export enum XpSource {
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  CLASSWORK = 'classwork',
}
