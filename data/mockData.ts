// Mock data for the EduBattle dashboard

export interface Student {
  name: string;
  grade: string;
  section: string;
  avatarUrl: string;
  xpPoints: number;
  level: number;
  levelName: string;
  streakDays: number;
  classRank: number;
  rankChange: number;
  totalXPThisWeek: number;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  deadline: string;
  questions: number;
  isOverdue: boolean;
  isToday: boolean;
  totalMarks: number;
  duration: number; // in minutes
  status: 'pending' | 'completed' | 'in-progress';
  score?: number;
}

export interface GameResult {
  id: string;
  opponentName: string;
  opponentAvatar: string;
  gameMode: string;
  result: 'WIN' | 'LOSE';
  xpEarned: number;
  subject: string;
  timestamp: string;
  score: string;
}

export interface SubjectMastery {
  subject: string;
  percentage: number;
  color: string;
  icon: string;
  totalQuizzes: number;
  averageScore: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  description: string;
  dateEarned?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  weeklyXP: number;
  badges: number;
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  players: string;
  duration: string;
  xpReward: string;
  color: string;
}

// Current student data
export const currentStudent: Student = {
  name: 'Priya Sharma',
  grade: '8',
  section: 'A',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  xpPoints: 2850,
  level: 12,
  levelName: 'Scholar',
  streakDays: 7,
  classRank: 7,
  rankChange: 2,
  totalXPThisWeek: 450,
};

// Assignments data
export const assignments: Assignment[] = [
  {
    id: '1',
    title: 'Algebra Basics Quiz',
    subject: 'Mathematics',
    subjectColor: 'bg-blue-500',
    deadline: '2026-03-20',
    questions: 15,
    totalMarks: 30,
    duration: 20,
    isOverdue: false,
    isToday: false,
    status: 'pending',
  },
  {
    id: '2',
    title: 'Photosynthesis Test',
    subject: 'Science',
    subjectColor: 'bg-green-500',
    deadline: '2026-03-19',
    questions: 20,
    totalMarks: 40,
    duration: 25,
    isOverdue: false,
    isToday: true,
    status: 'pending',
  },
  {
    id: '3',
    title: 'Grammar Practice',
    subject: 'English',
    subjectColor: 'bg-purple-500',
    deadline: '2026-03-18',
    questions: 12,
    totalMarks: 24,
    duration: 15,
    isOverdue: true,
    isToday: false,
    status: 'pending',
  },
  {
    id: '4',
    title: 'Indian Freedom Struggle',
    subject: 'Social Studies',
    subjectColor: 'bg-orange-500',
    deadline: '2026-03-22',
    questions: 18,
    totalMarks: 36,
    duration: 30,
    isOverdue: false,
    isToday: false,
    status: 'pending',
  },
  {
    id: '5',
    title: 'Trigonometry Basics',
    subject: 'Mathematics',
    subjectColor: 'bg-blue-500',
    deadline: '2026-03-15',
    questions: 20,
    totalMarks: 40,
    duration: 30,
    isOverdue: false,
    isToday: false,
    status: 'completed',
    score: 35,
  },
  {
    id: '6',
    title: 'Cell Structure & Functions',
    subject: 'Science',
    subjectColor: 'bg-green-500',
    deadline: '2026-03-16',
    questions: 25,
    totalMarks: 50,
    duration: 35,
    isOverdue: false,
    isToday: false,
    status: 'completed',
    score: 45,
  },
];

