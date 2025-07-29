'use client';

import React, { useState } from 'react';
import { usePosts } from '@/context/PostsContext';
import { Avatar } from './Avatar';

export const ComposePost = () => {
  const [content, setContent] = useState<string>('');
  const { addPost } = usePosts();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (content.trim()) {
      addPost({
        author: {
          name: 'You',
          username: 'you'
        },
        content: content.trim()
      });
      setContent('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setContent(e.target.value);
  };

  const characterLimit = 280;
  const remainingChars = characterLimit - content.length;

  return (
    <div className="border-b border-gray-200 px-6 py-4 w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          {/* User avatar */}
          <Avatar 
            name="You"
            size="md"
          />
          
          {/* Compose area */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={handleChange}
              placeholder="What's happening?"
              className="w-full p-3 text-lg placeholder-gray-500 border-none resize-none focus:outline-none focus:ring-0 text-body"
              rows={3}
              maxLength={characterLimit}
            />
            
            {/* Actions bar */}
            <div className="flex items-center justify-between mt-3">
              {/* Action buttons */}
              <div className="flex items-center space-x-4">
                {/* Image upload (placeholder) */}
                <button
                  type="button"
                  className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                
                {/* Emoji (placeholder) */}
                <button
                  type="button"
                  className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Character count and post button */}
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-mono ${remainingChars < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                  {remainingChars}
                </span>
                <button
                  type="submit"
                  disabled={!content.trim() || remainingChars < 0}
                  className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-display"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
