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
    test('shows "now" for posts less than 1 minute old', () => {
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
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };

      render(<Post post={minutesAgoPost} />);
      
      expect(screen.getByText('30m')).toBeInTheDocument();
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
      const exactlyOneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };

      render(<Post post={exactlyOneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles very old posts correctly', () => {
      const veryOldPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 365 days ago
      };

      render(<Post post={veryOldPost} />);
      
      expect(screen.getByText('365d')).toBeInTheDocument();
    });

    test('handles future timestamps gracefully', () => {
      const futurePost = {
        ...mockPost,
        timestamp: new Date(Date.now() + 60 * 60 * 1000) // 1 hour in the future
      };

      render(<Post post={futurePost} />);
      
      // Should show "now" for future timestamps (negative diff results in 0 minutes)
      expect(screen.getByText('now')).toBeInTheDocument();
    });
  });

  describe('error handling and prop validation', () => {
    test('handles missing post prop gracefully', () => {
      const consoleError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<Post />);
      }).toThrow();

      console.error = consoleError;
    });

    test('handles post with missing author data', () => {
      const postWithoutAuthor = {
        ...mockPost,
        author: undefined
      };

      const consoleError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<Post post={postWithoutAuthor} />);
      }).toThrow();

      console.error = consoleError;
    });

    test('handles post with missing content', () => {
      const postWithoutContent = {
        ...mockPost,
        content: undefined
      };

      render(<Post post={postWithoutContent} />);
      
      // Should render author name in heading
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test User');
    });

    test('handles post with zero interaction counts', () => {
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

    test('handles invalid timestamp gracefully', () => {
      const postWithInvalidTimestamp = {
        ...mockPost,
        timestamp: 'invalid-date'
      };

      render(<Post post={postWithInvalidTimestamp} />);
      
      // Should render with NaN result showing as "NaNd" or similar
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test User');
    });
  });

  describe('interaction edge cases', () => {
    test('handles multiple rapid clicks on like button', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      
      // Should call likePost function 3 times
      expect(mockLikePost).toHaveBeenCalledTimes(3);
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
    });

    test('handles multiple rapid clicks on retweet button', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      
      // Should call retweetPost function 3 times
      expect(mockRetweetPost).toHaveBeenCalledTimes(3);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('reply button exists but does not have click handler', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      
      fireEvent.click(replyButton);
      
      // Should not call any context functions
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });

    test('share button exists but does not have click handler', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons[buttons.length - 1];
      
      fireEvent.click(shareButton);
      
      // Should not call any context functions
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });
  });

  describe('accessibility and UI elements', () => {
    test('renders all required UI elements', () => {
      render(<Post post={mockPost} />);
      
      // Check for author name in heading
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test User');
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
      
      // Check for interaction counts
      expect(screen.getByText('42')).toBeInTheDocument(); // likes
      expect(screen.getByText('12')).toBeInTheDocument(); // retweets
      expect(screen.getByText('5')).toBeInTheDocument(); // replies
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4); // reply, retweet, like, share
    });

    test('applies correct CSS classes for styling', () => {
      render(<Post post={mockPost} />);
      
      const postContainer = document.querySelector('.border-b.border-gray-200.px-6.py-4');
      expect(postContainer).toBeInTheDocument();
      
      // Check author name styling - find the h3 element specifically
      const authorName = screen.getByRole('heading', { level: 3 });
      expect(authorName).toHaveClass('font-display', 'font-bold', 'text-gray-900');
      
      const usernameElement = screen.getByText((content, element) => {
        return content.includes('@testuser') && element.classList.contains('font-mono');
      });
      expect(usernameElement).toHaveClass('text-gray-500', 'font-mono');
    });

    test('renders with long content correctly', () => {
      const postWithLongContent = {
        ...mockPost,
        content: 'This is a very long post content that should wrap properly and not break the layout. '.repeat(10)
      };

      render(<Post post={postWithLongContent} />);
      
      expect(screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'p' && 
               content.includes('This is a very long post content');
      })).toBeInTheDocument();
    });

    test('renders with special characters in content', () => {
      const postWithSpecialChars = {
        ...mockPost,
        content: 'Post with émojis 🚀 and special chars: @#$%^&*()!'
      };

      render(<Post post={postWithSpecialChars} />);
      
      expect(screen.getByText(postWithSpecialChars.content)).toBeInTheDocument();
    });
  });
});
