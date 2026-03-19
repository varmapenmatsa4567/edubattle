"use client";
import { useState } from 'react';
import { Trophy, Medal, TrendingUp, Award, Flame } from 'lucide-react';
import { leaderboard, currentStudent } from '@/data/mockData';

export default function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-700';
    return 'text-gray-400';
  };

  const getMedalIcon = (rank: number) => {
    if (rank <= 3) return <Medal className={`w-6 h-6 ${getMedalColor(rank)}`} />;
    return <span className="text-gray-500 font-semibold">#{rank}</span>;
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">Compete with your classmates and climb to the top!</p>
      </div>

      {/* Top 3 Podium */}
      <div className="bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-2xl p-8 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Top Champions 🏆</h2>
        <div className="grid grid-cols-3 gap-4 items-end max-w-2xl mx-auto">
          {/* 2nd Place */}
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-2">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-4 border-gray-400">
                <img
                  src={leaderboard[1].avatar}
                  alt={leaderboard[1].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-bold text-sm mb-1">{leaderboard[1].name}</p>
              <p className="text-2xl font-bold mb-1">{leaderboard[1].xp}</p>
              <p className="text-xs opacity-90">XP</p>
            </div>
            <div className="bg-white/20 h-24 rounded-t-lg flex items-center justify-center">
              <span className="text-4xl font-bold">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-2">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-4 border-yellow-400">
                <img
                  src={leaderboard[0].avatar}
                  alt={leaderboard[0].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
              <p className="font-bold mb-1">{leaderboard[0].name}</p>
              <p className="text-3xl font-bold mb-1">{leaderboard[0].xp}</p>
              <p className="text-xs opacity-90">XP</p>
            </div>
            <div className="bg-white/30 h-32 rounded-t-lg flex items-center justify-center">
              <span className="text-5xl font-bold">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-2">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-4 border-amber-700">
                <img
                  src={leaderboard[2].avatar}
                  alt={leaderboard[2].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <Medal className="w-8 h-8 text-amber-700 mx-auto mb-2" />
              <p className="font-bold text-sm mb-1">{leaderboard[2].name}</p>
              <p className="text-2xl font-bold mb-1">{leaderboard[2].xp}</p>
              <p className="text-xs opacity-90">XP</p>
            </div>
            <div className="bg-white/20 h-20 rounded-t-lg flex items-center justify-center">
              <span className="text-4xl font-bold">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Frame Filter */}
      <div className="bg-white rounded-xl p-2 shadow-sm mb-6 inline-flex gap-2">
        <button
          onClick={() => setTimeFrame('weekly')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            timeFrame === 'weekly'
              ? 'bg-[#FF6B35] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeFrame('monthly')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            timeFrame === 'monthly'
              ? 'bg-[#FF6B35] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setTimeFrame('alltime')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            timeFrame === 'alltime'
              ? 'bg-[#FF6B35] text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Time
        </button>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Level</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total XP</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Weekly XP
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.map((entry) => {
                const isCurrentStudent = entry.name === currentStudent.name;
                return (
                  <tr
                    key={entry.rank}
                    className={`hover:bg-gray-50 transition-colors ${
                      isCurrentStudent ? 'bg-[#FF6B35]/5 border-l-4 border-[#FF6B35]' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getMedalIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                          <img
                            src={entry.avatar}
                            alt={entry.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {entry.name}
                            {isCurrentStudent && (
                              <span className="ml-2 text-xs bg-[#FF6B35] text-white px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#FFB347]" />
                        <span className="font-medium text-gray-900">{entry.level}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{entry.xp.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">+{entry.weeklyXP}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-[#FF6B35]" />
                        <span className="font-medium text-gray-900">{entry.badges}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Position</p>
              <p className="text-2xl font-bold text-gray-900">#{currentStudent.classRank}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">out of {leaderboard.length} students</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Weekly Progress</p>
              <p className="text-2xl font-bold text-green-600">
                +{currentStudent.totalXPThisWeek} XP
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Keep up the great work!</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Rank</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaderboard[currentStudent.classRank - 2]?.xp - currentStudent.xpPoints} XP
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">to reach rank #{currentStudent.classRank - 1}</p>
        </div>
      </div>
    </div>
  );
}
