import { renderHook, act } from '@testing-library/react';
import { PostsProvider, usePosts } from './PostsContext';
import { ReactNode } from 'react';

describe('PostsContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <PostsProvider>{children}</PostsProvider>
  );

  describe('usePosts hook', () => {
    it('should throw error when used outside PostsProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => usePosts());
      }).toThrow('usePosts must be used within a PostsProvider');
      
      consoleError.mockRestore();
    });

    it('should provide posts context when used within PostsProvider', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      expect(result.current).toBeDefined();
      expect(result.current.posts).toBeDefined();
      expect(result.current.addPost).toBeDefined();
      expect(result.current.likePost).toBeDefined();
      expect(result.current.retweetPost).toBeDefined();
    });
  });

  describe('PostsProvider', () => {
    it('should initialize with default posts', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      expect(result.current.posts).toHaveLength(20);
      expect(result.current.posts[0]).toHaveProperty('id');
      expect(result.current.posts[0]).toHaveProperty('author');
      expect(result.current.posts[0]).toHaveProperty('content');
      expect(result.current.posts[0]).toHaveProperty('timestamp');
      expect(result.current.posts[0]).toHaveProperty('likes');
      expect(result.current.posts[0]).toHaveProperty('retweets');
      expect(result.current.posts[0]).toHaveProperty('replies');
    });

    it('should have correct structure for post author', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const firstPost = result.current.posts[0];
      expect(firstPost.author).toHaveProperty('name');
      expect(firstPost.author).toHaveProperty('username');
      expect(typeof firstPost.author.name).toBe('string');
      expect(typeof firstPost.author.username).toBe('string');
    });
  });

  describe('addPost', () => {
    it('should add a new post to the beginning of the posts array', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      const initialLength = result.current.posts.length;
      
      const newPost = {
        author: {
          name: 'Test User',
          username: 'testuser'
        },
        content: 'This is a test post'
      };
      
      act(() => {
        result.current.addPost(newPost);
      });
      
      expect(result.current.posts).toHaveLength(initialLength + 1);
      expect(result.current.posts[0].content).toBe('This is a test post');
      expect(result.current.posts[0].author.name).toBe('Test User');
      expect(result.current.posts[0].author.username).toBe('testuser');
    });

    it('should initialize new post with default values', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const newPost = {
        author: {
          name: 'Test User',
          username: 'testuser'
        },
        content: 'Test content'
      };
      
      act(() => {
        result.current.addPost(newPost);
      });
      
      const addedPost = result.current.posts[0];
      expect(addedPost.likes).toBe(0);
      expect(addedPost.retweets).toBe(0);
      expect(addedPost.replies).toBe(0);
      expect(addedPost.id).toBeDefined();
      expect(addedPost.timestamp).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for new posts', async () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const newPost1 = {
        author: { name: 'User 1', username: 'user1' },
        content: 'Post 1'
      };
      
      const newPost2 = {
        author: { name: 'User 2', username: 'user2' },
        content: 'Post 2'
      };
      
      act(() => {
        result.current.addPost(newPost1);
      });
      
      const firstId = result.current.posts[0].id;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      act(() => {
        result.current.addPost(newPost2);
      });
      
      const secondId = result.current.posts[0].id;
      
      expect(firstId).not.toBe(secondId);
    });
  });

  describe('likePost', () => {
    it('should increment likes count for the specified post', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const postId = result.current.posts[0].id;
      const initialLikes = result.current.posts[0].likes;
      
      act(() => {
        result.current.likePost(postId);
      });
      
      expect(result.current.posts[0].likes).toBe(initialLikes + 1);
    });

    it('should only affect the specified post', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const postId = result.current.posts[0].id;
      const secondPostLikes = result.current.posts[1].likes;
      
      act(() => {
        result.current.likePost(postId);
      });
      
      expect(result.current.posts[1].likes).toBe(secondPostLikes);
    });

    it('should handle multiple likes on the same post', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const postId = result.current.posts[0].id;
      const initialLikes = result.current.posts[0].likes;
      
      act(() => {
        result.current.likePost(postId);
        result.current.likePost(postId);
        result.current.likePost(postId);
      });
      
      expect(result.current.posts[0].likes).toBe(initialLikes + 3);
    });

    it('should not affect post if ID does not exist', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const nonExistentId = 999999;
      const allPostsLikes = result.current.posts.map(p => p.likes);
      
      act(() => {
        result.current.likePost(nonExistentId);
      });
      
      const newPostsLikes = result.current.posts.map(p => p.likes);
      expect(newPostsLikes).toEqual(allPostsLikes);
    });
  });

  describe('retweetPost', () => {
    it('should increment retweets count for the specified post', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const postId = result.current.posts[0].id;
      const initialRetweets = result.current.posts[0].retweets;
      
      act(() => {
        result.current.retweetPost(postId);
      });
      
      expect(result.current.posts[0].retweets).toBe(initialRetweets + 1);
    });

    it('should only affect the specified post', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const postId = result.current.posts[0].id;
      const secondPostRetweets = result.current.posts[1].retweets;
      
      act(() => {
        result.current.retweetPost(postId);
      });
      
      expect(result.current.posts[1].retweets).toBe(secondPostRetweets);
    });

    it('should handle multiple retweets on the same post', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const postId = result.current.posts[0].id;
      const initialRetweets = result.current.posts[0].retweets;
      
      act(() => {
        result.current.retweetPost(postId);
        result.current.retweetPost(postId);
      });
      
      expect(result.current.posts[0].retweets).toBe(initialRetweets + 2);
    });

    it('should not affect post if ID does not exist', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const nonExistentId = 999999;
      const allPostsRetweets = result.current.posts.map(p => p.retweets);
      
      act(() => {
        result.current.retweetPost(nonExistentId);
      });
      
      const newPostsRetweets = result.current.posts.map(p => p.retweets);
      expect(newPostsRetweets).toEqual(allPostsRetweets);
    });
  });

  describe('integration tests', () => {
    it('should handle adding post and then liking it', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const newPost = {
        author: { name: 'Test User', username: 'testuser' },
        content: 'Test post'
      };
      
      act(() => {
        result.current.addPost(newPost);
      });
      
      const newPostId = result.current.posts[0].id;
      
      act(() => {
        result.current.likePost(newPostId);
      });
      
      expect(result.current.posts[0].likes).toBe(1);
    });

    it('should handle adding post and then retweeting it', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const newPost = {
        author: { name: 'Test User', username: 'testuser' },
        content: 'Test post'
      };
      
      act(() => {
        result.current.addPost(newPost);
      });
      
      const newPostId = result.current.posts[0].id;
      
      act(() => {
        result.current.retweetPost(newPostId);
      });
      
      expect(result.current.posts[0].retweets).toBe(1);
    });

    it('should handle liking and retweeting the same post', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });
      
      const postId = result.current.posts[0].id;
      const initialLikes = result.current.posts[0].likes;
      const initialRetweets = result.current.posts[0].retweets;
      
      act(() => {
        result.current.likePost(postId);
        result.current.retweetPost(postId);
      });
      
      expect(result.current.posts[0].likes).toBe(initialLikes + 1);
      expect(result.current.posts[0].retweets).toBe(initialRetweets + 1);
    });
  });
});
