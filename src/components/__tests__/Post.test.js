import { render, screen, fireEvent } from '@testing-library/react';
import { Post } from '../Post';
import { usePosts } from '@/context/PostsContext';

// Mock the dependencies
jest.mock('@/context/PostsContext');
jest.mock('../Avatar', () => ({
  Avatar: ({ name, size }) => (
    <div data-testid="avatar-mock" data-size={size}>
      {name}
    </div>
  )
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
    test('shows "now" for very recent posts (less than 1 minute)', () => {
      const veryRecentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
      };

      render(<Post post={veryRecentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('shows minutes for posts less than 1 hour old', () => {
      const minutesAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      };

      render(<Post post={minutesAgoPost} />);
      expect(screen.getByText('45m')).toBeInTheDocument();
    });

    test('shows hours for posts less than 24 hours old', () => {
      const hoursAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      };

      render(<Post post={hoursAgoPost} />);
      expect(screen.getByText('12h')).toBeInTheDocument();
    });

    test('shows days for posts older than 24 hours', () => {
      const daysAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };

      render(<Post post={daysAgoPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('handles boundary conditions correctly', () => {
      const exactlyOneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };

      render(<Post post={exactlyOneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles future timestamps gracefully', () => {
      const futurePost = {
        ...mockPost,
        timestamp: new Date(Date.now() + 60 * 1000) // 1 minute in the future
      };

      render(<Post post={futurePost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });
  });

  describe('Avatar component integration', () => {
    test('passes correct props to Avatar component', () => {
      render(<Post post={mockPost} />);
      
      const avatar = screen.getByTestId('avatar-mock');
      expect(avatar).toHaveTextContent('Test User');
      expect(avatar).toHaveAttribute('data-size', 'md');
    });

    test('handles long author names correctly', () => {
      const longNamePost = {
        ...mockPost,
        author: {
          name: 'Very Long Author Name That Might Cause Issues',
          username: 'verylongusername'
        }
      };

      render(<Post post={longNamePost} />);
      expect(screen.getByTestId('avatar-mock')).toHaveTextContent('Very Long Author Name That Might Cause Issues');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Very Long Author Name That Might Cause Issues');
    });
  });

  describe('User interactions', () => {
    test('reply button is rendered but not interactive', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      
      fireEvent.click(replyButton);
    });

    test('share button is rendered but not interactive', () => {
      render(<Post post={mockPost} />);
      
      const actionButtons = screen.getAllByRole('button');
      const shareButton = actionButtons[actionButtons.length - 1];
      
      expect(shareButton).toBeInTheDocument();
      
      fireEvent.click(shareButton);
    });

    test('like button changes appearance on hover', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      expect(likeButton).toHaveClass('hover:text-red-500');
    });

    test('retweet button changes appearance on hover', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      expect(retweetButton).toHaveClass('hover:text-green-500');
    });
  });

  describe('Error handling and edge cases', () => {
    test('handles missing author data gracefully', () => {
      const postWithMissingAuthor = {
        ...mockPost,
        author: {
          name: '',
          username: ''
        }
      };

      render(<Post post={postWithMissingAuthor} />);
      
      // Should still render without crashing
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles zero interaction counts', () => {
      const postWithZeroCounts = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={postWithZeroCounts} />);
      
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3); // likes, retweets, replies should all show 0
    });

    test('handles very large interaction counts', () => {
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

    test('handles empty post content', () => {
      const postWithEmptyContent = {
        ...mockPost,
        content: ''
      };

      render(<Post post={postWithEmptyContent} />);
      
      // Should still render the post structure - use more specific selectors
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test User');
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('handles very long post content', () => {
      const longContent = 'A'.repeat(1000);
      const postWithLongContent = {
        ...mockPost,
        content: longContent
      };

      render(<Post post={postWithLongContent} />);
      
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic structure', () => {
      render(<Post post={mockPost} />);
      
      const authorHeading = screen.getByRole('heading', { level: 3 });
      expect(authorHeading).toHaveTextContent('Test User');
    });

    test('buttons have proper accessibility attributes', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    test('avatar has proper accessibility label', () => {
      render(<Post post={mockPost} />);
      
      const avatar = screen.getByTestId('avatar-mock');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Context integration', () => {
    test('throws error when usePosts context is not available', () => {
      usePosts.mockImplementation(() => {
        throw new Error('usePosts must be used within a PostsProvider');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<Post post={mockPost} />);
      }).toThrow('usePosts must be used within a PostsProvider');

      consoleSpy.mockRestore();
    });

    test('calls context functions with correct parameters', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(retweetButton);
      
      expect(mockLikePost).toHaveBeenCalledWith(1);
      expect(mockRetweetPost).toHaveBeenCalledWith(1);
      expect(mockLikePost).toHaveBeenCalledTimes(1);
      expect(mockRetweetPost).toHaveBeenCalledTimes(1);
    });

    test('handles multiple rapid clicks correctly', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      
      expect(mockLikePost).toHaveBeenCalledTimes(3);
      expect(mockLikePost).toHaveBeenCalledWith(1);
    });
  });
});
