/**
 * Centralized route paths for the application.
 */
export const ROUTES = {
  HOME: '/',
  AUTH: {
    SIGNIN: '/signin',
    SIGNUP: '/signup',
  },
  SCHOOL: {
    DASHBOARD: '/school',
    STUDENTS: '/school/students',
    TEACHERS: '/school/teachers',
    CLASSES: '/school/classes',
    SUBJECTS: '/school/subjects',
  },
  TEACHER: {
    DASHBOARD: '/teacher',
    QUIZZES: {
      LIST: '/teacher/quizzes',
      CREATE: '/teacher/quizzes/create',
      EDIT: (id: string) => `/teacher/quizzes/edit/${id}`,
    },
    CLASSES: '/teacher/classes',
  },
  STUDENT: {
    DASHBOARD: '/student',
    ASSIGNMENTS: {
      LIST: '/student/assignments',
      ATTEMPT: (id: string) => `/student/assignments/${id}`,
      REVIEW: (id: string) => `/student/assignments/${id}/review`,
    },
  },
} as const;
