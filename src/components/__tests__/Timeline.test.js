import { render, screen } from '@testing-library/react';
import { Timeline } from '../Timeline';
import { usePosts } from '@/context/PostsContext';

// Mock the dependencies
jest.mock('@/context/PostsContext');
jest.mock('../Post', () => ({
  Post: ({ post }) => <div data-testid={`post-${post.id}`}>{post.content}</div>
}));

describe('Timeline Component', () => {
  test('renders the header', () => {
    // Mock the context hook
    usePosts.mockReturnValue({
      posts: [
        {
          id: 1,
          author: { name: 'Test User', username: 'testuser' },
          content: 'Test post content',
          timestamp: new Date(),
          likes: 0,
          retweets: 0,
          replies: 0
        }
      ]
    });

    render(<Timeline />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  test('renders posts from context', () => {
    // Mock the context hook with multiple posts
    usePosts.mockReturnValue({
      posts: [
        {
          id: 1,
          author: { name: 'User 1', username: 'user1' },
          content: 'First post content',
          timestamp: new Date(),
          likes: 5,
          retweets: 2,
          replies: 1
        },
        {
          id: 2,
          author: { name: 'User 2', username: 'user2' },
          content: 'Second post content',
          timestamp: new Date(),
          likes: 10,
          retweets: 3,
          replies: 2
        }
      ]
    });

    render(<Timeline />);
    expect(screen.getByTestId('post-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-2')).toBeInTheDocument();
    expect(screen.getByText('First post content')).toBeInTheDocument();
    expect(screen.getByText('Second post content')).toBeInTheDocument();
  });

  test('displays empty state when no posts', () => {
    // Mock the context hook with empty posts array
    usePosts.mockReturnValue({
      posts: []
    });

    render(<Timeline />);
    expect(screen.getByText('No posts to show yet.')).toBeInTheDocument();
  });
});
