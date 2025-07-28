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
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };
      render(<Post post={recentPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('returns minutes for timestamps between 1-59 minutes ago', () => {
      const minutesAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      };
      render(<Post post={minutesAgoPost} />);
      expect(screen.getByText('5m')).toBeInTheDocument();
    });

    test('handles boundary conditions correctly - exactly 1 minute', () => {
      const oneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };
      render(<Post post={oneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles boundary conditions correctly - exactly 60 minutes', () => {
      const sixtyMinutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // exactly 60 minutes ago
      };
      render(<Post post={sixtyMinutesPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles boundary conditions correctly - exactly 24 hours', () => {
      const twentyFourHoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 24 hours ago
      };
      render(<Post post={twentyFourHoursPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('handles future timestamps gracefully', () => {
      const futurePost = {
        ...mockPost,
        timestamp: new Date(Date.now() + 60 * 1000) // 1 minute in future
      };
      render(<Post post={futurePost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('handles very old timestamps correctly', () => {
      const oldPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      };
      render(<Post post={oldPost} />);
      expect(screen.getByText('30d')).toBeInTheDocument();
    });

    test('handles edge case - less than 1 second ago', () => {
      const justNowPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 500) // 500ms ago
      };
      render(<Post post={justNowPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });
  });

  describe('error handling and edge cases', () => {
    test('handles missing author information gracefully', () => {
      const postWithoutAuthor = {
        ...mockPost,
        author: { name: '', username: '' }
      };
      expect(() => render(<Post post={postWithoutAuthor} />)).not.toThrow();
      expect(screen.getByText('@')).toBeInTheDocument();
    });

    test('handles zero interaction counts', () => {
      const postWithZeros = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };
      render(<Post post={postWithZeros} />);
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements).toHaveLength(3);
    });

    test('handles large interaction counts', () => {
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

    test('handles empty post content', () => {
      const postWithEmptyContent = {
        ...mockPost,
        content: ''
      };
      expect(() => render(<Post post={postWithEmptyContent} />)).not.toThrow();
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

    test('handles special characters in author name and username', () => {
      const postWithSpecialChars = {
        ...mockPost,
        author: {
          name: 'Test User @#$%',
          username: 'test_user-123'
        }
      };
      render(<Post post={postWithSpecialChars} />);
      expect(screen.getByRole('heading', { name: 'Test User @#$%' })).toBeInTheDocument();
      expect(screen.getByText('@test_user-123')).toBeInTheDocument();
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
      fireEvent.click(retweetButton);
      
      expect(mockRetweetPost).toHaveBeenCalledTimes(3);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('handles context function calls correctly', () => {
      const mockLikePostSpy = jest.fn();
      const mockRetweetPostSpy = jest.fn();
      
      usePosts.mockReturnValue({
        likePost: mockLikePostSpy,
        retweetPost: mockRetweetPostSpy
      });

      render(<Post post={mockPost} />);
      
      const likeButton = screen.getByText('42').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(retweetButton);
      
      expect(mockLikePostSpy).toHaveBeenCalledWith(mockPost.id);
      expect(mockRetweetPostSpy).toHaveBeenCalledWith(mockPost.id);
    });

    test('reply button renders but does not have click handler', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      
      fireEvent.click(replyButton);
    });

    test('share button renders but does not have click handler', () => {
      render(<Post post={mockPost} />);
      
      const shareButtons = screen.getAllByRole('button');
      const shareButton = shareButtons.find(button => 
        button.querySelector('svg path[d*="8.684 13.342"]')
      );
      expect(shareButton).toBeInTheDocument();
      
      fireEvent.click(shareButton);
    });
  });

  describe('component structure and styling', () => {
    test('applies correct CSS classes to main container', () => {
      const { container } = render(<Post post={mockPost} />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4', 'hover:bg-gray-50', 'transition-colors', 'w-full');
    });

    test('renders all action buttons with correct structure', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
      
      const replyButton = screen.getByText('5').closest('button');
      const retweetButton = screen.getByText('12').closest('button');
      const likeButton = screen.getByText('42').closest('button');
      
      expect(replyButton).toHaveClass('flex', 'items-center', 'space-x-2', 'text-gray-500', 'hover:text-blue-500', 'transition-colors', 'group');
      expect(retweetButton).toHaveClass('flex', 'items-center', 'space-x-2', 'text-gray-500', 'hover:text-green-500', 'transition-colors', 'group');
      expect(likeButton).toHaveClass('flex', 'items-center', 'space-x-2', 'text-gray-500', 'hover:text-red-500', 'transition-colors', 'group');
    });

    test('renders SVG icons for all action buttons', () => {
      const { container } = render(<Post post={mockPost} />);
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements).toHaveLength(4);
      
      svgElements.forEach(svg => {
        expect(svg).toHaveClass('w-4', 'h-4');
        expect(svg).toHaveAttribute('fill', 'none');
        expect(svg).toHaveAttribute('stroke', 'currentColor');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      });
    });
  });
});
