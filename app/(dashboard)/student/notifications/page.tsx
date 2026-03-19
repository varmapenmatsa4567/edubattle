"use client";
import { useState } from 'react';
import { Bell, FileText, Sword, Award, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { notifications } from '@/data/mockData';

export default function Notifications() {
  const [notificationList, setNotificationList] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications =
    filter === 'unread' ? notificationList.filter((n) => !n.read) : notificationList;

  const unreadCount = notificationList.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'game':
        return <Sword className="w-5 h-5 text-[#FF6B35]" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-600" />;
      case 'leaderboard':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-50';
      case 'game':
        return 'bg-orange-50';
      case 'achievement':
        return 'bg-yellow-50';
      case 'leaderboard':
        return 'bg-green-50';
      case 'reminder':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Stay updated with your activities and achievements</p>
      </div>

      {/* Stats and Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-[#FF6B35]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {unreadCount} Unread
              </h2>
              <p className="text-sm text-gray-600">
                {notificationList.length} total notifications
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-sm font-medium hover:bg-[#FF6B35]/90 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : 'You have no notifications at the moment.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.read && markAsRead(notification.id)}
              className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${
                notification.read
                  ? 'border-gray-200 opacity-75'
                  : 'border-[#FF6B35]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 ${getNotificationBg(
                    notification.type
                  )} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className={`font-semibold ${
                        notification.read ? 'text-gray-700' : 'text-gray-900'
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      notification.read ? 'text-gray-500' : 'text-gray-700'
                    }`}
                  >
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <div className="mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="text-[#FF6B35] text-sm font-medium hover:underline"
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Assignment Reminders</p>
              <p className="text-sm text-gray-600">Get notified about upcoming assignments</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-[#FF6B35] relative cursor-pointer transition-colors
                before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 
                before:transition-transform checked:before:translate-x-6"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Game Challenges</p>
              <p className="text-sm text-gray-600">Get notified when someone challenges you</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-[#FF6B35] relative cursor-pointer transition-colors
                before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 
                before:transition-transform checked:before:translate-x-6"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Achievement Alerts</p>
              <p className="text-sm text-gray-600">Get notified when you earn badges</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-[#FF6B35] relative cursor-pointer transition-colors
                before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 
                before:transition-transform checked:before:translate-x-6"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Leaderboard Updates</p>
              <p className="text-sm text-gray-600">Get notified about rank changes</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-[#FF6B35] relative cursor-pointer transition-colors
                before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 
                before:transition-transform checked:before:translate-x-6"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
