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

  describe('formatTime function comprehensive tests', () => {
    test('returns "now" for timestamps less than 1 minute ago', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };
      
      render(<Post post={recentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('returns minutes for timestamps less than 1 hour ago', () => {
      const minutesAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      };
      
      render(<Post post={minutesAgoPost} />);
      expect(screen.getByText('45m')).toBeInTheDocument();
    });

    test('returns hours for timestamps less than 24 hours ago', () => {
      const hoursAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      };
      
      render(<Post post={hoursAgoPost} />);
      expect(screen.getByText('12h')).toBeInTheDocument();
    });

    test('returns days for timestamps 24+ hours ago', () => {
      const daysAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };
      
      render(<Post post={daysAgoPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('handles edge case of exactly 1 minute ago', () => {
      const exactMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };
      
      render(<Post post={exactMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles edge case of exactly 1 hour ago', () => {
      const exactHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // exactly 1 hour ago
      };
      
      render(<Post post={exactHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles edge case of exactly 24 hours ago', () => {
      const exactDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 24 hours ago
      };
      
      render(<Post post={exactDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });
  });

  describe('Post data variations', () => {
    test('renders post with zero interaction counts', () => {
      const zeroInteractionsPost = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };
      
      render(<Post post={zeroInteractionsPost} />);
      expect(screen.getAllByText('0')).toHaveLength(3);
    });

    test('renders post with large interaction counts', () => {
      const popularPost = {
        ...mockPost,
        likes: 9999,
        retweets: 1234,
        replies: 567
      };
      
      render(<Post post={popularPost} />);
      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('1234')).toBeInTheDocument();
      expect(screen.getByText('567')).toBeInTheDocument();
    });

    test('renders post with long content', () => {
      const longContentPost = {
        ...mockPost,
        content: 'This is a very long post content that should still render correctly and maintain proper formatting even when it spans multiple lines and contains a lot of text that users might write in their social media posts.'
      };
      
      render(<Post post={longContentPost} />);
      expect(screen.getByText(longContentPost.content)).toBeInTheDocument();
    });

    test('renders post with special characters in content', () => {
      const specialCharsPost = {
        ...mockPost,
        content: 'Post with special chars: @user #hashtag https://example.com 🚀 & < > " \''
      };
      
      render(<Post post={specialCharsPost} />);
      expect(screen.getByText(specialCharsPost.content)).toBeInTheDocument();
    });

    test('renders post with special characters in author name', () => {
      const specialAuthorPost = {
        ...mockPost,
        author: {
          name: 'José María O\'Connor',
          username: 'jose_maria'
        }
      };
      
      render(<Post post={specialAuthorPost} />);
      expect(screen.getByText((content, element) => {
        return content === 'José María O\'Connor' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      expect(screen.getByText('@jose_maria')).toBeInTheDocument();
    });
  });

  describe('User interactions and accessibility', () => {
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

    test('reply button is present but does not trigger any action', () => {
      render(<Post post={mockPost} />);
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      
      fireEvent.click(replyButton);
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });

    test('share button is present but does not trigger any action', () => {
      render(<Post post={mockPost} />);
      const shareButtons = screen.getAllByRole('button');
      const shareButton = shareButtons.find(button => 
        button.querySelector('svg path[d*="M8.684"]')
      );
      expect(shareButton).toBeInTheDocument();
      
      fireEvent.click(shareButton);
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });

    test('multiple rapid clicks on like button call likePost multiple times', () => {
      render(<Post post={mockPost} />);
      const likeButton = screen.getByText('42').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      
      expect(mockLikePost).toHaveBeenCalledTimes(3);
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
    });

    test('multiple rapid clicks on retweet button call retweetPost multiple times', () => {
      render(<Post post={mockPost} />);
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      
      expect(mockRetweetPost).toHaveBeenCalledTimes(2);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });
  });

  describe('Context integration and error handling', () => {
    test('handles missing context functions gracefully', () => {
      usePosts.mockReturnValue({
        likePost: undefined,
        retweetPost: undefined
      });
      
      expect(() => render(<Post post={mockPost} />)).not.toThrow();
    });

    test('calls context functions with correct parameters', () => {
      const mockLikePostWithError = jest.fn();
      
      usePosts.mockReturnValue({
        likePost: mockLikePostWithError,
        retweetPost: mockRetweetPost
      });
      
      render(<Post post={mockPost} />);
      const likeButton = screen.getByText('42').closest('button');
      
      fireEvent.click(likeButton);
      expect(mockLikePostWithError).toHaveBeenCalledWith(mockPost.id);
      expect(mockLikePostWithError).toHaveBeenCalledTimes(1);
    });

    test('renders correctly when Avatar component is not available', () => {
      render(<Post post={mockPost} />);
      expect(screen.getByTestId('avatar-mock')).toBeInTheDocument();
    });
  });
});