// Game results
export const gameResults: GameResult[] = [
  {
    id: '1',
    opponentName: 'Rahul Kumar',
    opponentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    gameMode: 'Tug of War',
    result: 'WIN',
    xpEarned: 50,
    subject: 'Mathematics',
    timestamp: '2026-03-19T10:30:00',
    score: '15-12',
  },
  {
    id: '2',
    opponentName: 'Sneha Patel',
    opponentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
    gameMode: 'Speed Blitz',
    result: 'WIN',
    xpEarned: 35,
    subject: 'Science',
    timestamp: '2026-03-19T09:15:00',
    score: '18-14',
  },
  {
    id: '3',
    opponentName: 'Arjun Singh',
    opponentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
    gameMode: 'Quiz Battle',
    result: 'LOSE',
    xpEarned: 10,
    subject: 'English',
    timestamp: '2026-03-18T16:45:00',
    score: '10-14',
  },
  {
    id: '4',
    opponentName: 'Ananya Reddy',
    opponentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    gameMode: 'Team Tournament',
    result: 'WIN',
    xpEarned: 75,
    subject: 'Social Studies',
    timestamp: '2026-03-18T14:20:00',
    score: '45-38',
  },
  {
    id: '5',
    opponentName: 'Vikram Malhotra',
    opponentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    gameMode: 'Speed Blitz',
    result: 'WIN',
    xpEarned: 40,
    subject: 'Mathematics',
    timestamp: '2026-03-17T11:00:00',
    score: '20-16',
  },
  {
    id: '6',
    opponentName: 'Diya Kapoor',
    opponentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diya',
    gameMode: 'Tug of War',
    result: 'LOSE',
    xpEarned: 15,
    subject: 'Science',
    timestamp: '2026-03-17T15:30:00',
    score: '11-15',
  },
];

// Subject mastery
export const subjectMastery: SubjectMastery[] = [
  {
    subject: 'Mathematics',
    percentage: 78,
    color: 'bg-[#1D9E75]',
    icon: '📐',
    totalQuizzes: 12,
    averageScore: 78,
  },
  {
    subject: 'Science',
    percentage: 85,
    color: 'bg-[#1D9E75]',
    icon: '🔬',
    totalQuizzes: 15,
    averageScore: 85,
  },
  {
    subject: 'English',
    percentage: 65,
    color: 'bg-[#EF9F27]',
    icon: '📚',
    totalQuizzes: 10,
    averageScore: 65,
  },
  {
    subject: 'Social Studies',
    percentage: 42,
    color: 'bg-[#E24B4A]',
    icon: '🌍',
    totalQuizzes: 8,
    averageScore: 42,
  },
  {
    subject: 'Hindi',
    percentage: 72,
    color: 'bg-[#1D9E75]',
    icon: '✍️',
    totalQuizzes: 9,
    averageScore: 72,
  },
];

// Badges
export const badges: Badge[] = [
  {
    id: '1',
    name: '7-Day Streak',
    icon: '🔥',
    earned: true,
    description: 'Login 7 days in a row',
    dateEarned: '2026-03-19',
  },
  {
    id: '2',
    name: 'First Win',
    icon: '🏆',
    earned: true,
    description: 'Win your first battle',
    dateEarned: '2026-03-12',
  },
  {
    id: '3',
    name: 'Perfect 100',
    icon: '💯',
    earned: true,
    description: 'Score 100% in any quiz',
    dateEarned: '2026-03-15',
  },
  {
    id: '4',
    name: 'Battle Veteran',
    icon: '⚔️',
    earned: true,
    description: 'Complete 50 battles',
    dateEarned: '2026-03-18',
  },
  {
    id: '5',
    name: 'Quiz Master',
    icon: '🎓',
    earned: false,
    description: 'Complete 100 quizzes',
  },
  {
    id: '6',
    name: 'Class Champion',
    icon: '👑',
    earned: false,
    description: 'Reach rank #1 in your class',
  },
  {
    id: '7',
    name: 'Speed Demon',
    icon: '⚡',
    earned: false,
    description: 'Complete 10 Speed Blitz games',
  },
  {
    id: '8',
    name: 'Math Genius',
    icon: '🧮',
    earned: true,
    description: 'Score 90% or above in 10 Math quizzes',
    dateEarned: '2026-03-17',
  },
];

