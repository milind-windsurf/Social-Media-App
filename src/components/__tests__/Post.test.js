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

  describe('formatTime utility', () => {
    test('formats timestamp as "now" for posts less than 1 minute old', () => {
      const nowPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
      };

      render(<Post post={nowPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('formats timestamp in minutes for posts less than 1 hour old', () => {
      const minutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };

      render(<Post post={minutesPost} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('formats timestamp at exact 1 minute boundary', () => {
      const oneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };

      render(<Post post={oneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('formats timestamp in hours for posts less than 24 hours old', () => {
      const hoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      };

      render(<Post post={hoursPost} />);
      expect(screen.getByText('5h')).toBeInTheDocument();
    });

    test('formats timestamp at exact 59 minutes boundary', () => {
      const fiftyNineMinutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 59 * 60 * 1000) // 59 minutes ago
      };

      render(<Post post={fiftyNineMinutesPost} />);
      expect(screen.getByText('59m')).toBeInTheDocument();
    });

    test('formats timestamp at exact 23 hours boundary', () => {
      const twentyThreeHoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000) // 23 hours ago
      };

      render(<Post post={twentyThreeHoursPost} />);
      expect(screen.getByText('23h')).toBeInTheDocument();
    });

    test('formats timestamp in days for posts older than 24 hours', () => {
      const daysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };

      render(<Post post={daysPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('formats timestamp at exact 24 hours boundary', () => {
      const twentyFourHoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 24 hours ago
      };

      render(<Post post={twentyFourHoursPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });
  });

  describe('interaction edge cases', () => {
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

    test('renders correctly with zero interaction counts', () => {
      const zeroCountPost = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={zeroCountPost} />);
      
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3);
      zeroElements.forEach(element => {
        expect(element).toBeInTheDocument();
        expect(element).toHaveClass('text-sm', 'text-accent');
      });
    });

    test('reply button renders but is not interactive', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      
      fireEvent.click(replyButton);
      
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });

    test('share button renders but is not interactive', () => {
      render(<Post post={mockPost} />);
      
      const shareButtons = screen.getAllByRole('button');
      const shareButton = shareButtons.find(button => 
        button.querySelector('svg path[d*="8.684 13.342"]')
      );
      
      expect(shareButton).toBeInTheDocument();
      
      if (shareButton) {
        fireEvent.click(shareButton);
        expect(mockLikePost).not.toHaveBeenCalled();
        expect(mockRetweetPost).not.toHaveBeenCalled();
      }
    });
  });

  describe('error handling and edge cases', () => {
    test('handles post with missing author name gracefully', () => {
      const postWithoutName = {
        ...mockPost,
        author: {
          ...mockPost.author,
          name: ''
        }
      };

      render(<Post post={postWithoutName} />);
      
      expect(screen.getByTestId('avatar-mock')).toHaveTextContent('');
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('handles post with missing username gracefully', () => {
      const postWithoutUsername = {
        ...mockPost,
        author: {
          ...mockPost.author,
          username: ''
        }
      };

      render(<Post post={postWithoutUsername} />);
      
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toBeInTheDocument();
      expect(screen.getByText('@')).toBeInTheDocument();
    });

    test('handles post with empty content', () => {
      const emptyContentPost = {
        ...mockPost,
        content: ''
      };

      render(<Post post={emptyContentPost} />);
      
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('handles very large interaction counts', () => {
      const highCountPost = {
        ...mockPost,
        likes: 999999,
        retweets: 888888,
        replies: 777777
      };

      render(<Post post={highCountPost} />);
      
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toBeInTheDocument();
      expect(screen.getByText('999999')).toBeInTheDocument();
      expect(screen.getByText('888888')).toBeInTheDocument();
      expect(screen.getByText('777777')).toBeInTheDocument();
    });

    test('handles PostsContext functions being undefined', () => {
      usePosts.mockReturnValue({
        likePost: undefined,
        retweetPost: undefined
      });

      expect(() => {
        render(<Post post={mockPost} />);
      }).not.toThrow();
    });
  });

  describe('accessibility and rendering', () => {
    test('applies correct CSS classes for styling', () => {
      const { container } = render(<Post post={mockPost} />);
      
      const postContainer = container.firstChild;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4', 'hover:bg-gray-50', 'transition-colors', 'w-full');
    });

    test('renders author name with correct styling classes', () => {
      render(<Post post={mockPost} />);
      
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      
      expect(authorName).toHaveClass('font-display', 'font-bold', 'text-gray-900', 'hover:underline', 'cursor-pointer');
    });

    test('renders username with correct styling classes', () => {
      render(<Post post={mockPost} />);
      
      const username = screen.getByText('@testuser');
      expect(username).toHaveClass('text-gray-500', 'font-mono');
    });

    test('renders post content with correct styling classes', () => {
      render(<Post post={mockPost} />);
      
      const content = screen.getByText('This is a test post content');
      expect(content).toHaveClass('mt-1', 'text-gray-900', 'text-base', 'leading-relaxed', 'text-body');
    });

    test('renders interaction counts with correct styling', () => {
      render(<Post post={mockPost} />);
      
      const likeCount = screen.getByText('42');
      const retweetCount = screen.getByText('12');
      const replyCount = screen.getByText('5');
      
      expect(likeCount).toHaveClass('text-sm', 'text-accent');
      expect(retweetCount).toHaveClass('text-sm', 'text-accent');
      expect(replyCount).toHaveClass('text-sm', 'text-accent');
    });

    test('buttons have proper hover states', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      
      expect(likeButton).toHaveClass('hover:text-red-500', 'transition-colors');
      expect(retweetButton).toHaveClass('hover:text-green-500', 'transition-colors');
    });

    test('SVG icons are properly rendered', () => {
      const { container } = render(<Post post={mockPost} />);
      
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements).toHaveLength(4); // reply, retweet, like, share
      
      svgElements.forEach(svg => {
        expect(svg).toHaveClass('w-4', 'h-4');
        expect(svg).toHaveAttribute('fill', 'none');
        expect(svg).toHaveAttribute('stroke', 'currentColor');
      });
    });
  });
});
