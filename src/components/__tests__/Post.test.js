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
      const nowPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
      };

      render(<Post post={nowPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('shows "now" for current timestamp', () => {
      const currentPost = {
        ...mockPost,
        timestamp: new Date()
      };

      render(<Post post={currentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('shows "1m" for exactly 1 minute ago', () => {
      const oneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // 1 minute ago
      };

      render(<Post post={oneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('shows "59m" for 59 minutes ago', () => {
      const fiftyNineMinutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 59 * 60 * 1000) // 59 minutes ago
      };

      render(<Post post={fiftyNineMinutesPost} />);
      expect(screen.getByText('59m')).toBeInTheDocument();
    });

    test('shows "1h" for exactly 1 hour ago', () => {
      const oneHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      };

      render(<Post post={oneHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('shows "23h" for 23 hours ago', () => {
      const twentyThreeHoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000) // 23 hours ago
      };

      render(<Post post={twentyThreeHoursPost} />);
      expect(screen.getByText('23h')).toBeInTheDocument();
    });

    test('shows "1d" for exactly 24 hours ago', () => {
      const oneDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      };

      render(<Post post={oneDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('shows "7d" for 7 days ago', () => {
      const sevenDaysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      };

      render(<Post post={sevenDaysPost} />);
      expect(screen.getByText('7d')).toBeInTheDocument();
    });

    test('handles future timestamps gracefully', () => {
      const futurePost = {
        ...mockPost,
        timestamp: new Date(Date.now() + 60 * 60 * 1000) // 1 hour in future
      };

      render(<Post post={futurePost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });
  });

  describe('error handling and edge cases', () => {
    test('handles missing post prop gracefully', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<Post />);
      }).toThrow();
      
      consoleSpy.mockRestore();
    });

    test('handles missing author data', () => {
      const postWithoutAuthor = {
        ...mockPost,
        author: undefined
      };

      expect(() => {
        render(<Post post={postWithoutAuthor} />);
      }).toThrow();
    });

    test('handles missing author name', () => {
      const postWithoutAuthorName = {
        ...mockPost,
        author: {
          username: 'testuser'
        }
      };

      render(<Post post={postWithoutAuthorName} />);
      // Should render without author name, but username should still be there
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('handles missing author username', () => {
      const postWithoutUsername = {
        ...mockPost,
        author: {
          name: 'Test User'
        }
      };

      render(<Post post={postWithoutUsername} />);
      // Should render with author name but without username
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test User');
    });

    test('handles invalid timestamp', () => {
      const postWithInvalidTimestamp = {
        ...mockPost,
        timestamp: 'invalid-date'
      };

      render(<Post post={postWithInvalidTimestamp} />);
      // Should render the post content even with invalid timestamp
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles null timestamp', () => {
      const postWithNullTimestamp = {
        ...mockPost,
        timestamp: null
      };

      render(<Post post={postWithNullTimestamp} />);
      // Should render the post content even with null timestamp
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles missing content', () => {
      const postWithoutContent = {
        ...mockPost,
        content: undefined
      };

      render(<Post post={postWithoutContent} />);
      // Should render author name even without content
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test User');
    });

    test('handles zero interaction counts', () => {
      const postWithZeroCounts = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={postWithZeroCounts} />);
      
      // Should display zero counts
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3); // likes, retweets, replies
    });
  });

  describe('button interactions and accessibility', () => {
    test('reply button renders correctly and does not crash when clicked', () => {
      render(<Post post={mockPost} />);
      
      // Find reply button by its count
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      
      // Should not crash when clicked (no handler attached)
      expect(() => {
        fireEvent.click(replyButton);
      }).not.toThrow();
    });

    test('share button renders correctly and does not crash when clicked', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons[buttons.length - 1]; // Last button is share
      expect(shareButton).toBeInTheDocument();
      
      // Should not crash when clicked (no handler attached)
      expect(() => {
        fireEvent.click(shareButton);
      }).not.toThrow();
    });

    test('all action buttons have proper hover states', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      
      // Should have at least 4 buttons (reply, retweet, like, share)
      expect(buttons.length).toBeGreaterThanOrEqual(4);
      
      buttons.forEach(button => {
        expect(button).toHaveClass('transition-colors');
      });
    });

    test('interaction counts are displayed correctly', () => {
      render(<Post post={mockPost} />);
      
      expect(screen.getByText('5')).toBeInTheDocument(); // replies
      expect(screen.getByText('12')).toBeInTheDocument(); // retweets
      expect(screen.getByText('42')).toBeInTheDocument(); // likes
    });

    test('buttons have proper semantic structure', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      
      // Should have exactly 4 action buttons
      expect(buttons.length).toBe(4);
      
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('disabled');
        expect(button.tabIndex).not.toBe(-1);
      });
    });

    test('post content is properly structured', () => {
      render(<Post post={mockPost} />);
      
      const authorName = screen.getByRole('heading', { level: 3 });
      expect(authorName).toHaveTextContent('Test User');
      
      const postContent = screen.getByText('This is a test post content');
      expect(postContent.tagName.toLowerCase()).toBe('p');
    });

    test('avatar is rendered with correct props', () => {
      render(<Post post={mockPost} />);
      
      const avatar = screen.getByTestId('avatar-mock');
      expect(avatar).toHaveTextContent('Test User');
    });
  });
});
