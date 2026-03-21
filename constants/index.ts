export * from './enums';
export * from './routes';

/**
 * Global configuration constants.
 */
export const CONFIG = {
  MARKS_PER_QUESTION: 2,
  XP_PER_CORRECT_ANSWER: 10,
  DEFAULT_QUIZ_TIME_MINS: 30,
} as const;

/**
 * UI-related constants and labels.
 */
export const UI_LABELS = {
  OVERDUE: 'Overdue',
  DUE_TODAY: 'Due Today',
} as const;
