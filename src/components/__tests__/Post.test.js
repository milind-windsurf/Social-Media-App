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
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };

      render(<Post post={recentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('shows minutes for posts less than 1 hour old', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };

      render(<Post post={recentPost} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('shows hours for posts less than 24 hours old', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      };

      render(<Post post={recentPost} />);
      expect(screen.getByText('5h')).toBeInTheDocument();
    });

    test('shows days for posts older than 24 hours', () => {
      const oldPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };

      render(<Post post={oldPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('handles exactly 0 minutes (shows "now")', () => {
      const nowPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 500) // 0.5 seconds ago
      };

      render(<Post post={nowPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('handles exactly 60 minutes (shows hours)', () => {
      const hourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // exactly 1 hour ago
      };

      render(<Post post={hourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles exactly 24 hours (shows days)', () => {
      const dayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 1 day ago
      };

      render(<Post post={dayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });
  });

  describe('error handling and edge cases', () => {
    test('handles missing author name gracefully', () => {
      const incompletePost = {
        ...mockPost,
        author: {
          ...mockPost.author,
          name: undefined
        }
      };

      expect(() => {
        render(<Post post={incompletePost} />);
      }).not.toThrow();
    });

    test('handles missing author username gracefully', () => {
      const incompletePost = {
        ...mockPost,
        author: {
          ...mockPost.author,
          username: undefined
        }
      };

      expect(() => {
        render(<Post post={incompletePost} />);
      }).not.toThrow();
    });

    test('handles invalid timestamp gracefully', () => {
      const invalidPost = {
        ...mockPost,
        timestamp: new Date('invalid-date')
      };

      expect(() => {
        render(<Post post={invalidPost} />);
      }).not.toThrow();
    });

    test('handles null timestamp gracefully', () => {
      const nullTimestampPost = {
        ...mockPost,
        timestamp: null
      };

      expect(() => {
        render(<Post post={nullTimestampPost} />);
      }).not.toThrow();
    });

    test('throws error when used outside PostsProvider', () => {
      usePosts.mockImplementation(() => {
        throw new Error('usePosts must be used within a PostsProvider');
      });

      const consoleError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<Post post={mockPost} />);
      }).toThrow('usePosts must be used within a PostsProvider');

      console.error = consoleError;
      
      usePosts.mockReturnValue({
        likePost: mockLikePost,
        retweetPost: mockRetweetPost
      });
    });
  });

  describe('button interactions', () => {
    test('reply button renders correctly', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      expect(replyButton).toHaveClass('text-gray-500', 'hover:text-blue-500');
    });

    test('share button renders correctly', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons[buttons.length - 1]; // Last button is share
      expect(shareButton).toBeInTheDocument();
      expect(shareButton).toHaveClass('text-gray-500', 'hover:text-blue-500');
    });

    test('displays correct interaction counts', () => {
      render(<Post post={mockPost} />);
      
      expect(screen.getByText('5')).toBeInTheDocument(); // replies
      expect(screen.getByText('42')).toBeInTheDocument(); // likes  
      expect(screen.getByText('12')).toBeInTheDocument(); // retweets
    });

    test('like button has correct styling', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      expect(likeButton).toHaveClass('text-gray-500', 'hover:text-red-500');
    });

    test('retweet button has correct styling', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      expect(retweetButton).toHaveClass('text-gray-500', 'hover:text-green-500');
    });
  });

  describe('styling and accessibility', () => {
    test('applies correct CSS classes to post container', () => {
      render(<Post post={mockPost} />);
      
      const postContainer = screen.getByText('This is a test post content').closest('div').parentElement.parentElement;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4', 'hover:bg-gray-50', 'transition-colors', 'w-full');
    });

    test('applies correct classes to author name', () => {
      render(<Post post={mockPost} />);
      
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toHaveClass('font-display', 'font-bold', 'text-gray-900', 'hover:underline', 'cursor-pointer');
    });

    test('applies correct classes to username', () => {
      render(<Post post={mockPost} />);
      
      const username = screen.getByText('@testuser');
      expect(username).toHaveClass('text-gray-500', 'font-mono');
    });

    test('applies correct classes to post content', () => {
      render(<Post post={mockPost} />);
      
      const postContent = screen.getByText('This is a test post content');
      expect(postContent).toHaveClass('mt-1', 'text-gray-900', 'text-base', 'leading-relaxed', 'text-body');
    });

    test('applies correct classes to timestamp', () => {
      render(<Post post={mockPost} />);
      
      const timestampElement = screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'span' && 
               element.classList.contains('text-gray-500') && 
               element.classList.contains('text-sm');
      });
      expect(timestampElement).toHaveClass('text-gray-500', 'text-sm');
    });
  });

  describe('component integration', () => {
    test('renders all required elements', () => {
      render(<Post post={mockPost} />);
      
      expect(screen.getByTestId('avatar-mock')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(4); // reply, retweet, like, share
    });

    test('handles zero interaction counts', () => {
      const zeroPost = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={zeroPost} />);
      
      expect(screen.getAllByText('0')).toHaveLength(3);
    });

    test('handles large interaction counts', () => {
      const popularPost = {
        ...mockPost,
        likes: 9999,
        retweets: 8888,
        replies: 7777
      };

      render(<Post post={popularPost} />);
      
      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('8888')).toBeInTheDocument();
      expect(screen.getByText('7777')).toBeInTheDocument();
    });
  });
});
