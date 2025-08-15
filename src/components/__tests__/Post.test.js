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
    test('formats timestamp correctly for hours', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      };

      render(<Post post={recentPost} />);
      
      const timeElements = screen.getAllByText(/\d+h/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    test('shows "now" for very recent posts', () => {
      const veryRecentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
      };

      render(<Post post={veryRecentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('formats minutes correctly', () => {
      const minutesAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };

      render(<Post post={minutesAgoPost} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('formats days correctly', () => {
      const daysAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      };

      render(<Post post={daysAgoPost} />);
      expect(screen.getByText('2d')).toBeInTheDocument();
    });

    test('handles exactly 1 minute', () => {
      const oneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };

      render(<Post post={oneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles exactly 24 hours (should show days)', () => {
      const oneDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 24 hours ago
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
  });

  describe('error handling and edge cases', () => {
    test('handles missing author gracefully', () => {
      const postWithoutAuthor = {
        ...mockPost,
        author: null
      };

      expect(() => render(<Post post={postWithoutAuthor} />)).toThrow();
    });

    test('handles missing author name', () => {
      const postWithoutAuthorName = {
        ...mockPost,
        author: {
          username: 'testuser'
        }
      };

      render(<Post post={postWithoutAuthorName} />);
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('handles missing content', () => {
      const postWithoutContent = {
        ...mockPost,
        content: null
      };

      expect(() => render(<Post post={postWithoutContent} />)).not.toThrow();
    });

    test('handles zero interaction counts', () => {
      const postWithZeroCounts = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={postWithZeroCounts} />);
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3); // replies, retweets, likes
    });

    test('handles missing interaction counts', () => {
      const postWithoutCounts = {
        ...mockPost,
        likes: undefined,
        retweets: undefined,
        replies: undefined
      };

      expect(() => render(<Post post={postWithoutCounts} />)).not.toThrow();
    });

    test('handles invalid timestamp', () => {
      const postWithInvalidTimestamp = {
        ...mockPost,
        timestamp: 'invalid-date'
      };

      expect(() => render(<Post post={postWithInvalidTimestamp} />)).not.toThrow();
    });
  });

  describe('accessibility and interactions', () => {
    test('reply button is accessible', () => {
      render(<Post post={mockPost} />);
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      expect(replyButton).toHaveClass('flex', 'items-center');
    });

    test('share button is accessible', () => {
      render(<Post post={mockPost} />);
      const shareButtons = screen.getAllByRole('button');
      const shareButton = shareButtons[shareButtons.length - 1];
      expect(shareButton).toBeInTheDocument();
      expect(shareButton).toHaveClass('flex', 'items-center');
    });

    test('like button has correct hover styles', () => {
      render(<Post post={mockPost} />);
      const likeButton = screen.getByText('42').closest('button');
      expect(likeButton).toHaveClass('hover:text-red-500');
    });

    test('retweet button has correct hover styles', () => {
      render(<Post post={mockPost} />);
      const retweetButton = screen.getByText('12').closest('button');
      expect(retweetButton).toHaveClass('hover:text-green-500');
    });
  });
});
