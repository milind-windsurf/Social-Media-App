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
    test('shows "now" for timestamps less than 1 minute ago', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };
      
      render(<Post post={recentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('shows minutes for timestamps between 1-59 minutes ago', () => {
      const minutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      };
      
      render(<Post post={minutesPost} />);
      expect(screen.getByText('5m')).toBeInTheDocument();
    });

    test('shows hours for timestamps between 1-23 hours ago', () => {
      const hoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      };
      
      render(<Post post={hoursPost} />);
      expect(screen.getByText('3h')).toBeInTheDocument();
    });

    test('shows days for timestamps 24+ hours ago', () => {
      const daysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      };
      
      render(<Post post={daysPost} />);
      expect(screen.getByText('2d')).toBeInTheDocument();
    });

    test('handles boundary condition: exactly 1 minute ago', () => {
      const boundaryPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };
      
      render(<Post post={boundaryPost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles boundary condition: exactly 1 hour ago', () => {
      const boundaryPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // exactly 1 hour ago
      };
      
      render(<Post post={boundaryPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles boundary condition: exactly 1 day ago', () => {
      const boundaryPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 1 day ago
      };
      
      render(<Post post={boundaryPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('handles very large time differences', () => {
      const oldPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      };
      
      render(<Post post={oldPost} />);
      expect(screen.getByText('365d')).toBeInTheDocument();
    });
  });

  describe('error handling and edge cases', () => {
    test('handles post with missing author name gracefully', () => {
      const postWithoutName = {
        ...mockPost,
        author: {
          ...mockPost.author,
          name: undefined
        }
      };
      
      render(<Post post={postWithoutName} />);
      // Should still render without crashing
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles post with missing author username gracefully', () => {
      const postWithoutUsername = {
        ...mockPost,
        author: {
          ...mockPost.author,
          username: undefined
        }
      };
      
      render(<Post post={postWithoutUsername} />);
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles post with zero interaction counts', () => {
      const zeroInteractionPost = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };
      
      render(<Post post={zeroInteractionPost} />);
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3); // replies, retweets, likes
    });

    test('handles post with very high interaction counts', () => {
      const highInteractionPost = {
        ...mockPost,
        likes: 999999,
        retweets: 888888,
        replies: 777777
      };
      
      render(<Post post={highInteractionPost} />);
      expect(screen.getByText('999999')).toBeInTheDocument();
      expect(screen.getByText('888888')).toBeInTheDocument();
      expect(screen.getByText('777777')).toBeInTheDocument();
    });

    test('handles empty post content', () => {
      const emptyContentPost = {
        ...mockPost,
        content: ''
      };
      
      render(<Post post={emptyContentPost} />);
      expect(screen.getByRole('heading', { name: 'Test User' })).toBeInTheDocument();
      const contentElement = screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'p' && 
               element.classList.contains('text-body') &&
               content === '';
      });
      expect(contentElement).toBeInTheDocument();
    });

    test('handles very long post content', () => {
      const longContentPost = {
        ...mockPost,
        content: 'A'.repeat(1000) // Very long content
      };
      
      render(<Post post={longContentPost} />);
      expect(screen.getByText('A'.repeat(1000))).toBeInTheDocument();
    });
  });

  describe('interaction behavior', () => {
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

    test('reply and share buttons are rendered but do not have click handlers', () => {
      render(<Post post={mockPost} />);
      
      // Find reply button (first button with the replies count)
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons[buttons.length - 1];
      expect(shareButton).toBeInTheDocument();
      
      fireEvent.click(replyButton);
      fireEvent.click(shareButton);
      
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });
  });

  describe('console logging', () => {
    test('formatTime function logs to console', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      render(<Post post={mockPost} />);
      
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
      
      consoleSpy.mockRestore();
    });
  });
});
