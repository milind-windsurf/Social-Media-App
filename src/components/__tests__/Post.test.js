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

    test('handles boundary case at exactly 1 minute', () => {
      const exactlyOneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };
      
      render(<Post post={exactlyOneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles boundary case at exactly 1 hour', () => {
      const exactlyOneHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // exactly 1 hour ago
      };
      
      render(<Post post={exactlyOneHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles boundary case at exactly 24 hours', () => {
      const exactlyOneDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 24 hours ago
      };
      
      render(<Post post={exactlyOneDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });
  });

  describe('inactive button rendering', () => {
    test('renders reply button without handler', () => {
      render(<Post post={mockPost} />);
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      expect(replyButton).toHaveClass('text-gray-500', 'hover:text-blue-500');
    });

    test('renders share button without handler', () => {
      render(<Post post={mockPost} />);
      const shareButtons = screen.getAllByRole('button');
      const shareButton = shareButtons.find(button => 
        button.querySelector('svg path[d*="8.684 13.342"]')
      );
      expect(shareButton).toBeInTheDocument();
      expect(shareButton).toHaveClass('text-gray-500', 'hover:text-blue-500');
    });
  });
});
