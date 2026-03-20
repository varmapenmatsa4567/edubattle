import { Assignment } from "./assignment";

const now = new Date();
const today6pm = new Date(now); today6pm.setHours(18, 0, 0, 0);
const today8pm = new Date(now); today8pm.setHours(20, 0, 0, 0);
const tomorrow9am = new Date(now); tomorrow9am.setDate(now.getDate() + 1); tomorrow9am.setHours(9, 0, 0, 0);
const twoDaysAgo = new Date(now); twoDaysAgo.setDate(now.getDate() - 2);
const sunday = new Date(now); sunday.setDate(now.getDate() + (7 - now.getDay()));
const in3days = new Date(now); in3days.setDate(now.getDate() + 3);
const nextMonday = new Date(now); nextMonday.setDate(now.getDate() + (8 - now.getDay()));

export const mockAssignments: Assignment[] = [
  {
    id: "1",
    quiz: { title: "Fractions — Practice Set", subject: "Mathematics", chapter: "Fractions", difficulty: "medium", questionCount: 15, timeLimitMin: 20, sourceType: "pre_built" },
    mode: "homework", className: "8-A", status: "pending",
    deadline: "Today 6:00 PM", deadlineDate: today6pm,
    xpReward: "+36 XP", attempt: { used: 0, limit: 1 },
  },
  {
    id: "2",
    quiz: { title: "The French Revolution", subject: "History", chapter: "The French Revolution", difficulty: "medium", questionCount: 20, timeLimitMin: 25, sourceType: "pre_built" },
    mode: "homework", className: "8-A", status: "overdue",
    deadline: "Overdue — 2 days ago", deadlineDate: twoDaysAgo,
    xpReward: "+48 XP", attempt: { used: 0, limit: 1 },
  },
  {
    id: "3",
    quiz: { title: "Photosynthesis Battle", subject: "Science", chapter: "Nutrition in Plants", difficulty: "hard", questionCount: 10, timeLimitMin: 15, sourceType: "pre_built" },
    mode: "game", gameType: "Tug of War", className: "8-A", status: "pending",
    deadline: "Tomorrow 9:00 AM", deadlineDate: tomorrow9am,
    xpReward: "+50 XP (win)", attempt: { used: 0, limit: 1 },
  },
  {
    id: "4",
    quiz: { title: "Algebraic Identities", subject: "Mathematics", chapter: "Algebraic Expressions", difficulty: "hard", questionCount: 12, timeLimitMin: null, sourceType: "ai" },
    mode: "practice", className: "8-A", status: "pending",
    xpReward: "up to +30 XP", attempt: { used: 0, limit: null },
  },
  {
    id: "5",
    quiz: { title: "Monthly Science Olympiad", subject: "Science", chapter: "Mixed", difficulty: "olympiad", questionCount: 30, timeLimitMin: 45, sourceType: "pre_built" },
    mode: "competition", className: "8-A", status: "pending",
    deadline: "Sunday 11:59 PM", deadlineDate: sunday,
    xpReward: "+100 XP (top 3)", attempt: { used: 0, limit: 1 }, participantCount: 156,
  },
  {
    id: "6",
    quiz: { title: "Light and Shadow", subject: "Science", chapter: "Light Shadows Reflections", difficulty: "easy", questionCount: 10, timeLimitMin: 15, sourceType: "pre_built" },
    mode: "homework", className: "8-A", status: "pending",
    deadline: "In 3 days", deadlineDate: in3days,
    xpReward: "+24 XP", attempt: { used: 0, limit: 1 },
  },
  {
    id: "7",
    quiz: { title: "Integers Speed Blitz", subject: "Mathematics", chapter: "Integers", difficulty: "medium", questionCount: 8, timeLimitMin: 5, sourceType: "pre_built" },
    mode: "game", gameType: "Speed Blitz", className: "8-A", status: "in_progress",
    deadline: "Today 8:00 PM", deadlineDate: today8pm,
    xpReward: "+50 XP (win)", attempt: { used: 1, limit: 1 }, resumeTimeLeft: "12:34",
  },
  {
    id: "8",
    quiz: { title: "English Grammar — Tenses", subject: "English", chapter: "Tenses", difficulty: "easy", questionCount: 20, timeLimitMin: null, sourceType: "pre_built" },
    mode: "practice", className: "8-A", status: "completed",
    xpReward: "+34 XP", attempt: { used: 1, limit: null, score: 85, xpEarned: 34, timeTakenMin: 18, submittedAt: "Yesterday 4:30 PM" },
  },
  {
    id: "9",
    quiz: { title: "Water Resources", subject: "Geography", chapter: "Water Resources", difficulty: "medium", questionCount: 15, timeLimitMin: 20, sourceType: "pre_built" },
    mode: "homework", className: "8-A", status: "completed",
    deadline: "Next Monday", deadlineDate: nextMonday,
    xpReward: "+44 XP", attempt: { used: 1, limit: 1, score: 92, xpEarned: 44, timeTakenMin: 14, submittedAt: "2 days ago" },
  },
  {
    id: "10",
    quiz: { title: "Microorganisms: Friend and Foe", subject: "Science", chapter: "Microorganisms", difficulty: "medium", questionCount: 15, timeLimitMin: null, sourceType: "pre_built" },
    mode: "practice", className: "8-A", status: "completed",
    xpReward: "+28 XP", attempt: { used: 1, limit: null, score: 68, xpEarned: 28, timeTakenMin: 22, submittedAt: "3 days ago", aiNote: "Weak area detected: Types of bacteria. Practice more." },
  },
];
