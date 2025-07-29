'use client';

import { usePosts } from '@/context/PostsContext';
import { Post } from './Post';
import { useState, useEffect, useRef } from 'react';

/**
 * Timeline component that displays all posts with sorting options
 */
export const Timeline = () => {
  const { posts } = usePosts();
  const [sortBy, setSortBy] = useState('recent');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedSort = localStorage.getItem('timeline-sort');
    if (savedSort && ['recent', 'popular', 'oldest'].includes(savedSort)) {
      setSortBy(savedSort);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('timeline-sort', sortBy);
  }, [sortBy]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSortedPosts = () => {
    const sortedPosts = [...posts];
    
    switch (sortBy) {
      case 'popular':
        return sortedPosts.sort((a, b) => (b.likes + b.retweets) - (a.likes + a.retweets));
      case 'oldest':
        return sortedPosts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      case 'recent':
      default:
        return sortedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  };

  const sortOptions = [
    { value: 'recent', label: 'Most Recent', icon: '🕒' },
    { value: 'popular', label: 'Most Popular', icon: '🔥' },
    { value: 'oldest', label: 'Oldest First', icon: '📅' }
  ];

  const currentSort = sortOptions.find(option => option.value === sortBy);

  return (
    <div className="w-full bg-white border-x border-gray-200 min-h-screen">
      {/* Header with Sort Button */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl heading-1 text-gray-900">Home</h1>
          
          {/* Sort Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span>{currentSort.icon}</span>
              <span>{currentSort.label}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                      sortBy === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                    {sortBy === option.value && (
                      <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="divide-y divide-gray-200">
        {getSortedPosts().map((post) => (
          <div key={post.id} className="transition-all duration-300 ease-in-out">
            <Post post={post} />
          </div>
        ))}
      </div>

      {/* Loading state placeholder */}
      {posts.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p className="text-accent">No posts to show yet.</p>
        </div>
      )}
    </div>
  );
};
