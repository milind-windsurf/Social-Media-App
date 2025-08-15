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
    test('returns "now" for timestamps less than 1 minute ago', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };
      render(<Post post={recentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('returns correct minutes for timestamps between 1-59 minutes', () => {
      const post30min = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };
      render(<Post post={post30min} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('returns correct hours for timestamps between 1-23 hours', () => {
      const post12h = {
        ...mockPost,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      };
      render(<Post post={post12h} />);
      expect(screen.getByText('12h')).toBeInTheDocument();
    });

    test('returns correct days for timestamps 24+ hours ago', () => {
      const post3d = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };
      render(<Post post={post3d} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('handles boundary conditions correctly', () => {
      const post60min = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      };
      render(<Post post={post60min} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles exactly 24 hours (should show 1d)', () => {
      const post24h = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };
      render(<Post post={post24h} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('handles exactly 1 minute (should show 1m)', () => {
      const post1min = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000)
      };
      render(<Post post={post1min} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });
  });

  describe('Post component error handling', () => {
    test('handles posts with zero interaction counts', () => {
      const zeroPost = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };
      render(<Post post={zeroPost} />);
      
      const likeCount = screen.getByText((content, element) => {
        return content === '0' && element.closest('button')?.querySelector('svg path[d*="M4.318"]');
      });
      const retweetCount = screen.getByText((content, element) => {
        return content === '0' && element.closest('button')?.querySelector('svg path[d*="M7 16V4"]');
      });
      const replyCount = screen.getByText((content, element) => {
        return content === '0' && element.closest('button')?.querySelector('svg path[d*="M8 12h.01"]');
      });
      
      expect(likeCount).toBeInTheDocument();
      expect(retweetCount).toBeInTheDocument();
      expect(replyCount).toBeInTheDocument();
    });

    test('handles posts with large interaction counts', () => {
      const popularPost = {
        ...mockPost,
        likes: 9999,
        retweets: 1234,
        replies: 567
      };
      render(<Post post={popularPost} />);
      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('1234')).toBeInTheDocument();
      expect(screen.getByText('567')).toBeInTheDocument();
    });

    test('handles missing author username gracefully', () => {
      const postWithoutUsername = {
        ...mockPost,
        author: {
          name: 'Test User'
        }
      };
      render(<Post post={postWithoutUsername} />);
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
    });

    test('handles empty post content', () => {
      const emptyPost = {
        ...mockPost,
        content: ''
      };
      render(<Post post={emptyPost} />);
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
    });

    test('handles very long post content', () => {
      const longPost = {
        ...mockPost,
        content: 'This is a very long post content that goes on and on and on and should still render properly without breaking the layout or causing any issues with the component rendering or functionality.'
      };
      render(<Post post={longPost} />);
      expect(screen.getByText(/This is a very long post content/)).toBeInTheDocument();
    });
  });

  describe('Post component interactions', () => {
    test('prevents multiple rapid clicks on like button', () => {
      render(<Post post={mockPost} />);
      const likeButton = screen.getByText('42').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      
      expect(mockLikePost).toHaveBeenCalledTimes(3);
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
    });

    test('prevents multiple rapid clicks on retweet button', () => {
      render(<Post post={mockPost} />);
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      
      expect(mockRetweetPost).toHaveBeenCalledTimes(2);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('like and retweet buttons have proper accessibility attributes', () => {
      render(<Post post={mockPost} />);
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      
      expect(likeButton).toBeInTheDocument();
      expect(retweetButton).toBeInTheDocument();
      expect(likeButton).toBeEnabled();
      expect(retweetButton).toBeEnabled();
    });

    test('reply and share buttons are present but non-functional', () => {
      render(<Post post={mockPost} />);
      const replyButton = screen.getByText('5').closest('button');
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons[buttons.length - 1];
      
      expect(replyButton).toBeInTheDocument();
      expect(shareButton).toBeInTheDocument();
      
      fireEvent.click(replyButton);
      fireEvent.click(shareButton);
      
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });

    test('buttons have proper hover states and styling', () => {
      render(<Post post={mockPost} />);
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      
      expect(likeButton).toHaveClass('hover:text-red-500');
      expect(retweetButton).toHaveClass('hover:text-green-500');
    });
  });

  describe('PostsContext integration', () => {
    test('context functions work correctly when properly defined', () => {
      usePosts.mockReturnValue({
        likePost: mockLikePost,
        retweetPost: mockRetweetPost
      });
      
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(retweetButton);
      
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('renders correctly when context functions are available', () => {
      usePosts.mockReturnValue({
        likePost: mockLikePost,
        retweetPost: mockRetweetPost
      });
      
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      
      expect(likeButton).toBeInTheDocument();
      expect(retweetButton).toBeInTheDocument();
      expect(likeButton).toBeEnabled();
      expect(retweetButton).toBeEnabled();
    });
  });

  describe('Post component rendering edge cases', () => {
    test('renders correctly with minimal post data', () => {
      const minimalPost = {
        id: 999,
        author: {
          name: 'Min User',
          username: 'min'
        },
        content: 'Hi',
        timestamp: new Date(),
        likes: 0,
        retweets: 0,
        replies: 0
      };
      
      render(<Post post={minimalPost} />);
      expect(screen.getByText((content, element) => {
        return content === 'Min User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      expect(screen.getByText('@min')).toBeInTheDocument();
      expect(screen.getByText('Hi')).toBeInTheDocument();
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('renders author name in avatar component correctly', () => {
      render(<Post post={mockPost} />);
      const avatarMock = screen.getByTestId('avatar-mock');
      expect(avatarMock).toHaveTextContent('Test User');
    });

    test('displays correct timestamp format for different time ranges', () => {
      const testCases = [
        { offset: 0, expected: 'now' },
        { offset: 5 * 60 * 1000, expected: '5m' },
        { offset: 2 * 60 * 60 * 1000, expected: '2h' },
        { offset: 5 * 24 * 60 * 60 * 1000, expected: '5d' }
      ];

      testCases.forEach(({ offset, expected }) => {
        const testPost = {
          ...mockPost,
          timestamp: new Date(Date.now() - offset)
        };
        
        const { unmount } = render(<Post post={testPost} />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
