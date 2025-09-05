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

  describe('formatTime function', () => {
    test('shows "now" for posts less than 1 minute old', () => {
      const nowPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
      };

      render(<Post post={nowPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('shows minutes for posts less than 1 hour old', () => {
      const minutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };

      render(<Post post={minutesPost} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('shows "1m" for posts exactly 1 minute old', () => {
      const oneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // 1 minute ago
      };

      render(<Post post={oneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('shows "59m" for posts just under 1 hour old', () => {
      const fiftyNineMinutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 59 * 60 * 1000) // 59 minutes ago
      };

      render(<Post post={fiftyNineMinutesPost} />);
      expect(screen.getByText('59m')).toBeInTheDocument();
    });

    test('shows hours for posts less than 24 hours old', () => {
      const hoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      };

      render(<Post post={hoursPost} />);
      expect(screen.getByText('5h')).toBeInTheDocument();
    });

    test('shows "1h" for posts exactly 1 hour old', () => {
      const oneHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      };

      render(<Post post={oneHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('shows "23h" for posts just under 24 hours old', () => {
      const twentyThreeHoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000) // 23 hours ago
      };

      render(<Post post={twentyThreeHoursPost} />);
      expect(screen.getByText('23h')).toBeInTheDocument();
    });

    test('shows days for posts 24 hours or older', () => {
      const daysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };

      render(<Post post={daysPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('shows "1d" for posts exactly 24 hours old', () => {
      const oneDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      };

      render(<Post post={oneDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('handles future timestamps gracefully', () => {
      const futurePost = {
        ...mockPost,
        timestamp: new Date(Date.now() + 60 * 60 * 1000) // 1 hour in the future
      };

      render(<Post post={futurePost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('handles invalid timestamp gracefully', () => {
      const invalidPost = {
        ...mockPost,
        timestamp: new Date('invalid-date')
      };

      render(<Post post={invalidPost} />);
      const timestampElement = screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'span' && 
               element.classList.contains('text-gray-500') && 
               element.classList.contains('text-sm');
      });
      expect(timestampElement).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    test('renders with missing author name', () => {
      const postWithoutName = {
        ...mockPost,
        author: {
          ...mockPost.author,
          name: ''
        }
      };

      render(<Post post={postWithoutName} />);
      expect(screen.getByTestId('avatar-mock')).toHaveTextContent('');
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('renders with missing author username', () => {
      const postWithoutUsername = {
        ...mockPost,
        author: {
          ...mockPost.author,
          username: ''
        }
      };

      render(<Post post={postWithoutUsername} />);
      expect(screen.getByText('@')).toBeInTheDocument();
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('renders with missing content', () => {
      const postWithoutContent = {
        ...mockPost,
        content: ''
      };

      render(<Post post={postWithoutContent} />);
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
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
      expect(zeroElements).toHaveLength(3); // replies, retweets, likes
      expect(zeroElements[0]).toBeInTheDocument();
    });

    test('renders with undefined interaction counts', () => {
      const postWithUndefinedCounts = {
        ...mockPost,
        likes: undefined,
        retweets: undefined,
        replies: undefined
      };

      render(<Post post={postWithUndefinedCounts} />);
      expect(screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    test('calls likePost multiple times when like button is clicked multiple times', () => {
      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      
      expect(mockLikePost).toHaveBeenCalledTimes(3);
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
    });

    test('calls retweetPost multiple times when retweet button is clicked multiple times', () => {
      render(<Post post={mockPost} />);
      
      const retweetButton = screen.getByText('12').closest('button');
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      
      expect(mockRetweetPost).toHaveBeenCalledTimes(2);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('reply button renders but does not have click handler', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      
      fireEvent.click(replyButton);
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });

    test('share button renders but does not have click handler', () => {
      render(<Post post={mockPost} />);
      
      const shareButtons = screen.getAllByRole('button');
      const shareButton = shareButtons.find(button => 
        button.querySelector('svg path[d*="8.684 13.342"]')
      );
      expect(shareButton).toBeInTheDocument();
      
      fireEvent.click(shareButton);
      expect(mockLikePost).not.toHaveBeenCalled();
      expect(mockRetweetPost).not.toHaveBeenCalled();
    });
  });

  describe('accessibility and rendering', () => {
    test('passes correct props to Avatar component', () => {
      render(<Post post={mockPost} />);
      
      const avatar = screen.getByTestId('avatar-mock');
      expect(avatar).toHaveTextContent('Test User');
    });

    test('applies correct CSS classes to post container', () => {
      const { container } = render(<Post post={mockPost} />);
      
      const postContainer = container.firstChild;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4', 'hover:bg-gray-50', 'transition-colors', 'w-full');
    });

    test('renders all action buttons with correct structure', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4); // reply, retweet, like, share
      
      buttons.forEach(button => {
        expect(button.querySelector('svg')).toBeInTheDocument();
      });
    });

    test('displays author information with correct styling', () => {
      render(<Post post={mockPost} />);
      
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toHaveClass('font-display', 'font-bold', 'text-gray-900', 'hover:underline', 'cursor-pointer');
      
      const username = screen.getByText('@testuser');
      expect(username).toHaveClass('text-gray-500', 'font-mono');
    });

    test('displays post content with correct styling', () => {
      render(<Post post={mockPost} />);
      
      const content = screen.getByText('This is a test post content');
      expect(content).toHaveClass('mt-1', 'text-gray-900', 'text-base', 'leading-relaxed', 'text-body');
    });
  });
});