// Leaderboard
export const leaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'Aarav Mehta',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
    xp: 4250,
    level: 15,
    weeklyXP: 680,
    badges: 12,
  },
  {
    rank: 2,
    name: 'Ishita Verma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ishita',
    xp: 3980,
    level: 14,
    weeklyXP: 620,
    badges: 10,
  },
  {
    rank: 3,
    name: 'Rohan Gupta',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
    xp: 3750,
    level: 14,
    weeklyXP: 580,
    badges: 11,
  },
  {
    rank: 4,
    name: 'Sanya Iyer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanya',
    xp: 3520,
    level: 13,
    weeklyXP: 540,
    badges: 9,
  },
  {
    rank: 5,
    name: 'Karan Joshi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karan',
    xp: 3200,
    level: 13,
    weeklyXP: 500,
    badges: 8,
  },
  {
    rank: 6,
    name: 'Meera Nair',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera',
    xp: 3050,
    level: 12,
    weeklyXP: 480,
    badges: 9,
  },
  {
    rank: 7,
    name: 'Priya Sharma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    xp: 2850,
    level: 12,
    weeklyXP: 450,
    badges: 5,
  },
  {
    rank: 8,
    name: 'Aditya Rao',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya',
    xp: 2720,
    level: 11,
    weeklyXP: 420,
    badges: 7,
  },
  {
    rank: 9,
    name: 'Neha Desai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha',
    xp: 2580,
    level: 11,
    weeklyXP: 400,
    badges: 6,
  },
  {
    rank: 10,
    name: 'Aryan Saxena',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan',
    xp: 2450,
    level: 11,
    weeklyXP: 380,
    badges: 6,
  },
];

// Game modes
export const gameModes: GameMode[] = [
  {
    id: '1',
    name: 'Tug of War Quiz',
    description: 'Pull the rope to your side by answering correctly!',
    icon: '⚔️',
    players: '1v1',
    duration: '5 min',
    xpReward: '30-50 XP',
    color: 'from-[#FF6B35] to-[#FFB347]',
  },
  {
    id: '2',
    name: 'Speed Blitz',
    description: 'Answer as many questions as possible in 60 seconds',
    icon: '⚡',
    players: '1v1',
    duration: '1 min',
    xpReward: '20-40 XP',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    id: '3',
    name: 'Quiz Battle',
    description: 'Classic quiz showdown - most correct answers wins',
    icon: '🎯',
    players: '1v1',
    duration: '10 min',
    xpReward: '40-60 XP',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: '4',
    name: 'Team Tournament',
    description: 'Team up with classmates and compete together',
    icon: '👥',
    players: '3v3',
    duration: '15 min',
    xpReward: '60-100 XP',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: '5',
    name: 'VS AI Robot',
    description: 'Practice against our intelligent AI opponent',
    icon: '🤖',
    players: '1vAI',
    duration: '5 min',
    xpReward: '15-25 XP',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: '6',
    name: 'Classroom Olympiad',
    description: 'Weekly competition with your entire class',
    icon: '🏆',
    players: 'All',
    duration: '20 min',
    xpReward: '100-200 XP',
    color: 'from-amber-500 to-orange-600',
  },
];

// Daily challenge
export const dailyChallenge = {
  title: '60 Second Blitz',
  subject: 'Mathematics',
  topic: 'Quadratic Equations',
  xpReward: 10,
  questions: 10,
  description: 'Complete to earn 10 XP and keep your streak alive!',
};

// Notifications
export const notifications = [
  {
    id: '1',
    type: 'assignment',
    title: 'New Assignment Posted',
    message: 'Your teacher has posted "Algebra Basics Quiz"',
    timestamp: '2026-03-19T09:00:00',
    read: false,
  },
  {
    id: '2',
    type: 'game',
    title: 'Challenge Received',
    message: 'Rahul Kumar challenged you to a Tug of War battle!',
    timestamp: '2026-03-19T08:30:00',
    read: false,
  },
  {
    id: '3',
    type: 'achievement',
    title: 'New Badge Earned! 🎉',
    message: 'You earned the "7-Day Streak" badge',
    timestamp: '2026-03-19T06:00:00',
    read: false,
  },
  {
    id: '4',
    type: 'leaderboard',
    title: 'Rank Update',
    message: 'You moved up 2 positions to rank #7!',
    timestamp: '2026-03-18T20:00:00',
    read: true,
  },
  {
    id: '5',
    type: 'reminder',
    title: 'Quiz Deadline',
    message: 'Photosynthesis Test is due today',
    timestamp: '2026-03-18T18:00:00',
    read: true,
  },
];
