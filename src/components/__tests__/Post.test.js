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

  test('formats timestamp correctly for hours', () => {
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

  test('formats timestamp as "now" for very recent posts', () => {
    const nowPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
    };

    render(<Post post={nowPost} />);
    
    expect(screen.getByText('now')).toBeInTheDocument();
  });

  test('formats timestamp in minutes for posts less than an hour old', () => {
    const minutesPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    };

    render(<Post post={minutesPost} />);
    
    expect(screen.getByText('5m')).toBeInTheDocument();
  });

  test('formats timestamp for edge case: exactly 1 minute', () => {
    const oneMinutePost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
    };

    render(<Post post={oneMinutePost} />);
    
    expect(screen.getByText('1m')).toBeInTheDocument();
  });

  test('formats timestamp for edge case: 59 minutes', () => {
    const fiftyNineMinutesPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 59 * 60 * 1000) // 59 minutes ago
    };

    render(<Post post={fiftyNineMinutesPost} />);
    
    expect(screen.getByText('59m')).toBeInTheDocument();
  });

  test('formats timestamp for edge case: exactly 24 hours', () => {
    const oneDayPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 24 hours ago
    };

    render(<Post post={oneDayPost} />);
    
    expect(screen.getByText('1d')).toBeInTheDocument();
  });

  test('formats timestamp in days for posts older than 24 hours', () => {
    const daysPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    };

    render(<Post post={daysPost} />);
    
    expect(screen.getByText('2d')).toBeInTheDocument();
  });

  test('renders reply button with correct structure', () => {
    render(<Post post={mockPost} />);
    
    const replyButton = screen.getByText('5').closest('button');
    expect(replyButton).toBeInTheDocument();
    expect(replyButton).toHaveClass('flex', 'items-center', 'space-x-2', 'text-gray-500', 'hover:text-blue-500', 'transition-colors', 'group');
    
    const replyIcon = replyButton.querySelector('svg');
    expect(replyIcon).toBeInTheDocument();
    expect(replyIcon).toHaveClass('w-4', 'h-4');
  });

  test('renders share button with correct structure', () => {
    render(<Post post={mockPost} />);
    
    const shareButtons = screen.getAllByRole('button');
    const shareButton = shareButtons.find(button => {
      const svg = button.querySelector('svg');
      return svg && svg.querySelector('path[d*="8.684"]');
    });
    
    expect(shareButton).toBeInTheDocument();
    expect(shareButton).toHaveClass('flex', 'items-center', 'space-x-2', 'text-gray-500', 'hover:text-blue-500', 'transition-colors', 'group');
    
    const shareIcon = shareButton.querySelector('svg');
    expect(shareIcon).toBeInTheDocument();
    expect(shareIcon).toHaveClass('w-4', 'h-4');
  });

  test('renders with zero interaction counts', () => {
    const zeroPost = {
      ...mockPost,
      likes: 0,
      retweets: 0,
      replies: 0
    };

    render(<Post post={zeroPost} />);
    
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  test('renders with large interaction counts', () => {
    const popularPost = {
      ...mockPost,
      likes: 9999,
      retweets: 5555,
      replies: 1234
    };

    render(<Post post={popularPost} />);
    
    expect(screen.getByText('9999')).toBeInTheDocument();
    expect(screen.getByText('5555')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  test('applies correct CSS classes to main container', () => {
    const { container } = render(<Post post={mockPost} />);
    
    const postContainer = container.firstChild;
    expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4', 'hover:bg-gray-50', 'transition-colors', 'w-full');
  });

  test('applies correct CSS classes to author name', () => {
    render(<Post post={mockPost} />);
    
    const authorName = screen.getByText((content, element) => {
      return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
    });
    
    expect(authorName).toHaveClass('font-display', 'font-bold', 'text-gray-900', 'hover:underline', 'cursor-pointer');
  });

  test('applies correct CSS classes to username', () => {
    render(<Post post={mockPost} />);
    
    const username = screen.getByText('@testuser');
    expect(username).toHaveClass('text-gray-500', 'font-mono');
  });

  test('applies correct CSS classes to post content', () => {
    render(<Post post={mockPost} />);
    
    const postContent = screen.getByText('This is a test post content');
    expect(postContent).toHaveClass('mt-1', 'text-gray-900', 'text-base', 'leading-relaxed', 'text-body');
  });
});
