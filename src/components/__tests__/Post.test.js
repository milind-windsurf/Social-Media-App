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

  test('formatTime returns "now" for timestamps less than 1 minute ago', () => {
    const veryRecentPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 30 * 1000)
    };

    render(<Post post={veryRecentPost} />);
    expect(screen.getByText('now')).toBeInTheDocument();
  });

  test('formatTime returns minutes for timestamps between 1-59 minutes ago', () => {
    const minutesAgoPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    };

    render(<Post post={minutesAgoPost} />);
    expect(screen.getByText('30m')).toBeInTheDocument();
  });

  test('formatTime returns hours for timestamps between 1-23 hours ago', () => {
    const hoursAgoPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
    };

    render(<Post post={hoursAgoPost} />);
    expect(screen.getByText('5h')).toBeInTheDocument();
  });

  test('formatTime returns days for timestamps 24+ hours ago', () => {
    const daysAgoPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    };

    render(<Post post={daysAgoPost} />);
    expect(screen.getByText('3d')).toBeInTheDocument();
  });

  test('formatTime handles edge case of exactly 1 minute ago', () => {
    const exactlyOneMinutePost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 60 * 1000)
    };

    render(<Post post={exactlyOneMinutePost} />);
    expect(screen.getByText('1m')).toBeInTheDocument();
  });

  test('formatTime handles edge case of exactly 1 hour ago', () => {
    const exactlyOneHourPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 60 * 60 * 1000)
    };

    render(<Post post={exactlyOneHourPost} />);
    expect(screen.getByText('1h')).toBeInTheDocument();
  });

  test('formatTime handles edge case of exactly 24 hours ago', () => {
    const exactlyOneDayPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    };

    render(<Post post={exactlyOneDayPost} />);
    expect(screen.getByText('1d')).toBeInTheDocument();
  });

  test('handles multiple rapid clicks on like button', () => {
    render(<Post post={mockPost} />);
    
    const likeButton = screen.getByText('42').closest('button');
    fireEvent.click(likeButton);
    fireEvent.click(likeButton);
    fireEvent.click(likeButton);
    
    expect(mockLikePost).toHaveBeenCalledTimes(3);
    expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
  });

  test('handles multiple rapid clicks on retweet button', () => {
    render(<Post post={mockPost} />);
    
    const retweetButton = screen.getByText('12').closest('button');
    fireEvent.click(retweetButton);
    fireEvent.click(retweetButton);
    
    expect(mockRetweetPost).toHaveBeenCalledTimes(2);
    expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
  });

  test('renders correctly with zero interaction counts', () => {
    const zeroInteractionPost = {
      ...mockPost,
      likes: 0,
      retweets: 0,
      replies: 0
    };

    render(<Post post={zeroInteractionPost} />);
    
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  test('throws error when used outside PostsProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    usePosts.mockImplementation(() => {
      throw new Error('usePosts must be used within a PostsProvider');
    });

    expect(() => render(<Post post={mockPost} />)).toThrow('usePosts must be used within a PostsProvider');
    
    consoleSpy.mockRestore();
  });
});
