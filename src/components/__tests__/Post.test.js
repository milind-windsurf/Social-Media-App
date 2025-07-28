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

  test('formats timestamp correctly for hours', () => {
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

  test('formats timestamp as "now" for very recent posts', () => {
    const nowPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
    };

    render(<Post post={nowPost} />);
    
    expect(screen.getByText('now')).toBeInTheDocument();
  });

  test('formats timestamp in minutes for posts under an hour', () => {
    const minutesPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    };

    render(<Post post={minutesPost} />);
    
    expect(screen.getByText('30m')).toBeInTheDocument();
  });

  test('formats timestamp in days for posts over 24 hours', () => {
    const daysPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    };

    render(<Post post={daysPost} />);
    
    expect(screen.getByText('2d')).toBeInTheDocument();
  });

  test('handles reply button click without crashing', () => {
    render(<Post post={mockPost} />);
    
    const replyButton = screen.getByText('5').closest('button');
    
    expect(() => {
      fireEvent.click(replyButton);
    }).not.toThrow();
  });

  test('handles share button click without crashing', () => {
    render(<Post post={mockPost} />);
    
    const shareButtons = screen.getAllByRole('button');
    const shareButton = shareButtons.find(button => 
      button.querySelector('svg path[d*="M8.684 13.342"]')
    );
    
    expect(() => {
      fireEvent.click(shareButton);
    }).not.toThrow();
  });

  test('renders with missing author information gracefully', () => {
    const postWithMissingAuthor = {
      ...mockPost,
      author: {
        name: '',
        username: ''
      }
    };

    expect(() => {
      render(<Post post={postWithMissingAuthor} />);
    }).not.toThrow();
    
    expect(screen.getByText('@')).toBeInTheDocument();
  });

  test('handles invalid timestamp gracefully', () => {
    const postWithInvalidTimestamp = {
      ...mockPost,
      timestamp: null
    };

    expect(() => {
      render(<Post post={postWithInvalidTimestamp} />);
    }).not.toThrow();
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
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  test('renders with very long post content', () => {
    const longContentPost = {
      ...mockPost,
      content: 'A'.repeat(500)
    };

    expect(() => {
      render(<Post post={longContentPost} />);
    }).not.toThrow();
    
    expect(screen.getByText('A'.repeat(500))).toBeInTheDocument();
  });

  test('renders with special characters in author names', () => {
    const specialCharPost = {
      ...mockPost,
      author: {
        name: 'Test User 🚀',
        username: 'test_user-123'
      }
    };

    render(<Post post={specialCharPost} />);
    
    const nameElements = screen.getAllByText('Test User 🚀');
    expect(nameElements.length).toBeGreaterThan(0);
    expect(screen.getByText('@test_user-123')).toBeInTheDocument();
  });

  test('applies correct CSS classes for hover states', () => {
    render(<Post post={mockPost} />);
    
    const postContainer = screen.getByText(mockPost.content).closest('div').parentElement.parentElement;
    expect(postContainer).toHaveClass('hover:bg-gray-50', 'transition-colors');
  });

  test('renders all action buttons with correct structure', () => {
    render(<Post post={mockPost} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4); // reply, retweet, like, share
    
    buttons.forEach(button => {
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });
});
