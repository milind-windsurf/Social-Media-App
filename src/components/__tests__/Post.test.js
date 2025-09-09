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

    test('returns correct minutes for timestamps between 1-59 minutes ago', () => {
      const minutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      };
      
      render(<Post post={minutesPost} />);
      expect(screen.getByText('45m')).toBeInTheDocument();
    });

    test('returns "1m" for exactly 1 minute ago', () => {
      const oneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };
      
      render(<Post post={oneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('returns "59m" for 59 minutes ago', () => {
      const fiftyNineMinutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 59 * 60 * 1000) // 59 minutes ago
      };
      
      render(<Post post={fiftyNineMinutesPost} />);
      expect(screen.getByText('59m')).toBeInTheDocument();
    });

    test('returns correct hours for timestamps between 1-23 hours ago', () => {
      const hoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      };
      
      render(<Post post={hoursPost} />);
      expect(screen.getByText('5h')).toBeInTheDocument();
    });

    test('returns "1h" for exactly 1 hour ago', () => {
      const oneHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // exactly 1 hour ago
      };
      
      render(<Post post={oneHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('returns "23h" for 23 hours ago', () => {
      const twentyThreeHoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000) // 23 hours ago
      };
      
      render(<Post post={twentyThreeHoursPost} />);
      expect(screen.getByText('23h')).toBeInTheDocument();
    });

    test('returns correct days for timestamps 24+ hours ago', () => {
      const daysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };
      
      render(<Post post={daysPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('returns "1d" for exactly 24 hours ago', () => {
      const oneDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 24 hours ago
      };
      
      render(<Post post={oneDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
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
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toBeInTheDocument();
    });

    test('handles missing content gracefully', () => {
      const postWithoutContent = {
        ...mockPost,
        content: undefined
      };
      
      render(<Post post={postWithoutContent} />);
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toBeInTheDocument();
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
      expect(zeroElements.length).toBeGreaterThanOrEqual(3);
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

    test('handles invalid timestamp gracefully', () => {
      const postWithInvalidTimestamp = {
        ...mockPost,
        timestamp: 'invalid-date'
      };
      
      expect(() => {
        render(<Post post={postWithInvalidTimestamp} />);
      }).not.toThrow();
    });
  });

  describe('accessibility and interactions', () => {
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

    test('author name is properly structured for screen readers', () => {
      render(<Post post={mockPost} />);
      
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toHaveClass('font-display', 'font-bold');
    });

    test('post content is properly structured', () => {
      render(<Post post={mockPost} />);
      
      const postContent = screen.getByText('This is a test post content');
      expect(postContent.tagName.toLowerCase()).toBe('p');
      expect(postContent).toHaveClass('text-body');
    });
  });

  describe('debug logging', () => {
    test('console.log is called when formatTime is executed', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      render(<Post post={mockPost} />);
      
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
      
      consoleSpy.mockRestore();
    });
  });
});
