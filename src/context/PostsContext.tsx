'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Post, NewPost } from '@/types';

/**
 * Interface for the PostsContext value
 */
interface PostsContextType {
  posts: Post[];
  addPost: (newPost: NewPost) => void;
  likePost: (postId: number | string) => void;
  retweetPost: (postId: number | string) => void;
}

/**
 * Context for managing posts state across the application
 */
const PostsContext = createContext<PostsContextType | undefined>(undefined);

/**
 * Hook to use the PostsContext
 * @returns {PostsContextType} Posts context value with posts and functions to manage them
 */
export const usePosts = (): PostsContextType => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};

/**
 * Props for PostsProvider component
 */
interface PostsProviderProps {
  children: ReactNode;
}

/**
 * Provider component for posts context
 * @param {PostsProviderProps} props - Component props
 */
export const PostsProvider = ({ children }: PostsProviderProps): JSX.Element => {
  // Sample data for the timeline
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: {
        name: 'John Doe',
        username: 'johndoe'
      },
      content: 'Just built an amazing Next.js app! The new app router is incredible 🚀',
      timestamp: new Date('2024-01-15T10:30:00'),
      likes: 42,
      retweets: 12,
      replies: 5
    },
    {
      id: 2,
      author: {
        name: 'Jane Smith',
        username: 'janesmith'
      },
      content: 'Beautiful sunset today! Sometimes you need to step away from code and enjoy nature 🌅',
      timestamp: new Date('2024-01-15T09:15:00'),
      likes: 128,
      retweets: 34,
      replies: 18
    },
    {
      id: 3,
      author: {
        name: 'Alex Johnson',
        username: 'alexj'
      },
      content: 'Working on a new React project. Tailwind CSS makes styling so much easier! Any tips for component organization?',
      timestamp: new Date('2024-01-15T08:45:00'),
      likes: 67,
      retweets: 23,
      replies: 31
    },
    {
      id: 4,
      author: {
        name: 'Sarah Wilson',
        username: 'sarahw'
      },
      content: 'Coffee ☕ + Code 💻 = Perfect Monday morning! What\'s everyone working on today?',
      timestamp: new Date('2024-01-15T07:20:00'),
      likes: 89,
      retweets: 15,
      replies: 42
    },
    {
      id: 5,
      author: {
        name: 'Michael Chen',
        username: 'mikechen'
      },
      content: 'Just deployed my first serverless function! The future is here and it\'s amazing. #ServerlessRevolution',
      timestamp: new Date('2024-01-15T11:45:00'),
      likes: 56,
      retweets: 19,
      replies: 8
    },
    {
      id: 6,
      author: {
        name: 'Emily Rodriguez',
        username: 'emilyr'
      },
      content: 'TIL: You can use the useTransition hook in React 18 to improve UI responsiveness during state updates. Game changer! #ReactJS',
      timestamp: new Date('2024-01-15T12:20:00'),
      likes: 112,
      retweets: 45,
      replies: 23
    },
    {
      id: 7,
      author: {
        name: 'David Kim',
        username: 'davidk'
      },
      content: 'Unpopular opinion: TypeScript is worth the learning curve. The peace of mind you get from type safety is unmatched. Agree or disagree?',
      timestamp: new Date('2024-01-15T13:10:00'),
      likes: 204,
      retweets: 87,
      replies: 65
    },
    {
      id: 8,
      author: {
        name: 'Priya Patel',
        username: 'priyap'
      },
      content: 'Just gave a talk on accessibility in web apps at #TechConf2024! Slides are up on my GitHub. Remember: accessible design is good design for everyone.',
      timestamp: new Date('2024-01-15T14:05:00'),
      likes: 176,
      retweets: 93,
      replies: 27
    },
    {
      id: 9,
      author: {
        name: 'Thomas Wright',
        username: 'tomw'
      },
      content: 'Spent the weekend refactoring our codebase to use React Server Components. Performance improvements are mind-blowing! 📈',
      timestamp: new Date('2024-01-15T15:30:00'),
      likes: 88,
      retweets: 32,
      replies: 14
    },
    {
      id: 10,
      author: {
        name: 'Olivia Martinez',
        username: 'oliviam'
      },
      content: 'Hot take: CSS Grid is better than Flexbox for complex layouts. Fight me. 😄 #FrontEndDev',
      timestamp: new Date('2024-01-15T16:15:00'),
      likes: 156,
      retweets: 64,
      replies: 47
    },
    {
      id: 11,
      author: {
        name: 'Robert Taylor',
        username: 'robertt'
      },
      content: 'Just finished migrating our entire codebase from JavaScript to TypeScript. It was a journey, but so worth it! The number of bugs caught during the migration was eye-opening.',
      timestamp: new Date('2024-01-15T17:00:00'),
      likes: 221,
      retweets: 89,
      replies: 36
    },
    {
      id: 12,
      author: {
        name: 'Sophia Lee',
        username: 'sophial'
      },
      content: 'Reminder: Take breaks when coding! Your brain needs rest to solve problems efficiently. I use the Pomodoro technique - 25 min work, 5 min break. Works wonders!',
      timestamp: new Date('2024-01-15T17:45:00'),
      likes: 192,
      retweets: 78,
      replies: 24
    },
    {
      id: 13,
      author: {
        name: 'Marcus Green',
        username: 'marcusg'
      },
      content: 'Just finished the "Advanced React Patterns" course by @kentcdodds - absolutely mind-blowing content! Highly recommend to all React devs.',
      timestamp: new Date('2024-01-15T18:30:00'),
      likes: 78,
      retweets: 25,
      replies: 11
    },
    {
      id: 14,
      author: {
        name: 'Aisha Johnson',
        username: 'aishaj'
      },
      content: 'Anyone else excited about the new features in Next.js 14? The new caching strategy is exactly what I needed for my current project! #NextJS',
      timestamp: new Date('2024-01-15T19:15:00'),
      likes: 134,
      retweets: 56,
      replies: 29
    },
    {
      id: 15,
      author: {
        name: 'Carlos Mendez',
        username: 'carlosm'
      },
      content: 'Just hit 1000 stars on my open source project! Thanks to everyone who contributed and supported. Open source is all about community. ❤️',
      timestamp: new Date('2024-01-15T20:00:00'),
      likes: 267,
      retweets: 112,
      replies: 43
    },
    {
      id: 16,
      author: {
        name: 'Natalie Wong',
        username: 'nataliew'
      },
      content: 'Working remotely from Bali this month! The wifi is surprisingly good, and coding with an ocean view is unbeatable. 🏝️ #DigitalNomad',
      timestamp: new Date('2024-01-15T20:45:00'),
      likes: 189,
      retweets: 67,
      replies: 38
    },
    {
      id: 17,
      author: {
        name: 'Daniel Brown',
        username: 'danielb'
      },
      content: 'Just switched from npm to pnpm and cut our CI build times in half! Why didn\'t I do this sooner? #DevProductivity',
      timestamp: new Date('2024-01-15T21:30:00'),
      likes: 102,
      retweets: 48,
      replies: 22
    },
    {
      id: 18,
      author: {
        name: 'Leila Ahmed',
        username: 'leilaa'
      },
      content: 'Gave a lightning talk at the local JS meetup tonight about testing React hooks. So many great questions! Love our tech community. ⚡',
      timestamp: new Date('2024-01-15T22:15:00'),
      likes: 76,
      retweets: 23,
      replies: 17
    },
    {
      id: 19,
      author: {
        name: 'Jason Taylor',
        username: 'jasont'
      },
      content: 'Unpopular opinion: Dark mode should be the default for all developer tools and websites. Save our eyes! 👀',
      timestamp: new Date('2024-01-15T23:00:00'),
      likes: 245,
      retweets: 98,
      replies: 57
    },
    {
      id: 20,
      author: {
        name: 'Zoe Garcia',
        username: 'zoeg'
      },
      content: 'Just completed my 30-day coding challenge! Built a new mini-project every day. Exhausting but so worth it for the growth! See all projects at github.com/zoegarcia/30days',
      timestamp: new Date('2024-01-15T23:45:00'),
      likes: 312,
      retweets: 143,
      replies: 64
    }
  ]);

  /**
   * Add a new post to the timeline
   * @param {NewPost} newPost - The new post object
   */
  const addPost = (newPost: NewPost): void => {
    const post: Post = {
      ...newPost,
      id: Date.now(),
      timestamp: new Date(),
      likes: 0,
      retweets: 0,
      replies: 0
    };
    setPosts(prevPosts => [post, ...prevPosts]);
  };

  /**
   * Like a post by incrementing its like count
   * @param {number | string} postId - The ID of the post to like
   */
  const likePost = (postId: number | string): void => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    );
  };

  /**
   * Retweet a post by incrementing its retweet count
   * @param {number | string} postId - The ID of the post to retweet
   */
  const retweetPost = (postId: number | string): void => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, retweets: post.retweets + 1 }
          : post
      )
    );
  };

  const value: PostsContextType = {
    posts,
    addPost,
    likePost,
    retweetPost
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
};
