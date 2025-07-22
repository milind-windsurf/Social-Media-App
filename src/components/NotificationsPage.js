'use client';

import { useState, useEffect } from 'react';

/**
 * NotificationsPage component that displays user notifications
 * This component shows different types of notifications such as likes, mentions,
 * and follows, with options to filter by notification type.
 * 
 * @returns {JSX.Element} The notifications page UI
 */
export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  /**
   * Effect hook to load notifications data
   * In a real app, this would fetch from an API
   */
  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      // Mock notifications data
      const mockNotifications = [
        {
          id: 1,
          type: 'like',
          user: { name: 'Jane Smith', handle: 'janesmith', avatar: '' },
          content: 'liked your post',
          postPreview: 'Just had an amazing day at the beach! #sunshine',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          read: false
        },
        {
          id: 2,
          type: 'follow',
          user: { name: 'John Doe', handle: 'johndoe', avatar: '' },
          content: 'started following you',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          read: true
        },
        {
          id: 3,
          type: 'mention',
          user: { name: 'Alex Johnson', handle: 'alexj', avatar: '' },
          content: 'mentioned you in a post',
          postPreview: 'Hey @yourhandle, check out this new restaurant!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          read: false
        },
        {
          id: 4,
          type: 'like',
          user: { name: 'Sarah Williams', handle: 'sarahw', avatar: '' },
          content: 'liked your comment',
          postPreview: 'I totally agree with your perspective on this topic.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          read: true
        },
        {
          id: 5,
          type: 'mention',
          user: { name: 'Michael Brown', handle: 'mikebrown', avatar: '' },
          content: 'replied to your comment',
          postPreview: '@yourhandle Thanks for the suggestion!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          read: true
        }
      ];

      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Filter notifications based on the selected type
   * @returns {Array} Filtered notifications
   */
  const getFilteredNotifications = () => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter(notification => notification.type === activeFilter);
  };

  /**
   * Format the timestamp to a human-readable format
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted time string
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  /**
   * Render the appropriate icon for each notification type
   * @param {string} type - Notification type
   * @returns {JSX.Element} Icon SVG
   */
  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return (
          <div className="p-2 bg-red-100 rounded-full">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        );
      case 'mention':
        return (
          <div className="p-2 bg-green-100 rounded-full">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border-x border-gray-200 min-h-screen w-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <h1 className="text-xl heading-1">Notifications</h1>
        </div>
        
        {/* Filter tabs */}
        <div className="flex border-b border-gray-200 w-full">
          <button 
            className={`flex-1 py-3 text-center font-medium text-accent ${activeFilter === 'all' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={`flex-1 py-3 text-center font-medium text-accent ${activeFilter === 'mention' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveFilter('mention')}
          >
            Mentions
          </button>
          <button 
            className={`flex-1 py-3 text-center font-medium text-accent ${activeFilter === 'like' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveFilter('like')}
          >
            Likes
          </button>
          <button 
            className={`flex-1 py-3 text-center font-medium text-accent ${activeFilter === 'follow' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveFilter('follow')}
          >
            Follows
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div role="status" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : getFilteredNotifications().length > 0 ? (
          getFilteredNotifications().map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start space-x-3">
                {renderNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900 font-display">
                      {notification.user.name} <span className="text-gray-500 font-normal font-mono">@{notification.user.handle}</span>
                    </p>
                    <span className="text-sm text-gray-500 font-mono">{formatTimestamp(notification.timestamp)}</span>
                  </div>
                  <p className="text-gray-700 text-body">
                    {notification.content}
                  </p>
                  {notification.postPreview && (
                    <p className="mt-1 text-sm text-gray-500 border-l-2 border-gray-300 pl-2 font-mono">
                      {notification.postPreview}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-500 text-accent">No notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
}
