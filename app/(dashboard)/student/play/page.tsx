"use client";
import { useState } from 'react';
import { Play, Users, Clock, Trophy, ChevronRight } from 'lucide-react';
import { gameModes, subjectMastery } from '@/data/mockData';

export default function PlayGame() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

  const handleStartGame = () => {
    alert(`Starting ${selectedMode || 'game'}! This is a demo - in production, this would launch the game.`);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Play Game</h1>
        <p className="text-gray-600">Choose your game mode and challenge yourself!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#FF6B35] to-[#FFB347] text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Games Played</p>
              <p className="text-3xl font-bold mt-1">47</p>
            </div>
            <Trophy className="w-10 h-10 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Win Rate</p>
              <p className="text-3xl font-bold mt-1">68%</p>
            </div>
            <Trophy className="w-10 h-10 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Wins</p>
              <p className="text-3xl font-bold mt-1">32</p>
            </div>
            <Trophy className="w-10 h-10 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">XP Earned</p>
              <p className="text-3xl font-bold mt-1">1,450</p>
            </div>
            <Trophy className="w-10 h-10 opacity-50" />
          </div>
        </div>
      </div>

      {/* Subject Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Subject</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {subjectMastery.map((subject) => (
            <button
              key={subject.subject}
              onClick={() => setSelectedSubject(subject.subject)}
              className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                selectedSubject === subject.subject
                  ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                  : 'border-gray-200 bg-white hover:border-[#FF6B35]/50'
              }`}
            >
              <div className="text-3xl mb-2">{subject.icon}</div>
              <p className="font-medium text-gray-900 text-sm">{subject.subject}</p>
              <p className="text-xs text-gray-500 mt-1">{subject.percentage}% mastery</p>
            </button>
          ))}
        </div>
      </div>

      {/* Game Modes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Game Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameModes.map((mode) => (
            <div
              key={mode.id}
              onClick={() => setSelectedMode(mode.name)}
              className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all hover:scale-105 ${
                selectedMode === mode.name
                  ? 'border-[#FF6B35] shadow-lg'
                  : 'border-gray-200 hover:border-[#FF6B35]/50'
              }`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${mode.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                {mode.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{mode.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{mode.description}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{mode.players}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{mode.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Trophy className="w-4 h-4" />
                  <span>{mode.xpReward}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Game Button */}
      {selectedMode && (
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-[#FF6B35]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Ready to Play?</h3>
              <p className="text-gray-600">
                {selectedMode} • {selectedSubject}
              </p>
            </div>
            <button
              onClick={handleStartGame}
              className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105 flex items-center gap-3"
            >
              <Play className="w-6 h-6" />
              START GAME
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Active Tournaments */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Tournaments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Weekly Class Championship</h3>
                <p className="text-sm opacity-90">Grade 8-A Mathematics</p>
              </div>
              <Trophy className="w-8 h-8 opacity-50" />
            </div>
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Your Rank</span>
                <span className="font-bold text-lg">#7</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Participants</span>
                <span className="font-bold">42 students</span>
              </div>
            </div>
            <button className="w-full bg-white text-purple-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              Join Tournament
            </button>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Science Quiz Battle</h3>
                <p className="text-sm opacity-90">All Classes • Biology</p>
              </div>
              <Trophy className="w-8 h-8 opacity-50" />
            </div>
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Prize Pool</span>
                <span className="font-bold text-lg">500 XP</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Starts In</span>
                <span className="font-bold">2 hours</span>
              </div>
            </div>
            <button className="w-full bg-white text-orange-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
