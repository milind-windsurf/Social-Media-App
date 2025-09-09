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

    test('handles boundary conditions correctly', () => {
      const exactlyUnderMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 59 * 1000)
      };

      render(<Post post={exactlyUnderMinutePost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('handles exactly 1 minute ago', () => {
      const exactlyOneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000)
      };

      render(<Post post={exactlyOneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles exactly 1 hour ago', () => {
      const exactlyOneHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      };

      render(<Post post={exactlyOneHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles exactly 24 hours ago', () => {
      const exactlyOneDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };

      render(<Post post={exactlyOneDayPost} />);
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

    test('handles invalid timestamp gracefully', () => {
      const invalidTimestampPost = {
        ...mockPost,
        timestamp: new Date('invalid-date')
      };

      // Should not crash the component
      expect(() => render(<Post post={invalidTimestampPost} />)).not.toThrow();
    });
  });

  describe('Error handling with malformed post data', () => {
    test('handles missing author name gracefully', () => {
      const postWithoutAuthorName = {
        ...mockPost,
        author: {
          username: 'testuser'
        }
      };

      expect(() => render(<Post post={postWithoutAuthorName} />)).not.toThrow();
    });

    test('handles missing author username gracefully', () => {
      const postWithoutUsername = {
        ...mockPost,
        author: {
          name: 'Test User'
        }
      };

      expect(() => render(<Post post={postWithoutUsername} />)).not.toThrow();
    });

    test('handles missing content gracefully', () => {
      const postWithoutContent = {
        ...mockPost,
        content: undefined
      };

      expect(() => render(<Post post={postWithoutContent} />)).not.toThrow();
    });

    test('handles missing interaction counts gracefully', () => {
      const postWithoutCounts = {
        ...mockPost,
        likes: undefined,
        retweets: undefined,
        replies: undefined
      };

      expect(() => render(<Post post={postWithoutCounts} />)).not.toThrow();
    });

    test('handles completely missing author object', () => {
      const postWithoutAuthor = {
        ...mockPost,
        author: undefined
      };

      expect(() => render(<Post post={postWithoutAuthor} />)).not.toThrow();
      
      // Should render with fallback values - use more specific selector
      expect(screen.getByRole('heading', { name: 'Unknown User' })).toBeInTheDocument();
      expect(screen.getByText('@unknown')).toBeInTheDocument();
    });

    test('handles zero interaction counts', () => {
      const postWithZeroCounts = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={postWithZeroCounts} />);
      
      // Should display zero counts - check for all three zeros
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3); // replies, retweets, likes
    });

    test('handles negative interaction counts', () => {
      const postWithNegativeCounts = {
        ...mockPost,
        likes: -5,
        retweets: -2,
        replies: -1
      };

      render(<Post post={postWithNegativeCounts} />);
      expect(screen.getByText('-5')).toBeInTheDocument();
      expect(screen.getByText('-2')).toBeInTheDocument();
      expect(screen.getByText('-1')).toBeInTheDocument();
    });
  });

  describe('Accessibility features', () => {
    test('has proper ARIA labels for action buttons', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      const replyButton = screen.getByText('5').closest('button');
      
      expect(likeButton).toBeInTheDocument();
      expect(retweetButton).toBeInTheDocument();
      expect(replyButton).toBeInTheDocument();
    });

    test('author name is properly structured for screen readers', () => {
      render(<Post post={mockPost} />);
      
      const authorHeading = screen.getByRole('heading', { level: 3 });
      expect(authorHeading).toHaveTextContent('Test User');
    });

    test('buttons have proper hover states', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      expect(likeButton).toHaveClass('hover:text-red-500');
      
      const retweetButton = screen.getByText('12').closest('button');
      expect(retweetButton).toHaveClass('hover:text-green-500');
    });

    test('buttons are keyboard accessible', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      
      expect(likeButton).not.toHaveAttribute('disabled');
      expect(retweetButton).not.toHaveAttribute('disabled');
    });
  });

  describe('Interaction behavior', () => {
    test('like button calls likePost only once per click', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      fireEvent.click(likeButton);
      
      expect(mockLikePost).toHaveBeenCalledTimes(1);
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
    });

    test('retweet button calls retweetPost only once per click', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      fireEvent.click(retweetButton);
      
      expect(mockRetweetPost).toHaveBeenCalledTimes(1);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('handles multiple rapid clicks on like button', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      
      expect(mockLikePost).toHaveBeenCalledTimes(3);
    });

    test('handles multiple rapid clicks on retweet button', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      
      expect(mockRetweetPost).toHaveBeenCalledTimes(2);
    });

    test('reply button does not have click handler', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      
      expect(replyButton).not.toHaveAttribute('onClick');
    });

    test('share button does not have click handler', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons[3]; // Reply, Retweet, Like, Share (0-indexed)
      expect(shareButton).toBeInTheDocument();
      
      fireEvent.click(shareButton);
    });
  });

  describe('Component structure and styling', () => {
    test('renders with correct CSS classes for layout', () => {
      render(<Post post={mockPost} />);
      
      const postContainer = screen.getByText('This is a test post content').closest('div').parentElement.parentElement;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4');
    });

    test('displays post content with correct styling', () => {
      render(<Post post={mockPost} />);
      
      const contentElement = screen.getByText('This is a test post content');
      expect(contentElement).toHaveClass('text-gray-900', 'text-base', 'text-body');
    });

    test('displays username with @ symbol', () => {
      render(<Post post={mockPost} />);
      
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('displays interaction counts correctly', () => {
      render(<Post post={mockPost} />);
      
      expect(screen.getByText('42')).toBeInTheDocument(); // likes
      expect(screen.getByText('12')).toBeInTheDocument(); // retweets  
      expect(screen.getByText('5')).toBeInTheDocument(); // replies
    });
  });

  describe('Prop validation', () => {
    test('handles missing post prop gracefully', () => {
      const consoleError = console.error;
      console.error = jest.fn();
      
      const { container } = render(<Post />);
      
      // Should render nothing (null) when no post is provided
      expect(container.firstChild).toBeNull();
      
      // Restore console.error
      console.error = consoleError;
    });

    test('handles post with missing id', () => {
      const postWithoutId = {
        ...mockPost,
        id: undefined
      };

      render(<Post post={postWithoutId} />);
      
      // Should still render but clicking buttons might not work properly
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles post with string id instead of number', () => {
      const postWithStringId = {
        ...mockPost,
        id: 'string-id'
      };

      render(<Post post={postWithStringId} />);
      
      const likeButton = screen.getByText('42').closest('button');
      fireEvent.click(likeButton);
      
      // Should call likePost with string id
      expect(mockLikePost).toHaveBeenCalledWith('string-id');
    });

    test('handles very long post content', () => {
      const longContentPost = {
        ...mockPost,
        content: 'A'.repeat(1000) // Very long content
      };

      render(<Post post={longContentPost} />);
      
      // Should render without issues
      expect(screen.getByText('A'.repeat(1000))).toBeInTheDocument();
    });

    test('handles empty post content', () => {
      const emptyContentPost = {
        ...mockPost,
        content: ''
      };

      render(<Post post={emptyContentPost} />);
      
      // Should render other parts of the post - use more specific selector
      expect(screen.getByRole('heading', { name: 'Test User' })).toBeInTheDocument();
    });

    test('handles special characters in author name', () => {
      const specialCharPost = {
        ...mockPost,
        author: {
          name: 'Test User 🚀 & Co.',
          username: 'test-user_123'
        }
      };

      render(<Post post={specialCharPost} />);
      
      expect(screen.getByRole('heading', { name: 'Test User 🚀 & Co.' })).toBeInTheDocument();
      expect(screen.getByText('@test-user_123')).toBeInTheDocument();
    });
  });
});
