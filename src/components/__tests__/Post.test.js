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
    test('formats "now" for timestamps less than 1 minute ago', () => {
      const nowPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
      };

      render(<Post post={nowPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('formats minutes correctly for timestamps between 1-59 minutes ago', () => {
      const minutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };

      render(<Post post={minutesPost} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('formats days correctly for timestamps more than 24 hours ago', () => {
      const daysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };

      render(<Post post={daysPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('formats edge case: exactly 1 minute ago', () => {
      const oneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };

      render(<Post post={oneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('formats edge case: exactly 24 hours ago', () => {
      const oneDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 24 hours ago
      };

      render(<Post post={oneDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    test('reply button renders correctly but has no click handler', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      
      fireEvent.click(replyButton);
      expect(replyButton).toBeInTheDocument();
    });

    test('share button renders correctly but has no click handler', () => {
      render(<Post post={mockPost} />);
      
      const actionButtons = screen.getAllByRole('button');
      const shareButton = actionButtons[actionButtons.length - 1];
      expect(shareButton).toBeInTheDocument();
      
      fireEvent.click(shareButton);
      expect(shareButton).toBeInTheDocument();
    });

    test('like button has correct hover classes', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      expect(likeButton).toHaveClass('hover:text-red-500');
      expect(likeButton).toHaveClass('transition-colors');
    });

    test('retweet button has correct hover classes', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      expect(retweetButton).toHaveClass('hover:text-green-500');
      expect(retweetButton).toHaveClass('transition-colors');
    });
  });

  describe('Error handling and edge cases', () => {
    test('handles missing author data gracefully', () => {
      const postWithMissingAuthor = {
        ...mockPost,
        author: {
          name: undefined,
          username: undefined
        }
      };

      render(<Post post={postWithMissingAuthor} />);
      
      // Should still render without crashing
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles missing interaction counts gracefully', () => {
      const postWithMissingCounts = {
        ...mockPost,
        likes: undefined,
        retweets: undefined,
        replies: undefined
      };

      render(<Post post={postWithMissingCounts} />);
      
      // Should still render the post content
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles invalid timestamp gracefully', () => {
      const postWithInvalidTimestamp = {
        ...mockPost,
        timestamp: new Date('invalid-date')
      };

      render(<Post post={postWithInvalidTimestamp} />);
      
      // Should still render without crashing
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles null timestamp gracefully', () => {
      const postWithNullTimestamp = {
        ...mockPost,
        timestamp: null
      };

      render(<Post post={postWithNullTimestamp} />);
      
      // Should still render without crashing
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles empty content gracefully', () => {
      const postWithEmptyContent = {
        ...mockPost,
        content: ''
      };

      render(<Post post={postWithEmptyContent} />);
      
      // Should still render the author information
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
      
      expect(screen.getAllByText('0')).toHaveLength(3); // likes, retweets, replies
    });
  });

  describe('Component structure and styling', () => {
    test('applies correct CSS classes to main container', () => {
      const { container } = render(<Post post={mockPost} />);
      
      const postContainer = container.firstChild;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4', 'hover:bg-gray-50', 'transition-colors', 'w-full');
    });

    test('renders author name with correct styling', () => {
      render(<Post post={mockPost} />);
      
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toHaveClass('font-display', 'font-bold', 'text-gray-900', 'hover:underline', 'cursor-pointer');
    });

    test('renders username with correct styling', () => {
      render(<Post post={mockPost} />);
      
      const username = screen.getByText('@testuser');
      expect(username).toHaveClass('text-gray-500', 'font-mono');
    });

    test('renders post content with correct styling', () => {
      render(<Post post={mockPost} />);
      
      const content = screen.getByText('This is a test post content');
      expect(content).toHaveClass('mt-1', 'text-gray-900', 'text-base', 'leading-relaxed', 'text-body');
    });
  });
});
