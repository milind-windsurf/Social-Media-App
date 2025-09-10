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
    test('formats "now" for timestamps less than 1 minute ago', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };
      render(<Post post={recentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('formats minutes correctly for timestamps between 1-59 minutes', () => {
      const minutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      };
      render(<Post post={minutePost} />);
      expect(screen.getByText('5m')).toBeInTheDocument();
    });

    test('formats hours correctly for timestamps between 1-23 hours', () => {
      const hourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      };
      render(<Post post={hourPost} />);
      expect(screen.getByText('3h')).toBeInTheDocument();
    });

    test('formats days correctly for timestamps 24+ hours ago', () => {
      const dayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      };
      render(<Post post={dayPost} />);
      expect(screen.getByText('2d')).toBeInTheDocument();
    });

    test('handles boundary case of exactly 1 minute', () => {
      const exactMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };
      render(<Post post={exactMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles boundary case of exactly 1 hour', () => {
      const exactHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // exactly 1 hour ago
      };
      render(<Post post={exactHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles boundary case of exactly 1 day', () => {
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
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
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
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles empty post content', () => {
      const emptyContentPost = {
        ...mockPost,
        content: ''
      };
      render(<Post post={emptyContentPost} />);
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
    });

    test('handles zero interaction counts', () => {
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

  describe('Accessibility and interactions', () => {
    test('action buttons have proper structure and classes', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      const replyButton = screen.getByText('5').closest('button');
      
      expect(likeButton).toHaveClass('hover:text-red-500');
      expect(retweetButton).toHaveClass('hover:text-green-500');
      expect(replyButton).toHaveClass('hover:text-blue-500');
    });

    test('buttons contain SVG icons', () => {
      render(<Post post={mockPost} />);
      
      const svgElements = screen.getAllByRole('button').map(button => 
        button.querySelector('svg')
      ).filter(Boolean);
      
      expect(svgElements.length).toBeGreaterThan(0);
    });

    test('post container has proper styling classes', () => {
      render(<Post post={mockPost} />);
      
      const postContainer = screen.getByText('This is a test post content').closest('div').parentElement.parentElement;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'hover:bg-gray-50');
    });

    test('author name is clickable with proper styling', () => {
      render(<Post post={mockPost} />);
      
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      
      expect(authorName).toHaveClass('font-display', 'font-bold', 'hover:underline', 'cursor-pointer');
    });
  });

  describe('Context integration', () => {
    test('handles context errors gracefully', () => {
      usePosts.mockImplementation(() => {
        throw new Error('usePosts must be used within a PostsProvider');
      });
      
      expect(() => render(<Post post={mockPost} />)).toThrow('usePosts must be used within a PostsProvider');
    });

    test('calls context functions with correct parameters multiple times', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(retweetButton);
      
      expect(mockLikePost).toHaveBeenCalledTimes(2);
      expect(mockRetweetPost).toHaveBeenCalledTimes(1);
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });
  });
});
