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

    test('shows "now" for current timestamp', () => {
      const currentPost = {
        ...mockPost,
        timestamp: new Date()
      };

      render(<Post post={currentPost} />);
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

    test('shows "1m" for exactly 1 minute ago', () => {
      const oneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // 1 minute ago
      };

      render(<Post post={oneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('shows "59m" for 59 minutes ago', () => {
      const fiftyNineMinutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 59 * 60 * 1000) // 59 minutes ago
      };

      render(<Post post={fiftyNineMinutesPost} />);
      expect(screen.getByText('59m')).toBeInTheDocument();
    });

    test('shows hours for timestamps between 1-23 hours ago', () => {
      const hoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      };

      render(<Post post={hoursPost} />);
      expect(screen.getByText('5h')).toBeInTheDocument();
    });

    test('shows "1h" for exactly 1 hour ago', () => {
      const oneHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      };

      render(<Post post={oneHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('shows "23h" for 23 hours ago', () => {
      const twentyThreeHoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000) // 23 hours ago
      };

      render(<Post post={twentyThreeHoursPost} />);
      expect(screen.getByText('23h')).toBeInTheDocument();
    });

    test('shows days for timestamps 24+ hours ago', () => {
      const daysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };

      render(<Post post={daysPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('shows "1d" for exactly 24 hours ago', () => {
      const oneDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      };

      render(<Post post={oneDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('handles timestamps in the future', () => {
      const futurePost = {
        ...mockPost,
        timestamp: new Date(Date.now() + 60 * 60 * 1000) // 1 hour in the future
      };

      render(<Post post={futurePost} />);
      expect(screen.getByRole('heading', { name: 'Test User' })).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    test('handles invalid timestamp gracefully', () => {
      const invalidTimestampPost = {
        ...mockPost,
        timestamp: 'invalid-date'
      };

      expect(() => {
        render(<Post post={invalidTimestampPost} />);
      }).not.toThrow();
    });

    test('handles null timestamp', () => {
      const nullTimestampPost = {
        ...mockPost,
        timestamp: null
      };

      expect(() => {
        render(<Post post={nullTimestampPost} />);
      }).not.toThrow();
    });

    test('handles undefined timestamp', () => {
      const undefinedTimestampPost = {
        ...mockPost,
        timestamp: undefined
      };

      expect(() => {
        render(<Post post={undefinedTimestampPost} />);
      }).not.toThrow();
    });

    test('handles missing author properties', () => {
      const incompletePost = {
        ...mockPost,
        author: {}
      };

      expect(() => {
        render(<Post post={incompletePost} />);
      }).not.toThrow();
    });

    test('handles missing post content', () => {
      const noContentPost = {
        ...mockPost,
        content: undefined
      };

      expect(() => {
        render(<Post post={noContentPost} />);
      }).not.toThrow();
    });
  });

  describe('interaction handling', () => {
    test('handles multiple rapid like button clicks', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      
      expect(mockLikePost).toHaveBeenCalledTimes(3);
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
    });

    test('handles multiple rapid retweet button clicks', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      
      expect(mockRetweetPost).toHaveBeenCalledTimes(2);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('like and retweet buttons are accessible', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      
      expect(likeButton).toBeInTheDocument();
      expect(retweetButton).toBeInTheDocument();
      expect(likeButton.tagName).toBe('BUTTON');
      expect(retweetButton.tagName).toBe('BUTTON');
    });
  });

  describe('edge cases', () => {
    test('handles zero interaction counts', () => {
      const zeroInteractionsPost = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={zeroInteractionsPost} />);
      
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3); // likes, retweets, replies
    });

    test('handles large interaction counts', () => {
      const largeCountsPost = {
        ...mockPost,
        likes: 999999,
        retweets: 888888,
        replies: 777777
      };

      render(<Post post={largeCountsPost} />);
      
      expect(screen.getByText('999999')).toBeInTheDocument(); // likes
      expect(screen.getByText('888888')).toBeInTheDocument(); // retweets  
      expect(screen.getByText('777777')).toBeInTheDocument(); // replies
    });

    test('handles very long post content', () => {
      const longContentPost = {
        ...mockPost,
        content: 'A'.repeat(1000)
      };

      render(<Post post={longContentPost} />);
      
      expect(screen.getByText('A'.repeat(1000))).toBeInTheDocument();
    });

    test('handles empty post content', () => {
      const emptyContentPost = {
        ...mockPost,
        content: ''
      };

      render(<Post post={emptyContentPost} />);
      
      expect(screen.getByRole('heading', { name: 'Test User' })).toBeInTheDocument();
    });

    test('handles special characters in author name and username', () => {
      const specialCharsPost = {
        ...mockPost,
        author: {
          name: 'Test User @#$%',
          username: 'test_user-123'
        }
      };

      render(<Post post={specialCharsPost} />);
      
      expect(screen.getByRole('heading', { name: 'Test User @#$%' })).toBeInTheDocument();
      expect(screen.getByText('@test_user-123')).toBeInTheDocument();
    });
  });
});
