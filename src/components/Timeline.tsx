'use client';

import React from 'react';
import { usePosts } from '@/context/PostsContext';
import { Post } from './Post';

export const Timeline = () => {
  const { posts } = usePosts();

  return (
    <div className="w-full bg-white border-x border-gray-200 min-h-screen">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl heading-1 text-gray-900">Home</h1>
      </div>

      <div className="divide-y divide-gray-200">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p className="text-accent">No posts to show yet.</p>
        </div>
      )}
    </div>
  );
};
