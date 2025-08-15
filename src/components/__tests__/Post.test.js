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

  test('formats timestamp correctly', () => {
    // Create a post with a timestamp we can control
    const recentPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    };

    render(<Post post={recentPost} />);
    
    // Should show "1h" for a post from 1 hour ago
    const timeElements = screen.getAllByText(/\d+h/); // Match any text with digits followed by 'h'
    expect(timeElements.length).toBeGreaterThan(0);
    
    // Alternative approach: check that the timestamp element exists
    const timestampElement = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'span' && 
             element.classList.contains('text-gray-500') && 
             element.classList.contains('text-sm');
    });
    expect(timestampElement).toBeInTheDocument();
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

    test('returns "now" for current timestamp', () => {
      const currentPost = {
        ...mockPost,
        timestamp: new Date()
      };

      render(<Post post={currentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('returns minutes for timestamps 1-59 minutes ago', () => {
      const fiveMinutesAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60000) // 5 minutes ago
      };

      render(<Post post={fiveMinutesAgo} />);
      expect(screen.getByText('5m')).toBeInTheDocument();
    });

    test('returns minutes for exactly 1 minute ago', () => {
      const oneMinuteAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60000) // 1 minute ago
      };

      render(<Post post={oneMinuteAgo} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('returns minutes for 59 minutes ago', () => {
      const fiftyNineMinutesAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 59 * 60000) // 59 minutes ago
      };

      render(<Post post={fiftyNineMinutesAgo} />);
      expect(screen.getByText('59m')).toBeInTheDocument();
    });

    test('returns hours for timestamps 1-23 hours ago', () => {
      const threeHoursAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 3600000) // 3 hours ago
      };

      render(<Post post={threeHoursAgo} />);
      expect(screen.getByText('3h')).toBeInTheDocument();
    });

    test('returns hours for exactly 1 hour ago', () => {
      const oneHourAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      };

      render(<Post post={oneHourAgo} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('returns hours for 23 hours ago', () => {
      const twentyThreeHoursAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 23 * 3600000) // 23 hours ago
      };

      render(<Post post={twentyThreeHoursAgo} />);
      expect(screen.getByText('23h')).toBeInTheDocument();
    });

    test('returns days for timestamps 24+ hours ago', () => {
      const twoDaysAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 2 * 86400000) // 2 days ago
      };

      render(<Post post={twoDaysAgo} />);
      expect(screen.getByText('2d')).toBeInTheDocument();
    });

    test('returns days for exactly 1 day ago', () => {
      const oneDayAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      };

      render(<Post post={oneDayAgo} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('returns days for very old timestamps', () => {
      const thirtyDaysAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 86400000) // 30 days ago
      };

      render(<Post post={thirtyDaysAgo} />);
      expect(screen.getByText('30d')).toBeInTheDocument();
    });
  });

  describe('UI interactions', () => {
    test('reply button renders correctly', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      expect(replyButton).toHaveClass('text-gray-500', 'hover:text-blue-500');
    });

    test('share button renders correctly', () => {
      render(<Post post={mockPost} />);
      
      const shareButtons = screen.getAllByRole('button');
      const shareButton = shareButtons.find(button => {
        const svg = button.querySelector('svg path[d*="M8.684"]');
        return svg !== null;
      });
      
      expect(shareButton).toBeInTheDocument();
      expect(shareButton).toHaveClass('text-gray-500', 'hover:text-blue-500');
    });

    test('like button has correct styling', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      expect(likeButton).toHaveClass('text-gray-500', 'hover:text-red-500');
    });

    test('retweet button has correct styling', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      expect(retweetButton).toHaveClass('text-gray-500', 'hover:text-green-500');
    });
  });

  describe('edge cases', () => {
    test('handles zero values for interactions', () => {
      const postWithZeros = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={postWithZeros} />);
      
      expect(screen.getAllByText('0')).toHaveLength(3);
    });

    test('handles very large interaction numbers', () => {
      const postWithLargeNumbers = {
        ...mockPost,
        likes: 999999,
        retweets: 888888,
        replies: 777777
      };

      render(<Post post={postWithLargeNumbers} />);
      
      expect(screen.getByText('999999')).toBeInTheDocument();
      expect(screen.getByText('888888')).toBeInTheDocument();
      expect(screen.getByText('777777')).toBeInTheDocument();
    });

    test('handles very long post content', () => {
      const longContent = 'This is a very long post content that goes on and on and on and should still render correctly without breaking the layout or causing any issues with the component rendering process.';
      const postWithLongContent = {
        ...mockPost,
        content: longContent
      };

      render(<Post post={postWithLongContent} />);
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    test('handles empty post content', () => {
      const postWithEmptyContent = {
        ...mockPost,
        content: ''
      };

      render(<Post post={postWithEmptyContent} />);
      
      const contentElement = screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'p' && 
               element.classList.contains('text-gray-900') &&
               content === '';
      });
      expect(contentElement).toBeInTheDocument();
    });

    test('handles special characters in author name and username', () => {
      const postWithSpecialChars = {
        ...mockPost,
        author: {
          name: 'Test User 123 @#$',
          username: 'test_user-123'
        }
      };

      render(<Post post={postWithSpecialChars} />);
      
      expect(screen.getByText((content, element) => {
        return content === 'Test User 123 @#$' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      
      expect(screen.getByText('@test_user-123')).toBeInTheDocument();
    });
  });
});
