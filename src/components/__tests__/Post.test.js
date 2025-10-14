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

  describe('formatTime function', () => {
    test('returns "now" for timestamps less than 1 minute ago', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };
      
      render(<Post post={recentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('returns minutes for timestamps less than 60 minutes ago', () => {
      const post1m = {
        ...mockPost,
        timestamp: new Date(Date.now() - 1 * 60 * 1000) // 1 minute ago
      };
      
      render(<Post post={post1m} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('returns correct minutes for 30 minutes ago', () => {
      const post30m = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };
      
      render(<Post post={post30m} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('returns correct minutes for 59 minutes ago', () => {
      const post59m = {
        ...mockPost,
        timestamp: new Date(Date.now() - 59 * 60 * 1000) // 59 minutes ago
      };
      
      render(<Post post={post59m} />);
      expect(screen.getByText('59m')).toBeInTheDocument();
    });

    test('returns hours for timestamps less than 24 hours ago', () => {
      const post1h = {
        ...mockPost,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      };
      
      render(<Post post={post1h} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('returns correct hours for 12 hours ago', () => {
      const post12h = {
        ...mockPost,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      };
      
      render(<Post post={post12h} />);
      expect(screen.getByText('12h')).toBeInTheDocument();
    });

    test('returns correct hours for 23 hours ago', () => {
      const post23h = {
        ...mockPost,
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000) // 23 hours ago
      };
      
      render(<Post post={post23h} />);
      expect(screen.getByText('23h')).toBeInTheDocument();
    });

    test('returns days for timestamps 24 hours or more ago', () => {
      const post1d = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      };
      
      render(<Post post={post1d} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('returns correct days for 7 days ago', () => {
      const post7d = {
        ...mockPost,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      };
      
      render(<Post post={post7d} />);
      expect(screen.getByText('7d')).toBeInTheDocument();
    });

    test('returns correct days for 30 days ago', () => {
      const post30d = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      };
      
      render(<Post post={post30d} />);
      expect(screen.getByText('30d')).toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    test('renders reply button with correct count', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      expect(replyButton).toHaveClass('text-gray-500', 'hover:text-blue-500');
    });

    test('renders share button', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons[3];
      expect(shareButton).toBeInTheDocument();
      expect(shareButton).toHaveClass('text-gray-500', 'hover:text-blue-500');
    });
  });

  describe('CSS classes and structure', () => {
    test('applies correct CSS classes to post container', () => {
      const { container } = render(<Post post={mockPost} />);
      
      const postContainer = container.firstChild;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'hover:bg-gray-50', 'transition-colors');
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
      
      const content = screen.getByText('This is a test post content');
      expect(content).toHaveClass('text-gray-900', 'text-base', 'leading-relaxed', 'text-body');
    });
  });
});
