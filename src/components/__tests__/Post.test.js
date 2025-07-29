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

  describe('formatTime utility function', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.useFakeTimers();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      jest.useRealTimers();
    });

    test('returns "now" for timestamps less than 1 minute ago', () => {
      const currentTime = new Date('2024-01-15T12:00:00');
      jest.setSystemTime(currentTime);
      
      const timestamp30SecondsAgo = new Date('2024-01-15T11:59:30');
      
      const testPost = {
        ...mockPost,
        timestamp: timestamp30SecondsAgo
      };

      render(<Post post={testPost} />);
      
      expect(screen.getByText('now')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns "Xm" format for timestamps between 1-59 minutes ago', () => {
      const currentTime = new Date('2024-01-15T12:00:00');
      jest.setSystemTime(currentTime);
      
      const timestamp30MinutesAgo = new Date('2024-01-15T11:30:00');
      
      const testPost = {
        ...mockPost,
        timestamp: timestamp30MinutesAgo
      };

      render(<Post post={testPost} />);
      
      expect(screen.getByText('30m')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns "1m" for exactly 1 minute ago', () => {
      const currentTime = new Date('2024-01-15T12:00:00');
      jest.setSystemTime(currentTime);
      
      const timestamp1MinuteAgo = new Date('2024-01-15T11:59:00');
      
      const testPost = {
        ...mockPost,
        timestamp: timestamp1MinuteAgo
      };

      render(<Post post={testPost} />);
      
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('returns "59m" for 59 minutes ago (boundary case)', () => {
      const currentTime = new Date('2024-01-15T12:00:00');
      jest.setSystemTime(currentTime);
      
      const timestamp59MinutesAgo = new Date('2024-01-15T11:01:00');
      
      const testPost = {
        ...mockPost,
        timestamp: timestamp59MinutesAgo
      };

      render(<Post post={testPost} />);
      
      expect(screen.getByText('59m')).toBeInTheDocument();
    });

    test('returns "Xh" format for timestamps between 1-23 hours ago', () => {
      const currentTime = new Date('2024-01-15T12:00:00');
      jest.setSystemTime(currentTime);
      
      const timestamp5HoursAgo = new Date('2024-01-15T07:00:00');
      
      const testPost = {
        ...mockPost,
        timestamp: timestamp5HoursAgo
      };

      render(<Post post={testPost} />);
      
      expect(screen.getByText('5h')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns "1h" for exactly 1 hour ago', () => {
      const currentTime = new Date('2024-01-15T12:00:00');
      jest.setSystemTime(currentTime);
      
      const timestamp1HourAgo = new Date('2024-01-15T11:00:00');
      
      const testPost = {
        ...mockPost,
        timestamp: timestamp1HourAgo
      };

      render(<Post post={testPost} />);
      
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('returns "23h" for 23 hours ago (boundary case)', () => {
      const currentTime = new Date('2024-01-15T12:00:00');
      jest.setSystemTime(currentTime);
      
      const timestamp23HoursAgo = new Date('2024-01-14T13:00:00');
      
      const testPost = {
        ...mockPost,
        timestamp: timestamp23HoursAgo
      };

      render(<Post post={testPost} />);
      
      expect(screen.getByText('23h')).toBeInTheDocument();
    });

    test('returns "Xd" format for timestamps 24+ hours ago', () => {
      const currentTime = new Date('2024-01-15T12:00:00');
      jest.setSystemTime(currentTime);
      
      const timestamp3DaysAgo = new Date('2024-01-12T12:00:00');
      
      const testPost = {
        ...mockPost,
        timestamp: timestamp3DaysAgo
      };

      render(<Post post={testPost} />);
      
      expect(screen.getByText('3d')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns "1d" for exactly 24 hours ago', () => {
      const currentTime = new Date('2024-01-15T12:00:00');
      jest.setSystemTime(currentTime);
      
      const timestamp1DayAgo = new Date('2024-01-14T12:00:00');
      
      const testPost = {
        ...mockPost,
        timestamp: timestamp1DayAgo
      };

      render(<Post post={testPost} />);
      
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('handles very old timestamps correctly', () => {
      const currentTime = new Date('2024-01-15T12:00:00');
      jest.setSystemTime(currentTime);
      
      const timestamp30DaysAgo = new Date('2023-12-16T12:00:00');
      
      const testPost = {
        ...mockPost,
        timestamp: timestamp30DaysAgo
      };

      render(<Post post={testPost} />);
      
      expect(screen.getByText('30d')).toBeInTheDocument();
    });
  });
});
