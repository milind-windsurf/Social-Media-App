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
        timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };
      
      render(<Post post={minutesAgoPost} />);
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    test('returns hours for timestamps between 1-23 hours ago', () => {
      const hoursAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      };
      
      render(<Post post={hoursAgoPost} />);
      expect(screen.getByText('5h')).toBeInTheDocument();
    });

    test('returns days for timestamps 24+ hours ago', () => {
      const daysAgoPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };
      
      render(<Post post={daysAgoPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('handles boundary condition: exactly 1 minute ago', () => {
      const exactMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };
      
      render(<Post post={exactMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles boundary condition: exactly 1 hour ago', () => {
      const exactHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // exactly 1 hour ago
      };
      
      render(<Post post={exactHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles boundary condition: exactly 24 hours ago', () => {
      const exactDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 24 hours ago
      };
      
      render(<Post post={exactDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });
  });

  describe('formatTime error handling', () => {
    test('handles invalid timestamp gracefully', () => {
      const invalidPost = {
        ...mockPost,
        timestamp: new Date('invalid-date')
      };
      
      // Should not throw an error when rendering
      expect(() => render(<Post post={invalidPost} />)).not.toThrow();
    });

    test('handles very old timestamps', () => {
      const veryOldPost = {
        ...mockPost,
        timestamp: new Date('2020-01-01') // Very old date
      };
      
      render(<Post post={veryOldPost} />);
      // Should show days format for very old posts
      const timeElement = screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'span' && 
               element.classList.contains('text-gray-500') && 
               element.classList.contains('text-sm') &&
               content.includes('d');
      });
      expect(timeElement).toBeInTheDocument();
    });
  });

  describe('Post component edge cases', () => {
    test('handles missing post author data gracefully', () => {
      const postWithMissingAuthor = {
        ...mockPost,
        author: {
          name: '',
          username: ''
        }
      };
      
      expect(() => render(<Post post={postWithMissingAuthor} />)).not.toThrow();
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
      expect(zeroElements).toHaveLength(3); // Should show 0 for replies, retweets, and likes
    });

    test('handles very long post content', () => {
      const longContentPost = {
        ...mockPost,
        content: 'A'.repeat(1000) // Very long content
      };
      
      render(<Post post={longContentPost} />);
      expect(screen.getByText('A'.repeat(1000))).toBeInTheDocument();
    });

    test('reply button renders but has no click handler', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button'); // replies count
      expect(replyButton).toBeInTheDocument();
      
      // Should not throw when clicked (no handler attached)
      expect(() => fireEvent.click(replyButton)).not.toThrow();
    });

    test('share button renders but has no click handler', () => {
      render(<Post post={mockPost} />);
      
      const shareButtons = screen.getAllByRole('button');
      const shareButton = shareButtons.find(button => 
        button.querySelector('svg path[d*="M8.684"]') // Share icon path
      );
      expect(shareButton).toBeInTheDocument();
      
      // Should not throw when clicked (no handler attached)
      expect(() => fireEvent.click(shareButton)).not.toThrow();
    });
  });
});
