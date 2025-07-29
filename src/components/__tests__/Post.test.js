import { render, screen, fireEvent } from '@testing-library/react';
import { Post, formatTime } from '../Post';
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

    test('returns "now" when less than 1 minute ago', () => {
      const now = new Date('2024-01-15T10:30:00');
      const timestamp = new Date('2024-01-15T10:29:30');
      jest.setSystemTime(now);

      const result = formatTime(timestamp);

      expect(result).toBe('now');
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns "now" when exactly 0 seconds ago', () => {
      const now = new Date('2024-01-15T10:30:00');
      const timestamp = new Date('2024-01-15T10:30:00');
      jest.setSystemTime(now);

      const result = formatTime(timestamp);

      expect(result).toBe('now');
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns "1m" when exactly 1 minute ago', () => {
      const now = new Date('2024-01-15T10:30:00');
      const timestamp = new Date('2024-01-15T10:29:00');
      jest.setSystemTime(now);

      const result = formatTime(timestamp);

      expect(result).toBe('1m');
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns minutes format when 1-59 minutes ago', () => {
      const now = new Date('2024-01-15T10:30:00');
      const timestamp = new Date('2024-01-15T10:00:00');
      jest.setSystemTime(now);

      const result = formatTime(timestamp);

      expect(result).toBe('30m');
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns "59m" when 59 minutes ago', () => {
      const now = new Date('2024-01-15T10:30:00');
      const timestamp = new Date('2024-01-15T09:31:00');
      jest.setSystemTime(now);

      const result = formatTime(timestamp);

      expect(result).toBe('59m');
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns "1h" when exactly 60 minutes ago', () => {
      const now = new Date('2024-01-15T10:30:00');
      const timestamp = new Date('2024-01-15T09:30:00');
      jest.setSystemTime(now);

      const result = formatTime(timestamp);

      expect(result).toBe('1h');
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns hours format when 1-23 hours ago', () => {
      const now = new Date('2024-01-15T10:30:00');
      const timestamp = new Date('2024-01-15T05:30:00');
      jest.setSystemTime(now);

      const result = formatTime(timestamp);

      expect(result).toBe('5h');
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns "23h" when 23 hours ago', () => {
      const now = new Date('2024-01-15T10:30:00');
      const timestamp = new Date('2024-01-14T11:30:00');
      jest.setSystemTime(now);

      const result = formatTime(timestamp);

      expect(result).toBe('23h');
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns "1d" when exactly 24 hours ago', () => {
      const now = new Date('2024-01-15T10:30:00');
      const timestamp = new Date('2024-01-14T10:30:00');
      jest.setSystemTime(now);

      const result = formatTime(timestamp);

      expect(result).toBe('1d');
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns days format when 24+ hours ago', () => {
      const now = new Date('2024-01-17T10:30:00');
      const timestamp = new Date('2024-01-15T10:30:00');
      jest.setSystemTime(now);

      const result = formatTime(timestamp);

      expect(result).toBe('2d');
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('returns days format for longer periods', () => {
      const now = new Date('2024-01-22T10:30:00');
      const timestamp = new Date('2024-01-15T10:30:00');
      jest.setSystemTime(now);

      const result = formatTime(timestamp);

      expect(result).toBe('7d');
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('handles edge case with millisecond precision', () => {
      const now = new Date('2024-01-15T10:30:00.999');
      const timestamp = new Date('2024-01-15T10:29:00.000');
      jest.setSystemTime(now);

      const result = formatTime(timestamp);

      expect(result).toBe('1m');
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });

    test('console.log is called exactly once per function call', () => {
      const now = new Date('2024-01-15T10:30:00');
      const timestamp = new Date('2024-01-15T10:29:30');
      jest.setSystemTime(now);

      formatTime(timestamp);

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
    });
  });
});
