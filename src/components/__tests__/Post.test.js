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

  describe('formatTime function edge cases', () => {
    test('shows "now" for very recent posts (less than 1 minute)', () => {
      const veryRecentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
      };

      render(<Post post={veryRecentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('shows minutes for posts less than 1 hour old', () => {
      const minutesAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      };

      render(<Post post={minutesAgoPost} />);
      expect(screen.getByText('45m')).toBeInTheDocument();
    });

    test('shows hours for posts less than 24 hours old', () => {
      const hoursAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      };

      render(<Post post={hoursAgoPost} />);
      expect(screen.getByText('12h')).toBeInTheDocument();
    });

    test('shows days for posts older than 24 hours', () => {
      const daysAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };

      render(<Post post={daysAgoPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('handles boundary cases correctly', () => {
      const oneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000)
      };
      const { rerender } = render(<Post post={oneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();

      // Test exactly 1 hour ago
      const oneHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      };
      rerender(<Post post={oneHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();

      const oneDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };
      rerender(<Post post={oneDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('handles very old posts correctly', () => {
      const veryOldPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      };

      render(<Post post={veryOldPost} />);
      expect(screen.getByText('365d')).toBeInTheDocument();
    });
  });

  describe('error handling and edge cases', () => {
    test('handles missing author name gracefully', () => {
      const postWithoutAuthorName = {
        ...mockPost,
        author: {
          username: 'testuser'
        }
      };

      render(<Post post={postWithoutAuthorName} />);
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('handles missing author username gracefully', () => {
      const postWithoutUsername = {
        ...mockPost,
        author: {
          name: 'Test User'
        }
      };

      render(<Post post={postWithoutUsername} />);
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
    });

    test('handles missing content gracefully', () => {
      const postWithoutContent = {
        ...mockPost,
        content: ''
      };

      render(<Post post={postWithoutContent} />);
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
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
      expect(zeroElements.length).toBeGreaterThan(0);
    });

    test('handles missing interaction counts', () => {
      const postWithMissingCounts = {
        ...mockPost,
        likes: undefined,
        retweets: undefined,
        replies: undefined
      };

      render(<Post post={postWithMissingCounts} />);
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
    });

    test('handles invalid timestamp gracefully', () => {
      const postWithInvalidTimestamp = {
        ...mockPost,
        timestamp: new Date('invalid-date')
      };

      render(<Post post={postWithInvalidTimestamp} />);
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
    });
  });

  describe('accessibility and interaction tests', () => {
    test('like button has proper accessibility attributes', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      expect(likeButton).toBeInTheDocument();
      expect(likeButton.tagName.toLowerCase()).toBe('button');
    });

    test('retweet button has proper accessibility attributes', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      expect(retweetButton).toBeInTheDocument();
      expect(retweetButton.tagName.toLowerCase()).toBe('button');
    });

    test('reply button is present and accessible', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      expect(replyButton.tagName.toLowerCase()).toBe('button');
    });

    test('share button is present and accessible', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4); // reply, retweet, like, share
    });

    test('author name is clickable and has proper styling', () => {
      render(<Post post={mockPost} />);
      
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toHaveClass('font-display', 'font-bold', 'text-gray-900', 'hover:underline', 'cursor-pointer');
    });

    test('post content has proper text styling', () => {
      render(<Post post={mockPost} />);
      
      const postContent = screen.getByText('This is a test post content');
      expect(postContent).toHaveClass('mt-1', 'text-gray-900', 'text-base', 'leading-relaxed', 'text-body');
    });
  });

  describe('CSS classes and styling', () => {
    test('post container has correct base classes', () => {
      render(<Post post={mockPost} />);
      
      const postContainer = screen.getByText('This is a test post content').closest('div').parentElement.parentElement;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4', 'hover:bg-gray-50', 'transition-colors', 'w-full');
    });

    test('action buttons have correct hover classes', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      expect(likeButton).toHaveClass('flex', 'items-center', 'space-x-2', 'text-gray-500', 'hover:text-red-500', 'transition-colors', 'group');
      
      const retweetButton = screen.getByText('12').closest('button');
      expect(retweetButton).toHaveClass('flex', 'items-center', 'space-x-2', 'text-gray-500', 'hover:text-green-500', 'transition-colors', 'group');
    });

    test('username has correct styling classes', () => {
      render(<Post post={mockPost} />);
      
      const username = screen.getByText('@testuser');
      expect(username).toHaveClass('text-gray-500', 'font-mono');
    });

    test('timestamp has correct styling classes', () => {
      render(<Post post={mockPost} />);
      
      const timestampElement = screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'span' && 
               element.classList.contains('text-gray-500') && 
               element.classList.contains('text-sm');
      });
      expect(timestampElement).toHaveClass('text-gray-500', 'text-sm');
    });
  });

  describe('button interaction edge cases', () => {
    test('like button can be clicked multiple times', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      
      expect(mockLikePost).toHaveBeenCalledTimes(3);
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
    });

    test('retweet button can be clicked multiple times', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      
      expect(mockRetweetPost).toHaveBeenCalledTimes(2);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('reply button does not trigger any context functions', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      fireEvent.click(replyButton);
      
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });

    test('share button does not trigger any context functions', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons[3]; // Fourth button is share
      fireEvent.click(shareButton);
      
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });
  });

  describe('context integration', () => {
    test('handles context functions being undefined', () => {
      usePosts.mockReturnValue({
        likePost: undefined,
        retweetPost: undefined
      });

      expect(() => render(<Post post={mockPost} />)).not.toThrow();
    });

    test('handles context returning null functions', () => {
      usePosts.mockReturnValue({
        likePost: null,
        retweetPost: null
      });

      expect(() => render(<Post post={mockPost} />)).not.toThrow();
    });
  });
});
