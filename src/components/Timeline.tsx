'use client';

import { usePosts } from '@/context/PostsContext';
import { Post } from './Post';

/**
 * Props for Timeline component
 */
interface TimelineProps {
  /** Optional CSS class name */
  className?: string;
  /** Optional maximum number of posts to display */
  maxPosts?: number;
}

/**
 * Timeline component that displays all posts in chronological order
 * @param {TimelineProps} props - Component props
 * @returns {JSX.Element} Timeline component with posts feed
 */
export const Timeline = ({ className, maxPosts }: TimelineProps): JSX.Element => {
  const { posts } = usePosts();
  
  const displayPosts = maxPosts ? posts.slice(0, maxPosts) : posts;

  return (
    <div className={`w-full bg-white border-x border-gray-200 min-h-screen ${className || ''}`}>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl heading-1 text-gray-900">Home</h1>
      </div>

      {/* Posts */}
      <div className="divide-y divide-gray-200">
        {displayPosts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>

      {/* Loading state placeholder */}
      {displayPosts.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p className="text-accent">No posts to show yet.</p>
        </div>
      )}
    </div>
  );
};
