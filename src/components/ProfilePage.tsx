'use client';

import { useState, useEffect } from 'react';
import { usePosts } from '@/context/PostsContext';
import { Avatar } from './Avatar';
import { Post } from './Post';
import { Post as PostType } from '@/types';

interface Profile {
  id: number;
  name: string;
  handle: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  following: number;
  followers: number;
  postsCount: number;
  coverPhoto: string;
  avatar: string;
}

type TabType = 'posts' | 'likes' | 'media';

/**
 * ProfilePage component that displays a user's profile information and posts
 * This component shows user details, stats, and content organized in tabs
 */
export function ProfilePage(): JSX.Element {
  const { posts } = usePosts();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  /**
   * Effect hook to load profile data and filter posts
   * In a real app, this would fetch from an API
   */
  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      // Mock profile data
      const mockProfile = {
        id: 1,
        name: 'Your Name',
        handle: 'yourhandle',
        bio: 'Software developer passionate about building great user experiences. Love hiking and photography in my free time.',
        location: 'San Francisco, CA',
        website: 'https://example.com',
        joinDate: 'January 2023',
        following: 245,
        followers: 587,
        postsCount: 132,
        coverPhoto: '',
        avatar: ''
      };

      setProfile(mockProfile);
      
      // Filter posts for the current user
      if (posts && posts.length > 0) {
        // In a real app, we'd filter by actual user ID
        // For demo purposes, let's assume posts with even IDs belong to the current user
        const userPostsFiltered = posts.filter(post => post.id % 2 === 0);
        setUserPosts(userPostsFiltered);
        
        // Mock liked posts (in a real app, this would come from user data)
        // For demo purposes, let's assume the user liked posts with odd IDs
        const likedPostsFiltered = posts.filter(post => post.id % 2 === 1);
        setLikedPosts(likedPostsFiltered);
      }
      
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [posts]);

  /**
   * Get content based on active tab
   */
  const renderTabContent = (): JSX.Element | null => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <div role="status" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'posts':
        return userPosts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {userPosts.map(post => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-500">No posts yet</p>
          </div>
        );
      case 'likes':
        return likedPosts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {likedPosts.map(post => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-500">No liked posts</p>
          </div>
        );
      case 'media':
        return (
          <div className="py-10 text-center">
            <p className="text-gray-500">Media content will be displayed here</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading && !profile) {
    return (
      <div className="bg-white border-x border-gray-200 min-h-screen w-full">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-x border-gray-200 min-h-screen w-full">
      {/* Cover photo */}
      <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 relative">
        {profile?.coverPhoto && (
          <img 
            src={profile.coverPhoto} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile header */}
      <div className="px-6 pt-0 pb-4 border-b border-gray-200 relative">
        <div className="flex justify-between items-start">
          <div className="mt-[-3rem]">
            <Avatar 
              name={profile?.name || "User"} 
              size="lg"
              className="w-24 h-24 border-4 border-white"
            />
          </div>
          <button className="mt-4 px-4 py-1.5 border border-gray-300 rounded-full font-medium hover:bg-gray-100 transition-colors">
            Edit profile
          </button>
        </div>

        <div className="mt-3">
          <h1 className="text-xl font-bold">{profile?.name}</h1>
          <p className="text-gray-500">@{profile?.handle}</p>
        </div>

        <div className="mt-3">
          <p className="text-gray-800">{profile?.bio}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-y-2 gap-x-4">
          {profile?.location && (
            <div className="flex items-center text-gray-500 mr-4">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span>{profile.location}</span>
            </div>
          )}
          {profile?.website && (
            <div className="flex items-center text-blue-500 mr-4">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          )}
          <div className="flex items-center text-gray-500">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>Joined {profile?.joinDate}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex space-x-5">
          <div className="flex items-center">
            <span className="font-bold">{profile?.following.toLocaleString()}</span>
            <span className="ml-1 text-gray-500">Following</span>
          </div>
          <div className="flex items-center">
            <span className="font-bold">{profile?.followers.toLocaleString()}</span>
            <span className="ml-1 text-gray-500">Followers</span>
          </div>
          <div className="flex items-center">
            <span className="font-bold">{profile?.postsCount.toLocaleString()}</span>
            <span className="ml-1 text-gray-500">Posts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 w-full">
        <button 
          className={`flex-1 py-3 text-center font-medium ${activeTab === 'posts' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button 
          className={`flex-1 py-3 text-center font-medium ${activeTab === 'likes' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('likes')}
        >
          Likes
        </button>
        <button 
          className={`flex-1 py-3 text-center font-medium ${activeTab === 'media' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('media')}
        >
          Media
        </button>
      </div>

      {/* Tab content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
}
