import Link from 'next/link';
import {
  Play,
  Target,
  TrendingUp,
  TrendingDown,
  Zap,
  Award,
  Lock,
  Bot,
  Users,
  Sword,
  ChevronRight,
} from 'lucide-react';
import {
  currentStudent,
  assignments,
  gameResults,
  subjectMastery,
  badges,
  dailyChallenge,
} from '@/data/mockData';

export default function DashboardHome() {
  const nextLevelXP = 3000;
  const xpProgress = (currentStudent.xpPoints / nextLevelXP) * 100;
  const xpToNextLevel = nextLevelXP - currentStudent.xpPoints;

  const pendingAssignments = assignments.filter((a) => a.status === 'pending').slice(0, 3);

  const weakestSubject = subjectMastery.reduce((min, subject) =>
    subject.percentage < min.percentage ? subject : min
  );

  const getDeadlineText = (deadline: string, isOverdue: boolean, isToday: boolean) => {
    if (isOverdue) return 'Overdue';
    if (isToday) return 'Due Today';
    const date = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
  };

  const getDeadlineColor = (isOverdue: boolean, isToday: boolean) => {
    if (isOverdue) return 'text-[#E24B4A]';
    if (isToday) return 'text-[#FF6B35]';
    return 'text-gray-500';
  };

  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Widget 1: Today's Challenge */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Daily Challenge</span>
              </div>
              <h3 className="text-2xl font-bold">{dailyChallenge.title}</h3>
              <p className="text-sm opacity-90 mt-1">
                {dailyChallenge.subject} • {dailyChallenge.topic}
              </p>
            </div>
            <div className="bg-white/20 rounded-full px-3 py-1">
              <p className="text-sm font-semibold">{dailyChallenge.xpReward} XP</p>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-6">{dailyChallenge.description}</p>
          <Link
            href="/play"
            className="inline-flex items-center gap-2 bg-white text-[#FF6B35] px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            <Play className="w-5 h-5" />
            START CHALLENGE
          </Link>
        </div>

        {/* Widget 2: My Assignments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Assignments</h3>
            <Link href="/assignments" className="text-sm text-[#FF6B35] font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {pendingAssignments.map((assignment) => (
              <div key={assignment.id} className="border border-gray-200 rounded-lg p-3 hover:border-[#FF6B35] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2 flex-1">
                    <div className={`w-2 h-2 rounded-full ${assignment.subjectColor} mt-1.5`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {assignment.title}
                      </h4>
                      <p className="text-xs text-gray-500">{assignment.subject}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs font-medium ${getDeadlineColor(
                      assignment.isOverdue,
                      assignment.isToday
                    )}`}
                  >
                    {getDeadlineText(
                      assignment.deadline,
                      assignment.isOverdue,
                      assignment.isToday
                    )}
                  </span>
                  <span className="text-xs text-gray-500">{assignment.questions} questions</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: My Rank This Week */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Rank This Week</h3>
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-bold text-[#FF6B35]">#{currentStudent.classRank}</span>
              <div className="flex flex-col items-start">
                {currentStudent.rankChange > 0 ? (
                  <div className="flex items-center gap-1 text-[#1D9E75]">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">↑{currentStudent.rankChange}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[#E24B4A]">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      ↓{Math.abs(currentStudent.rankChange)}
                    </span>
                  </div>
                )}
                <span className="text-xs text-gray-500">from last week</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Grade {currentStudent.grade}-{currentStudent.section}
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="w-full block text-center border border-[#FF6B35] text-[#FF6B35] px-4 py-2 rounded-lg font-medium hover:bg-[#FF6B35]/5 transition-colors"
          >
            View Full Leaderboard
          </Link>
        </div>

        {/* Widget 4: XP & Level Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Level Progress</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-2xl flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Level {currentStudent.level}</p>
              <p className="text-sm text-gray-600">{currentStudent.levelName}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current XP</span>
              <span className="font-semibold text-gray-900">{currentStudent.xpPoints}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347] rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{xpToNextLevel} XP to next level</span>
              <span className="font-semibold text-gray-900">{nextLevelXP} XP</span>
            </div>
          </div>
          <div className="mt-4 bg-[#FFB347]/10 rounded-lg p-3">
            <p className="text-sm text-gray-600">This Week</p>
            <p className="text-xl font-bold text-[#FF6B35]">+{currentStudent.totalXPThisWeek} XP</p>
          </div>
        </div>

        {/* Widget 5: Subject Mastery */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Mastery</h3>
          <div className="space-y-4">
            {subjectMastery.map((subject, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{subject.icon}</span>
                    <span className="text-sm text-gray-700">{subject.subject}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {subject.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${subject.color} rounded-full transition-all duration-500`}
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 rounded-lg p-3 flex items-start gap-2">
            <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-900">AI Recommends</p>
              <p className="text-sm text-blue-700">Practice {weakestSubject.subject}</p>
            </div>
          </div>
        </div>

        {/* Widget 6: Recent Game Results */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Game Results</h3>
            <span className="text-sm text-[#FF6B35] font-medium cursor-pointer hover:underline">
              View All Games
            </span>
          </div>
          <div className="space-y-3">
            {gameResults.slice(0, 3).map((game) => (
              <div
                key={game.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-[#FF6B35] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                      <img
                        src={game.opponentAvatar}
                        alt={game.opponentName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{game.opponentName}</p>
                      <p className="text-xs text-gray-500">{game.gameMode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{game.subject}</p>
                      <p className="text-sm font-semibold text-gray-900">+{game.xpEarned} XP</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        game.result === 'WIN'
                          ? 'bg-[#1D9E75] text-white'
                          : 'bg-[#E24B4A] text-white'
                      }`}
                    >
                      {game.result}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 7: Badges Earned */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Badges</h3>
            <span className="text-sm text-[#FF6B35] font-medium cursor-pointer hover:underline">
              View All
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {badges.slice(0, 6).map((badge) => (
              <div
                key={badge.id}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-transform hover:scale-105 ${
                  badge.earned
                    ? 'bg-gradient-to-br from-[#FFB347]/20 to-[#FF6B35]/20'
                    : 'bg-gray-100'
                }`}
                title={badge.description}
              >
                {badge.earned ? (
                  <>
                    <span className="text-3xl mb-1">{badge.icon}</span>
                    <p className="text-xs text-center font-medium text-gray-700 leading-tight">
                      {badge.name}
                    </p>
                  </>
                ) : (
                  <>
                    <Lock className="w-6 h-6 text-gray-400 mb-1" />
                    <p className="text-xs text-center text-gray-500">Locked</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Widget 8: Quick Actions */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/play"
            className="bg-gradient-to-br from-[#FF6B35] to-[#FFB347] text-white rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-105"
          >
            <Sword className="w-8 h-8 mb-3" />
            <h4 className="font-bold text-lg mb-1">QUICK BATTLE</h4>
            <p className="text-sm opacity-90">Find random opponent in your class</p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium">
              Start Now <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
          <Link
            href="/play"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-105"
          >
            <Bot className="w-8 h-8 mb-3" />
            <h4 className="font-bold text-lg mb-1">VS AI ROBOT</h4>
            <p className="text-sm opacity-90">Practice with AI opponent</p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium">
              Practice Now <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
          <Link
            href="/play"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-105"
          >
            <Users className="w-8 h-8 mb-3" />
            <h4 className="font-bold text-lg mb-1">JOIN TOURNAMENT</h4>
            <p className="text-sm opacity-90">Weekly class tournament</p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium">
              Join Now <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
