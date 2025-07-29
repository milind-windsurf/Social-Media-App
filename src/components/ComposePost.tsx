'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { usePosts } from '@/context/PostsContext';
import { Avatar } from './Avatar';
import { Author } from '@/types';

/**
 * Props for ComposePost component
 */
interface ComposePostProps {
  /** Optional placeholder text for the compose textarea */
  placeholder?: string;
  /** Optional callback when a post is successfully created */
  onPostCreated?: () => void;
  /** Optional CSS class name */
  className?: string;
  /** Optional character limit for posts */
  characterLimit?: number;
}

/**
 * Component for composing and posting new tweets/posts
 * @param {ComposePostProps} props - Component props
 * @returns {JSX.Element} Compose post form with textarea and action buttons
 */
export const ComposePost = ({ 
  placeholder = "What's happening?", 
  onPostCreated, 
  className,
  characterLimit = 280 
}: ComposePostProps): JSX.Element => {
  const [content, setContent] = useState<string>('');
  const { addPost } = usePosts();

  /**
   * Handle form submission to create a new post
   * @param {FormEvent<HTMLFormElement>} e - Form submission event
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (content.trim()) {
      const author: Author = {
        name: 'You',
        username: 'you'
      };
      
      addPost({
        author,
        content: content.trim()
      });
      setContent('');
      onPostCreated?.();
    }
  };

  /**
   * Handle textarea input change
   * @param {ChangeEvent<HTMLTextAreaElement>} e - Input change event
   */
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setContent(e.target.value);
  };

  const remainingChars = characterLimit - content.length;

  return (
    <div className={`border-b border-gray-200 px-6 py-4 w-full ${className || ''}`}>
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
              placeholder={placeholder}
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
