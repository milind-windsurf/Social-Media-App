'use client';

import { usePosts } from '@/context/PostsContext';
import { Avatar } from './Avatar';
import { Post as PostType } from '@/types';

interface PostProps {
  post: PostType;
}

/**
 * Individual post component for displaying a single post in the timeline
 */
export const Post = ({ post }: PostProps): JSX.Element => {
  const { likePost, retweetPost } = usePosts();

  /**
   * Format timestamp to a readable format
   */
  const formatTime = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    console.log('hello!');

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  /**
   * Handle like button click
   */
  const handleLike = (): void => {
    likePost(post.id);
  };

  /**
   * Handle retweet button click
   */
  const handleRetweet = (): void => {
    retweetPost(post.id);
  };

  return (
    <div className="border-b border-gray-200 px-6 py-4 hover:bg-gray-50 transition-colors w-full">
      <div className="flex space-x-3">
        {/* Avatar */}
        <Avatar 
          name={post.author.name}
          size="md"
        />
        
        {/* Post content */}
        <div className="flex-1 min-w-0">
          {/* Author info */}
          <div className="flex items-center space-x-2">
            <h3 className="font-display font-bold text-gray-900 hover:underline cursor-pointer">
              {post.author.name}
            </h3>
            <span className="text-gray-500 font-mono">@{post.author.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-sm">
              {formatTime(post.timestamp)}
            </span>
          </div>
          
          {/* Post text */}
          <p className="mt-1 text-gray-900 text-base leading-relaxed text-body">
            {post.content}
          </p>
          
          {/* Action buttons */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            {/* Reply */}
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-sm text-accent">{post.replies}</span>
            </button>
            
            {/* Retweet */}
            <button 
              onClick={handleRetweet}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-green-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <span className="text-sm text-accent">{post.retweets}</span>
            </button>
            
            {/* Like */}
            <button 
              onClick={handleLike}
              className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-red-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-sm text-accent">{post.likes}</span>
            </button>
            
            {/* Share */}
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
