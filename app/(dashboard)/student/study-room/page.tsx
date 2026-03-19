"use client";
import { BookOpen, FileText, Video, Brain, Download, ExternalLink } from 'lucide-react';
import { subjectMastery } from '@/data/mockData';

interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  type: 'notes' | 'video' | 'practice' | 'quiz';
  duration?: string;
  pages?: number;
  icon: React.ReactNode;
  color: string;
}

export default function StudyRoom() {
  const studyMaterials: StudyMaterial[] = [
    {
      id: '1',
      title: 'Quadratic Equations - Complete Guide',
      subject: 'Mathematics',
      type: 'notes',
      pages: 15,
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-blue-500',
    },
    {
      id: '2',
      title: 'Photosynthesis Explained',
      subject: 'Science',
      type: 'video',
      duration: '12:30',
      icon: <Video className="w-5 h-5" />,
      color: 'bg-green-500',
    },
    {
      id: '3',
      title: 'Grammar Practice Worksheets',
      subject: 'English',
      type: 'practice',
      pages: 8,
      icon: <Brain className="w-5 h-5" />,
      color: 'bg-purple-500',
    },
    {
      id: '4',
      title: 'Indian Freedom Struggle Quiz',
      subject: 'Social Studies',
      type: 'quiz',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-orange-500',
    },
    {
      id: '5',
      title: 'Trigonometry Basics Video',
      subject: 'Mathematics',
      type: 'video',
      duration: '18:45',
      icon: <Video className="w-5 h-5" />,
      color: 'bg-blue-500',
    },
    {
      id: '6',
      title: 'Cell Structure Notes',
      subject: 'Science',
      type: 'notes',
      pages: 12,
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-green-500',
    },
  ];

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      notes: 'Study Notes',
      video: 'Video Lesson',
      practice: 'Practice',
      quiz: 'Quiz',
    };
    return labels[type] || type;
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Room</h1>
        <p className="text-gray-600">Access study materials, notes, and practice resources</p>
      </div>

      {/* Subject Progress Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Subject Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {subjectMastery.map((subject) => (
            <div key={subject.subject} className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
                {subject.icon}
              </div>
              <p className="font-medium text-gray-900 text-sm mb-1">{subject.subject}</p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${subject.color} rounded-full`}
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600">{subject.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Study Materials */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
          <button className="text-sm text-[#FF6B35] font-medium hover:underline">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studyMaterials.slice(0, 3).map((material) => (
            <div
              key={material.id}
              className="bg-gradient-to-br from-[#FF6B35] to-[#FFB347] text-white rounded-xl p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${material.color} rounded-lg flex items-center justify-center`}>
                  {material.icon}
                </div>
                <span className="bg-white/20 text-xs px-3 py-1 rounded-full font-medium">
                  {getTypeLabel(material.type)}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{material.title}</h3>
              <p className="text-sm opacity-90 mb-4">{material.subject}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">
                  {material.duration || `${material.pages} pages`}
                </span>
                <ExternalLink className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Study Materials */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Study Materials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studyMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-[#FF6B35] cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${material.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                  {material.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{material.title}</h3>
                      <p className="text-sm text-gray-600">{material.subject}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                      {getTypeLabel(material.type)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                      {material.duration || `${material.pages} pages`}
                    </span>
                    <button className="text-[#FF6B35] hover:text-[#FF6B35]/80 flex items-center gap-2 text-sm font-medium">
                      {material.type === 'video' ? (
                        <>
                          <Video className="w-4 h-4" />
                          Watch
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <BookOpen className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">NCERT Textbooks</h3>
          <p className="text-sm text-gray-600 mb-4">
            Access all your NCERT textbooks in digital format
          </p>
          <button className="text-blue-600 font-medium text-sm hover:underline">
            Browse Books →
          </button>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <Brain className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Practice Tests</h3>
          <p className="text-sm text-gray-600 mb-4">
            Test your knowledge with chapter-wise practice tests
          </p>
          <button className="text-purple-600 font-medium text-sm hover:underline">
            Take Test →
          </button>
        </div>

        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <Video className="w-8 h-8 text-orange-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Video Library</h3>
          <p className="text-sm text-gray-600 mb-4">
            Watch expert-made video lessons for all subjects
          </p>
          <button className="text-orange-600 font-medium text-sm hover:underline">
            Watch Videos →
          </button>
        </div>
      </div>
    </div>
  );
}
