'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePosts } from '@/context/PostsContext';
import { Post } from './Post';

/**
 * Timeline component that displays all posts in chronological order
 */
export const Timeline = () => {
  const { posts } = usePosts();
  const [sortBy, setSortBy] = useState('latest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const savedPreference = sessionStorage.getItem('homeFeedSortPreference');
    if (savedPreference) setSortBy(savedPreference);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('homeFeedSortPreference', sortBy);
  }, [sortBy]);

  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    
    return [...posts].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'most-liked':
          return b.likes - a.likes;
        case 'most-engaged':
          const engagementA = a.likes + a.retweets + a.replies;
          const engagementB = b.likes + b.retweets + b.replies;
          return engagementB - engagementA;
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });
  }, [posts, sortBy]);

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'most-liked', label: 'Most Liked' },
    { value: 'most-engaged', label: 'Most Engaged' }
  ];

  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Latest';

  const handleSortChange = (value) => {
    setSortBy(value);
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full bg-white border-x border-gray-200 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl heading-1 text-gray-900">Home</h1>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <span className="text-accent">{currentSortLabel}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        sortBy === option.value 
                          ? 'bg-blue-50 text-blue-700 text-accent' 
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="divide-y divide-gray-200">
        {sortedPosts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>

      {/* Loading state placeholder */}
      {sortedPosts.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p className="text-accent">No posts to show yet.</p>
        </div>
      )}
    </div>
  );
};
