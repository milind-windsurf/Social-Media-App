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
    test('returns "now" for timestamps less than 1 minute ago', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };
      render(<Post post={recentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('formats minutes correctly for timestamps less than 1 hour', () => {
      const minutesAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      };
      render(<Post post={minutesAgoPost} />);
      expect(screen.getByText('45m')).toBeInTheDocument();
    });

    test('formats hours correctly for timestamps less than 24 hours', () => {
      const hoursAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      };
      render(<Post post={hoursAgoPost} />);
      expect(screen.getByText('5h')).toBeInTheDocument();
    });

    test('formats days correctly for timestamps more than 24 hours', () => {
      const daysAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };
      render(<Post post={daysAgoPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('handles edge case of exactly 1 minute ago', () => {
      const oneMinuteAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };
      render(<Post post={oneMinuteAgoPost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles edge case of exactly 1 hour ago', () => {
      const oneHourAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // exactly 1 hour ago
      };
      render(<Post post={oneHourAgoPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles edge case of exactly 24 hours ago', () => {
      const oneDayAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 24 hours ago
      };
      render(<Post post={oneDayAgoPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });
  });

  describe('Post Component Edge Cases', () => {
    test('handles missing author data gracefully', () => {
      const postWithMissingAuthor = {
        ...mockPost,
        author: { name: '', username: '' }
      };
      render(<Post post={postWithMissingAuthor} />);
      expect(screen.getByText('@')).toBeInTheDocument();
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
      expect(zeroElements).toHaveLength(3);
    });

    test('handles very large interaction counts', () => {
      const postWithLargeCounts = {
        ...mockPost,
        likes: 999999,
        retweets: 888888,
        replies: 777777
      };
      render(<Post post={postWithLargeCounts} />);
      expect(screen.getByText('999999')).toBeInTheDocument();
      expect(screen.getByText('888888')).toBeInTheDocument();
      expect(screen.getByText('777777')).toBeInTheDocument();
    });

    test('handles empty post content', () => {
      const postWithEmptyContent = {
        ...mockPost,
        content: ''
      };
      render(<Post post={postWithEmptyContent} />);
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
    });

    test('handles very long post content', () => {
      const longContent = 'This is a very long post content that goes on and on and on to test how the component handles extremely long text content that might wrap multiple lines and potentially cause layout issues if not handled properly.';
      const postWithLongContent = {
        ...mockPost,
        content: longContent
      };
      render(<Post post={postWithLongContent} />);
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    test('handles special characters in author name and username', () => {
      const postWithSpecialChars = {
        ...mockPost,
        author: {
          name: 'Test User-O\'Connor',
          username: 'test_user.123'
        }
      };
      render(<Post post={postWithSpecialChars} />);
      expect(screen.getByText((content, element) => {
        return content === 'Test User-O\'Connor' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      expect(screen.getByText('@test_user.123')).toBeInTheDocument();
    });
  });
});
