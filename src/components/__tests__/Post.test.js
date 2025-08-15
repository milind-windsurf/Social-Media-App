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
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      console.log.mockRestore();
    });

    test('returns "now" for timestamps less than 1 minute ago', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };

      render(<Post post={recentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
      expect(console.log).toHaveBeenCalledWith('hello!');
    });

    test('formats minutes correctly', () => {
      const minutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      };

      render(<Post post={minutesPost} />);
      expect(screen.getByText('5m')).toBeInTheDocument();
    });

    test('formats hours correctly', () => {
      const hoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      };

      render(<Post post={hoursPost} />);
      expect(screen.getByText('3h')).toBeInTheDocument();
    });

    test('formats days correctly', () => {
      const daysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      };

      render(<Post post={daysPost} />);
      expect(screen.getByText('2d')).toBeInTheDocument();
    });

    test('handles edge case of exactly 1 minute', () => {
      const exactMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };

      render(<Post post={exactMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles edge case of exactly 1 hour', () => {
      const exactHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // exactly 1 hour ago
      };

      render(<Post post={exactHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles edge case of exactly 1 day', () => {
      const exactDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 1 day ago
      };

      render(<Post post={exactDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });
  });

  describe('Error handling and edge cases', () => {
    test('handles missing author name gracefully', () => {
      const postWithoutName = {
        ...mockPost,
        author: {
          ...mockPost.author,
          name: ''
        }
      };

      render(<Post post={postWithoutName} />);
      expect(screen.getByTestId('avatar-mock')).toBeInTheDocument();
    });

    test('handles missing author username gracefully', () => {
      const postWithoutUsername = {
        ...mockPost,
        author: {
          ...mockPost.author,
          username: ''
        }
      };

      render(<Post post={postWithoutUsername} />);
      expect(screen.getByText('@')).toBeInTheDocument();
    });

    test('handles empty content', () => {
      const emptyContentPost = {
        ...mockPost,
        content: ''
      };

      render(<Post post={emptyContentPost} />);
      expect(screen.getByTestId('avatar-mock')).toBeInTheDocument();
    });

    test('handles zero interaction counts', () => {
      const zeroInteractionsPost = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={zeroInteractionsPost} />);
      expect(screen.getAllByText('0')).toHaveLength(3);
    });

    test('handles large interaction counts', () => {
      const largeInteractionsPost = {
        ...mockPost,
        likes: 9999,
        retweets: 8888,
        replies: 7777
      };

      render(<Post post={largeInteractionsPost} />);
      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('8888')).toBeInTheDocument();
      expect(screen.getByText('7777')).toBeInTheDocument();
    });

    test('handles very long content', () => {
      const longContentPost = {
        ...mockPost,
        content: 'A'.repeat(500)
      };

      render(<Post post={longContentPost} />);
      expect(screen.getByText('A'.repeat(500))).toBeInTheDocument();
    });

    test('handles special characters in content', () => {
      const specialCharPost = {
        ...mockPost,
        content: 'Test with émojis 🚀 and special chars: @#$%^&*()'
      };

      render(<Post post={specialCharPost} />);
      expect(screen.getByText('Test with émojis 🚀 and special chars: @#$%^&*()')).toBeInTheDocument();
    });
  });

  describe('Button interactions and accessibility', () => {
    test('like button has proper accessibility attributes', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      expect(likeButton).toBeInTheDocument();
      expect(likeButton).toHaveClass('hover:text-red-500');
    });

    test('retweet button has proper accessibility attributes', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      expect(retweetButton).toBeInTheDocument();
      expect(retweetButton).toHaveClass('hover:text-green-500');
    });

    test('reply button renders correctly', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      expect(replyButton).toHaveClass('hover:text-blue-500');
    });

    test('share button renders correctly', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons[buttons.length - 1];
      expect(shareButton).toBeInTheDocument();
    });

    test('multiple clicks on like button call likePost multiple times', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      
      expect(mockLikePost).toHaveBeenCalledTimes(3);
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
    });

    test('multiple clicks on retweet button call retweetPost multiple times', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      
      expect(mockRetweetPost).toHaveBeenCalledTimes(2);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('buttons maintain hover states', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      const replyButton = screen.getByText('5').closest('button');
      
      expect(likeButton).toHaveClass('transition-colors');
      expect(retweetButton).toHaveClass('transition-colors');
      expect(replyButton).toHaveClass('transition-colors');
    });
  });

  describe('Component structure and styling', () => {
    test('applies correct CSS classes for layout', () => {
      render(<Post post={mockPost} />);
      
      const postContainer = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      }).closest('div').parentElement.parentElement.parentElement;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4');
    });

    test('author name has correct styling', () => {
      render(<Post post={mockPost} />);
      
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toHaveClass('font-display', 'font-bold', 'text-gray-900');
    });

    test('username has correct styling', () => {
      render(<Post post={mockPost} />);
      
      const username = screen.getByText('@testuser');
      expect(username).toHaveClass('text-gray-500', 'font-mono');
    });

    test('post content has correct styling', () => {
      render(<Post post={mockPost} />);
      
      const content = screen.getByText('This is a test post content');
      expect(content).toHaveClass('text-gray-900', 'text-base', 'text-body');
    });

    test('renders all required SVG icons', () => {
      render(<Post post={mockPost} />);
      
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThanOrEqual(4);
    });
  });
});
