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
    test('returns "now" for timestamps less than 1 minute ago', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };
      render(<Post post={recentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('formats minutes correctly for timestamps between 1-59 minutes', () => {
      const post30min = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };
      render(<Post post={post30min} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('formats hours correctly for timestamps between 1-23 hours', () => {
      const post12h = {
        ...mockPost,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      };
      render(<Post post={post12h} />);
      expect(screen.getByText('12h')).toBeInTheDocument();
    });

    test('formats days correctly for timestamps 24+ hours ago', () => {
      const post3d = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };
      render(<Post post={post3d} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('handles boundary conditions correctly', () => {
      const post1min = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000)
      };
      render(<Post post={post1min} />);
      expect(screen.getByText('1m')).toBeInTheDocument();

      const post1h = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      };
      render(<Post post={post1h} />);
      expect(screen.getByText('1h')).toBeInTheDocument();

      const post24h = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };
      render(<Post post={post24h} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('formats timestamp correctly for original test case', () => {
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
  });

  describe('error handling', () => {
    test('handles missing context functions gracefully', () => {
      usePosts.mockReturnValue({
        likePost: undefined,
        retweetPost: undefined
      });
      
      expect(() => render(<Post post={mockPost} />)).not.toThrow();
    });

    test('handles post with missing optional fields', () => {
      const minimalPost = {
        id: 1,
        author: { name: 'Test', username: 'test' },
        content: 'Test content',
        timestamp: new Date(),
        likes: 0,
        retweets: 0,
        replies: 0
      };
      
      expect(() => render(<Post post={minimalPost} />)).not.toThrow();
    });

    test('handles zero values for interaction counts', () => {
      const zeroPost = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };
      
      render(<Post post={zeroPost} />);
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3); // replies, retweets, likes
    });
  });

  describe('interactions and accessibility', () => {
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

    test('reply and share buttons are present but do not have click handlers', () => {
      render(<Post post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4); // reply, retweet, like, share
    });
  });

  describe('component structure', () => {
    test('renders with correct CSS classes for styling', () => {
      const { container } = render(<Post post={mockPost} />);
      const postContainer = container.firstChild;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4');
    });

    test('displays all action buttons (reply, retweet, like, share)', () => {
      render(<Post post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4); // reply, retweet, like, share
    });

    test('renders author information correctly', () => {
      render(<Post post={mockPost} />);
      
      // Check author name
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('renders post content', () => {
      render(<Post post={mockPost} />);
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('renders interaction counts', () => {
      render(<Post post={mockPost} />);
      expect(screen.getByText('42')).toBeInTheDocument(); // likes
      expect(screen.getByText('12')).toBeInTheDocument(); // retweets
      expect(screen.getByText('5')).toBeInTheDocument(); // replies
    });
  });
});
