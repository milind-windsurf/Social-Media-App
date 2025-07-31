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
      const nowPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
      };

      render(<Post post={nowPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('returns minutes for timestamps less than 1 hour ago', () => {
      const minutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };

      render(<Post post={minutesPost} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('returns hours for timestamps less than 24 hours ago', () => {
      const hoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      };

      render(<Post post={hoursPost} />);
      expect(screen.getByText('5h')).toBeInTheDocument();
    });

    test('returns days for timestamps 24+ hours ago', () => {
      const daysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };

      render(<Post post={daysPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('handles exact boundary cases correctly', () => {
      const exactMinutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 59 * 60 * 1000)
      };

      render(<Post post={exactMinutesPost} />);
      expect(screen.getByText('59m')).toBeInTheDocument();
    });

    test('handles future timestamps gracefully', () => {
      const futurePost = {
        ...mockPost,
        timestamp: new Date(Date.now() + 60 * 60 * 1000) // 1 hour in future
      };

      render(<Post post={futurePost} />);
      // Should show "now" for future timestamps due to negative diff
      expect(screen.getByText('now')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    test('handles missing post prop gracefully', () => {
      // Mock console.error to avoid error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<Post />);
      }).toThrow();
      
      consoleSpy.mockRestore();
    });

    test('handles missing author data', () => {
      const postWithoutAuthor = {
        ...mockPost,
        author: null
      };

      expect(() => {
        render(<Post post={postWithoutAuthor} />);
      }).toThrow();
    });

    test('handles missing timestamp', () => {
      const postWithoutTimestamp = {
        ...mockPost,
        timestamp: null
      };

      expect(() => {
        render(<Post post={postWithoutTimestamp} />);
      }).not.toThrow();
    });

    test('handles context not available error', () => {
      usePosts.mockImplementation(() => {
        throw new Error('usePosts must be used within a PostsProvider');
      });

      expect(() => {
        render(<Post post={mockPost} />);
      }).toThrow('usePosts must be used within a PostsProvider');
    });
  });

  describe('Additional interaction tests', () => {
    test('reply button renders correctly but has no click handler', () => {
      render(<Post post={mockPost} />);
      
      // Find reply button by its count
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      
      fireEvent.click(replyButton);
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });

    test('share button renders correctly but has no click handler', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons[buttons.length - 1];
      expect(shareButton).toBeInTheDocument();
      
      fireEvent.click(shareButton);
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });

    test('handles multiple rapid clicks on like button', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      
      // Should be called 3 times - no debouncing implemented
      expect(mockLikePost).toHaveBeenCalledTimes(3);
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
    });

    test('handles multiple rapid clicks on retweet button', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      
      // Should be called 3 times - no debouncing implemented
      expect(mockRetweetPost).toHaveBeenCalledTimes(3);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('buttons are keyboard accessible', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      
      likeButton.focus();
      expect(document.activeElement).toBe(likeButton);
      
      retweetButton.focus();
      expect(document.activeElement).toBe(retweetButton);
      
      fireEvent.keyDown(likeButton, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(retweetButton, { key: 'Enter', code: 'Enter' });
      
    });
  });

  describe('Component rendering edge cases', () => {
    test('renders with zero interaction counts', () => {
      const postWithZeroCounts = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={postWithZeroCounts} />);
      
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3);
    });

    test('renders with very large interaction counts', () => {
      const postWithLargeCounts = {
        ...mockPost,
        likes: 999999,
        retweets: 888888,
        replies: 777777
      };

      render(<Post post={postWithLargeCounts} />);
      
      expect(screen.getByText('999999')).toBeInTheDocument();
      expect(screen.getByText('888888')).toBeInTheDocument();
      expect(screen.getByText('777777')).toBeInTheDocument();
    });

    test('renders with empty content', () => {
      const postWithEmptyContent = {
        ...mockPost,
        content: ''
      };

      render(<Post post={postWithEmptyContent} />);
      
      // Should still render author info - use more specific selector for h3 element
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('renders with very long content', () => {
      const longContent = 'A'.repeat(1000);
      const postWithLongContent = {
        ...mockPost,
        content: longContent
      };

      render(<Post post={postWithLongContent} />);
      
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    test('renders with special characters in author name', () => {
      const postWithSpecialChars = {
        ...mockPost,
        author: {
          name: 'Test User 🚀 & Co.',
          username: 'test_user-123'
        }
      };

      render(<Post post={postWithSpecialChars} />);
      
      expect(screen.getByText((content, element) => {
        return content === 'Test User 🚀 & Co.' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      expect(screen.getByText('@test_user-123')).toBeInTheDocument();
    });
  });
});
