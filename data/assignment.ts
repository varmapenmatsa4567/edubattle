export type AssignmentMode = "practice" | "homework" | "game" | "competition";
export type AssignmentStatus = "pending" | "overdue" | "in_progress" | "completed";
export type Difficulty = "easy" | "medium" | "hard" | "olympiad";
export type SourceType = "pre_built" | "ai" | "teacher";

export interface QuizMeta {
  title: string;
  subject: string;
  chapter: string;
  difficulty: Difficulty;
  questionCount: number;
  timeLimitMin: number | null;
  sourceType: SourceType;
}

export interface AttemptInfo {
  used: number;
  limit: number | null; // null = unlimited
  score?: number; // percentage
  xpEarned?: number;
  timeTakenMin?: number;
  submittedAt?: string;
  aiNote?: string;
}

export interface Assignment {
  id: string;
  quiz: QuizMeta;
  mode: AssignmentMode;
  gameType?: string;
  className: string;
  status: AssignmentStatus;
  deadline?: string; // descriptive
  deadlineDate?: Date;
  xpReward: string;
  attempt: AttemptInfo;
  participantCount?: number;
  resumeTimeLeft?: string;
}
