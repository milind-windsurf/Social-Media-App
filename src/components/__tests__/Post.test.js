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

  describe('formatTime edge cases', () => {
    test('displays "now" for posts less than 1 minute old', () => {
      const veryRecentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 1000)
      };

      render(<Post post={veryRecentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('displays minutes for posts 1-59 minutes old', () => {
      const post30MinutesAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      };

      render(<Post post={post30MinutesAgo} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('displays "1m" for posts exactly 1 minute old', () => {
      const post1MinuteAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000)
      };

      render(<Post post={post1MinuteAgo} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('displays hours for posts 1-23 hours old', () => {
      const post5HoursAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
      };

      render(<Post post={post5HoursAgo} />);
      expect(screen.getByText('5h')).toBeInTheDocument();
    });

    test('displays days for posts 24+ hours old', () => {
      const post3DaysAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      };

      render(<Post post={post3DaysAgo} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('displays "1d" for posts exactly 24 hours old', () => {
      const post24HoursAgo = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };

      render(<Post post={post24HoursAgo} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });
  });

  describe('action buttons rendering', () => {
    test('renders Reply button', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      expect(replyButton).toHaveClass('hover:text-blue-500');
    });

    test('renders Share button', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons[buttons.length - 1];
      expect(shareButton).toBeInTheDocument();
      expect(shareButton).toHaveClass('hover:text-blue-500');
    });
  });

  describe('edge cases', () => {
    test('displays zero counts correctly', () => {
      const postWithZeros = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={postWithZeros} />);
      
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBe(3);
    });

    test('displays large numbers correctly', () => {
      const postWithLargeNumbers = {
        ...mockPost,
        likes: 9999,
        retweets: 1234,
        replies: 567
      };

      render(<Post post={postWithLargeNumbers} />);
      
      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('1234')).toBeInTheDocument();
      expect(screen.getByText('567')).toBeInTheDocument();
    });
  });

});
