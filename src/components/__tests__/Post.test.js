import { render, screen, fireEvent } from '@testing-library/react';
import { Post } from '../Post';
import { usePosts } from '@/context/PostsContext';

// Mock the dependencies
jest.mock('@/context/PostsContext');
jest.mock('../Avatar', () => ({
  Avatar: ({ name, size }) => <div data-testid="avatar-mock" data-size={size}>{name}</div>
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

  describe('Component Rendering', () => {
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

    test('renders avatar with correct props', () => {
      render(<Post post={mockPost} />);
      const avatar = screen.getByTestId('avatar-mock');
      expect(avatar).toHaveTextContent('Test User');
      expect(avatar).toHaveAttribute('data-size', 'md');
    });

    test('renders with zero interaction counts', () => {
      const postWithZeroCounts = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };
      
      render(<Post post={postWithZeroCounts} />);
      
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3); // likes, retweets, replies
    });

    test('renders with large interaction counts', () => {
      const postWithLargeCounts = {
        ...mockPost,
        likes: 9999,
        retweets: 8888,
        replies: 7777
      };
      
      render(<Post post={postWithLargeCounts} />);
      
      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('8888')).toBeInTheDocument();
      expect(screen.getByText('7777')).toBeInTheDocument();
    });

    test('renders with empty author name', () => {
      const postWithEmptyName = {
        ...mockPost,
        author: {
          name: '',
          username: 'testuser'
        }
      };
      
      render(<Post post={postWithEmptyName} />);
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('renders with long content', () => {
      const longContent = 'This is a very long post content that should still render correctly and maintain proper formatting even when it spans multiple lines and contains various characters and symbols!';
      const postWithLongContent = {
        ...mockPost,
        content: longContent
      };
      
      render(<Post post={postWithLongContent} />);
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
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
      fireEvent.click(retweetButton);
      
      expect(mockRetweetPost).toHaveBeenCalledTimes(3);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('reply button exists but does not trigger any action', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      
      // Click reply button - should not call any context functions
      fireEvent.click(replyButton);
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });

    test('share button exists but does not trigger any action', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons.find(button => 
        !button.textContent.trim() && 
        button.querySelector('svg')
      );
      
      expect(shareButton).toBeInTheDocument();
      
      // Click share button - should not call any context functions
      fireEvent.click(shareButton);
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });
  });

  describe('formatTime Function', () => {
    test('returns "now" for timestamps less than 1 minute ago', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };
      
      render(<Post post={recentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('returns "now" for current timestamp', () => {
      const currentPost = {
        ...mockPost,
        timestamp: new Date() // Right now
      };
      
      render(<Post post={currentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('formats minutes correctly', () => {
      const oneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60000) // 1 minute ago
      };
      render(<Post post={oneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('formats multiple minutes correctly', () => {
      const thirtyMinutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60000) // 30 minutes ago
      };
      render(<Post post={thirtyMinutesPost} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('formats 59 minutes correctly', () => {
      const fiftyNineMinutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 59 * 60000) // 59 minutes ago
      };
      render(<Post post={fiftyNineMinutesPost} />);
      expect(screen.getByText('59m')).toBeInTheDocument();
    });

    test('formats hours correctly', () => {
      const oneHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      };
      render(<Post post={oneHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('formats multiple hours correctly', () => {
      const twelveHoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 12 * 3600000) // 12 hours ago
      };
      render(<Post post={twelveHoursPost} />);
      expect(screen.getByText('12h')).toBeInTheDocument();
    });

    test('formats 23 hours correctly', () => {
      const twentyThreeHoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 23 * 3600000) // 23 hours ago
      };
      render(<Post post={twentyThreeHoursPost} />);
      expect(screen.getByText('23h')).toBeInTheDocument();
    });

    test('formats days correctly', () => {
      const oneDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      };
      render(<Post post={oneDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('formats multiple days correctly', () => {
      const sevenDaysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 7 * 86400000) // 7 days ago
      };
      render(<Post post={sevenDaysPost} />);
      expect(screen.getByText('7d')).toBeInTheDocument();
    });

    test('formats large number of days correctly', () => {
      const oneYearPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 365 * 86400000) // 365 days ago
      };
      render(<Post post={oneYearPost} />);
      expect(screen.getByText('365d')).toBeInTheDocument();
    });

    test('handles future timestamps gracefully', () => {
      const futurePost = {
        ...mockPost,
        timestamp: new Date(Date.now() + 3600000) // 1 hour in the future
      };
      render(<Post post={futurePost} />);
      
      // Should still render something (likely "now" due to negative diff)
      const timestampElement = screen.getByText((content, element) => {
        return element && element.tagName.toLowerCase() === 'span' && 
               element.classList.contains('text-gray-500') && 
               element.classList.contains('text-sm');
      });
      expect(timestampElement).toBeInTheDocument();
    });
  });

  describe('Accessibility and DOM Structure', () => {
    test('has proper semantic structure', () => {
      render(<Post post={mockPost} />);
      
      const authorHeading = screen.getByRole('heading', { level: 3 });
      expect(authorHeading).toHaveTextContent('Test User');
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4); // reply, retweet, like, share
    });

    test('applies correct CSS classes', () => {
      const { container } = render(<Post post={mockPost} />);
      
      const postContainer = container.firstChild;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4', 'hover:bg-gray-50', 'transition-colors', 'w-full');
    });

    test('has proper button accessibility', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('disabled');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles post with missing author properties gracefully', () => {
      const postWithPartialAuthor = {
        ...mockPost,
        author: {
          name: 'Test User'
        }
      };
      
      // Should not crash when username is missing
      expect(() => {
        render(<Post post={postWithPartialAuthor} />);
      }).not.toThrow();
    });

    test('handles post with missing content gracefully', () => {
      const postWithoutContent = {
        ...mockPost,
        content: ''
      };
      
      render(<Post post={postWithoutContent} />);
      
      // Should still render author info - use more specific query to avoid duplicate elements
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('handles invalid timestamp gracefully', () => {
      const postWithInvalidTimestamp = {
        ...mockPost,
        timestamp: new Date('invalid-date')
      };
      
      // Should not crash with invalid timestamp
      expect(() => {
        render(<Post post={postWithInvalidTimestamp} />);
      }).not.toThrow();
    });

    test('context functions are called with correct post ID type', () => {
      const postWithStringId = {
        ...mockPost,
        id: '123' // string instead of number
      };
      
      render(<Post post={postWithStringId} />);
      
      const likeButton = screen.getByText('42').closest('button');
      fireEvent.click(likeButton);
      
      expect(mockLikePost).toHaveBeenCalledWith('123');
    });
  });
});
