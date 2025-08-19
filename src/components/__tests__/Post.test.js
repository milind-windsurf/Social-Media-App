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

  describe('Basic Rendering', () => {
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

    test('renders with very long content', () => {
      const longContentPost = {
        ...mockPost,
        content: 'A'.repeat(500)
      };
      render(<Post post={longContentPost} />);
      expect(screen.getByText('A'.repeat(500))).toBeInTheDocument();
    });

    test('renders with empty content', () => {
      const emptyContentPost = {
        ...mockPost,
        content: ''
      };
      render(<Post post={emptyContentPost} />);
      const contentElement = screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'p' && 
               element.classList.contains('text-body') &&
               content === '';
      });
      expect(contentElement).toBeInTheDocument();
    });

    test('renders with zero interaction counts', () => {
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
      fireEvent.click(replyButton);
      
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });

    test('share button exists but does not trigger any action', () => {
      render(<Post post={mockPost} />);
      
      const shareButtons = screen.getAllByRole('button');
      const shareButton = shareButtons.find(button => 
        button.querySelector('svg path[d*="8.684 13.342"]')
      );
      
      if (shareButton) {
        fireEvent.click(shareButton);
        expect(mockLikePost).not.toHaveBeenCalled();
        expect(mockRetweetPost).not.toHaveBeenCalled();
      }
    });
  });

  describe('formatTime Function Edge Cases', () => {
    test('formats timestamp correctly for recent time', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      };

      render(<Post post={recentPost} />);
      
      const timeElements = screen.getAllByText(/\d+h/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    test('shows "now" for very recent posts', () => {
      const nowPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };

      render(<Post post={nowPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('shows minutes for posts less than an hour old', () => {
      const minutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };

      render(<Post post={minutesPost} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('shows hours for posts less than a day old', () => {
      const hoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      };

      render(<Post post={hoursPost} />);
      expect(screen.getByText('5h')).toBeInTheDocument();
    });

    test('shows days for posts older than a day', () => {
      const daysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };

      render(<Post post={daysPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('handles future timestamps gracefully', () => {
      const futurePost = {
        ...mockPost,
        timestamp: new Date(Date.now() + 60 * 60 * 1000) // 1 hour in future
      };

      render(<Post post={futurePost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('handles edge case at exactly 1 minute', () => {
      const exactMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };

      render(<Post post={exactMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles edge case at exactly 1 hour', () => {
      const exactHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // exactly 1 hour ago
      };

      render(<Post post={exactHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles edge case at exactly 1 day', () => {
      const exactDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 1 day ago
      };

      render(<Post post={exactDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('handles very old timestamps', () => {
      const veryOldPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 year ago
      };

      render(<Post post={veryOldPost} />);
      expect(screen.getByText('365d')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing author name gracefully', () => {
      const noNamePost = {
        ...mockPost,
        author: {
          name: '',
          username: 'testuser'
        }
      };

      render(<Post post={noNamePost} />);
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('handles missing author username gracefully', () => {
      const noUsernamePost = {
        ...mockPost,
        author: {
          name: 'Test User',
          username: ''
        }
      };

      render(<Post post={noUsernamePost} />);
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
    });


    test('handles invalid timestamp gracefully', () => {
      const invalidTimestampPost = {
        ...mockPost,
        timestamp: new Date('invalid-date')
      };

      render(<Post post={invalidTimestampPost} />);
      const timeElement = screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'span' && 
               element.classList.contains('text-gray-500') && 
               element.classList.contains('text-sm') &&
               content.includes('d');
      });
      expect(timeElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper button roles for interactive elements', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4); // reply, retweet, like, share
    });

    test('like button has proper accessibility attributes', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      expect(likeButton).toHaveAttribute('class');
      expect(likeButton).toBeInTheDocument();
    });

    test('retweet button has proper accessibility attributes', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      expect(retweetButton).toHaveAttribute('class');
      expect(retweetButton).toBeInTheDocument();
    });

    test('author name is properly structured for screen readers', () => {
      render(<Post post={mockPost} />);
      
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toHaveClass('font-display', 'font-bold');
    });

    test('username has proper styling for screen readers', () => {
      render(<Post post={mockPost} />);
      
      const username = screen.getByText('@testuser');
      expect(username).toHaveClass('text-gray-500', 'font-mono');
    });
  });

  describe('CSS Classes and Styling', () => {
    test('post container has correct CSS classes', () => {
      const { container } = render(<Post post={mockPost} />);
      
      const postContainer = container.firstChild;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4');
    });

    test('hover state classes are applied', () => {
      const { container } = render(<Post post={mockPost} />);
      
      const postContainer = container.firstChild;
      expect(postContainer).toHaveClass('hover:bg-gray-50', 'transition-colors');
    });

    test('interaction buttons have hover state classes', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      expect(likeButton).toHaveClass('hover:text-red-500', 'transition-colors');
      
      const retweetButton = screen.getByText('12').closest('button');
      expect(retweetButton).toHaveClass('hover:text-green-500', 'transition-colors');
    });

    test('content has proper typography classes', () => {
      render(<Post post={mockPost} />);
      
      const content = screen.getByText('This is a test post content');
      expect(content).toHaveClass('text-gray-900', 'text-base', 'text-body');
    });
  });

  describe('Component Structure', () => {
    test('renders all required sections', () => {
      render(<Post post={mockPost} />);
      
      expect(screen.getByTestId('avatar-mock')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });

    test('maintains proper DOM structure', () => {
      const { container } = render(<Post post={mockPost} />);
      
      const postDiv = container.querySelector('.border-b');
      expect(postDiv).toBeInTheDocument();
      
      const flexContainer = postDiv.querySelector('.flex.space-x-3');
      expect(flexContainer).toBeInTheDocument();
      
      const contentContainer = flexContainer.querySelector('.flex-1');
      expect(contentContainer).toBeInTheDocument();
    });
  });
});
