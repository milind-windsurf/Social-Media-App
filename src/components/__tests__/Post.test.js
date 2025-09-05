import { render, screen, fireEvent } from '@testing-library/react';
import { Post } from '../Post';
import { usePosts } from '@/context/PostsContext';

// Mock the dependencies
jest.mock('@/context/PostsContext');
jest.mock('../Avatar', () => ({
  Avatar: ({ name }) => <div data-testid="avatar-mock">{name}</div>
}));

describe('Post Component', () => {
  // Sample post data for testing
  const mockPost = {
    id: 1,
    author: {
      name: 'Test User',
      username: 'testuser'
    },
    content: 'This is a test post content',
    timestamp: new Date('2024-01-15T10:30:00'),
    likes: 42,
    retweets: 12,
    replies: 5
  };

  // Mock context functions
  const mockLikePost = jest.fn();
  const mockRetweetPost = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementation
    usePosts.mockReturnValue({
      likePost: mockLikePost,
      retweetPost: mockRetweetPost
    });
  });

  test('renders post content correctly', () => {
    render(<Post post={mockPost} />);
    
    // Check author information - using a more specific query to avoid duplicate elements
    expect(screen.getByText((content, element) => {
      return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
    })).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    
    // Check post content
    expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    
    // Check interaction counts
    expect(screen.getByText('42')).toBeInTheDocument(); // likes
    expect(screen.getByText('12')).toBeInTheDocument(); // retweets
    expect(screen.getByText('5')).toBeInTheDocument(); // replies
  });

  test('renders avatar with correct name', () => {
    render(<Post post={mockPost} />);
    expect(screen.getByTestId('avatar-mock')).toHaveTextContent('Test User');
  });

  test('calls likePost when like button is clicked', () => {
    render(<Post post={mockPost} />);
    
    // Find like button by its SVG path description and click it
    const likeButton = screen.getByText('42').closest('button');
    fireEvent.click(likeButton);
    
    // Check if the likePost function was called with the correct post ID
    expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
    expect(mockLikePost).toHaveBeenCalledTimes(1);
  });

  test('calls retweetPost when retweet button is clicked', () => {
    render(<Post post={mockPost} />);
    
    // Find retweet button by its SVG path description and click it
    const retweetButton = screen.getByText('12').closest('button');
    fireEvent.click(retweetButton);
    
    // Check if the retweetPost function was called with the correct post ID
    expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    expect(mockRetweetPost).toHaveBeenCalledTimes(1);
  });

  describe('formatTime function', () => {
    test('shows "now" for timestamps less than 1 minute ago', () => {
      const nowPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
      };

      render(<Post post={nowPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('shows minutes for timestamps between 1-59 minutes ago', () => {
      const minutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };

      render(<Post post={minutesPost} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('shows hours for timestamps between 1-23 hours ago', () => {
      const hoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      };

      render(<Post post={hoursPost} />);
      expect(screen.getByText('5h')).toBeInTheDocument();
    });

    test('shows days for timestamps 24+ hours ago', () => {
      const daysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };

      render(<Post post={daysPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('handles boundary conditions correctly - 1 minute', () => {
      const oneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000)
      };
      render(<Post post={oneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles boundary conditions correctly - 1 hour', () => {
      const oneHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      };
      render(<Post post={oneHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles boundary conditions correctly - 1 day', () => {
      const oneDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };
      render(<Post post={oneDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('handles future timestamps gracefully', () => {
      const futurePost = {
        ...mockPost,
        timestamp: new Date(Date.now() + 60 * 60 * 1000) // 1 hour in future
      };

      render(<Post post={futurePost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('handles invalid date objects', () => {
      const invalidDatePost = {
        ...mockPost,
        timestamp: new Date('invalid-date')
      };

      render(<Post post={invalidDatePost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('handles very large time differences', () => {
      const veryOldPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      };

      render(<Post post={veryOldPost} />);
      expect(screen.getByText('365d')).toBeInTheDocument();
    });
  });

  describe('error handling and edge cases', () => {
    test('handles missing author information gracefully', () => {
      const postWithoutAuthor = {
        ...mockPost,
        author: null
      };

      expect(() => render(<Post post={postWithoutAuthor} />)).not.toThrow();
    });

    test('handles missing timestamp gracefully', () => {
      const postWithoutTimestamp = {
        ...mockPost,
        timestamp: null
      };

      expect(() => render(<Post post={postWithoutTimestamp} />)).not.toThrow();
    });

    test('handles missing content gracefully', () => {
      const postWithoutContent = {
        ...mockPost,
        content: null
      };

      expect(() => render(<Post post={postWithoutContent} />)).not.toThrow();
    });

    test('handles missing interaction counts gracefully', () => {
      const postWithoutCounts = {
        ...mockPost,
        likes: null,
        retweets: null,
        replies: null
      };

      expect(() => render(<Post post={postWithoutCounts} />)).not.toThrow();
    });

    test('handles undefined post prop', () => {
      expect(() => render(<Post post={undefined} />)).not.toThrow();
    });

    test('handles empty post object', () => {
      const emptyPost = {};
      expect(() => render(<Post post={emptyPost} />)).not.toThrow();
    });
  });

  describe('accessibility and interactions', () => {
    test('like button exists and is clickable', () => {
      render(<Post post={mockPost} />);
      const likeButton = screen.getByText('42').closest('button');
      
      expect(likeButton).toBeInTheDocument();
      expect(likeButton).toHaveClass('flex');
      expect(likeButton).toHaveClass('items-center');
    });

    test('retweet button exists and is clickable', () => {
      render(<Post post={mockPost} />);
      const retweetButton = screen.getByText('12').closest('button');
      
      expect(retweetButton).toBeInTheDocument();
      expect(retweetButton).toHaveClass('flex');
      expect(retweetButton).toHaveClass('items-center');
    });

    test('reply button exists and is clickable', () => {
      render(<Post post={mockPost} />);
      const replyButton = screen.getByText('5').closest('button');
      
      expect(replyButton).toBeInTheDocument();
      expect(replyButton).toHaveClass('flex');
      expect(replyButton).toHaveClass('items-center');
    });

    test('share button exists and is clickable', () => {
      render(<Post post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      
      expect(buttons.length).toBe(4); // reply, retweet, like, share
    });

    test('author name is clickable', () => {
      render(<Post post={mockPost} />);
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      
      expect(authorName).toHaveClass('cursor-pointer');
      expect(authorName).toHaveClass('hover:underline');
    });

    test('post content is properly displayed', () => {
      render(<Post post={mockPost} />);
      const postContent = screen.getByText('This is a test post content');
      
      expect(postContent).toHaveClass('text-body');
      expect(postContent).toHaveClass('leading-relaxed');
    });

    test('interaction counts are properly formatted', () => {
      render(<Post post={mockPost} />);
      
      expect(screen.getByText('42')).toHaveClass('text-accent');
      expect(screen.getByText('12')).toHaveClass('text-accent');
      expect(screen.getByText('5')).toHaveClass('text-accent');
    });
  });

  describe('component integration', () => {
    test('calls context functions with correct parameters multiple times', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(retweetButton);
      
      expect(mockLikePost).toHaveBeenCalledTimes(2);
      expect(mockRetweetPost).toHaveBeenCalledTimes(1);
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('renders with different post data structures', () => {
      const differentPost = {
        id: 999,
        author: {
          name: 'Different User',
          username: 'different'
        },
        content: 'Different content with special characters: @mention #hashtag https://example.com',
        timestamp: new Date('2023-12-01T15:30:00'),
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={differentPost} />);
      
      expect(screen.getByText((content, element) => {
        return content === 'Different User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      expect(screen.getByText('@different')).toBeInTheDocument();
      expect(screen.getByText(/Different content with special characters/)).toBeInTheDocument();
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });

    test('maintains proper component structure', () => {
      render(<Post post={mockPost} />);
      
      const postContainer = screen.getByText('This is a test post content').closest('div').parentElement.parentElement;
      expect(postContainer).toHaveClass('border-b');
      expect(postContainer).toHaveClass('hover:bg-gray-50');
      expect(postContainer).toHaveClass('transition-colors');
    });
  });
});
