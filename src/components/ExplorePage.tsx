'use client';

import { useEffect, useState } from 'react';
import { usePosts } from '@/context/PostsContext';
import { Post } from './Post';
import { Post as PostType } from '@/types';

/**
 * ExplorePage component that displays trending and popular posts
 * This component fetches posts from the global context and displays them
 * in order of popularity (based on likes count). It also includes a section
 * for discovering users (placeholder for future implementation).
 */
export function ExplorePage(): JSX.Element {
  const { posts } = usePosts();
  const [trendingPosts, setTrendingPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Effect hook to sort and filter posts when they are loaded
   * 
   * This effect runs whenever the posts array changes. It:
   * 1. Checks if posts exist and are not empty
   * 2. Creates a sorted copy of posts based on likes count (descending)
   * 3. Updates the trendingPosts state with the sorted array
   * 4. Sets loading state to false once processing is complete
   * 
   * In a production app, this would use more sophisticated algorithms
   * for determining trending content based on engagement metrics,
   * recency, and user preferences.
   */
  useEffect(() => {
    if (posts && posts.length > 0) {
      // Sort posts by likes count to find trending posts
      const sorted = [...posts].sort((a, b) => b.likes - a.likes);
      setTrendingPosts(sorted);
      setLoading(false);
    }
  }, [posts]);

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold">Explore</h1>
      </div>
      
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Trending Posts</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div data-testid="loading-spinner" role="status" className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        ) : trendingPosts.length > 0 ? (
          <div className="space-y-4">
            {trendingPosts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No posts available to explore yet.
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Discover Users</h2>
        {/* This would be implemented with user suggestions */}
        <div className="text-center py-4 text-gray-500">
          User suggestions coming soon!
        </div>
      </div>
    </div>
  );
}
