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
    // Create a post with a timestamp less than 1 minute ago
    const veryRecentPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
    };

    render(<Post post={veryRecentPost} />);
    
    // Should show "now" for a post from 30 seconds ago
    expect(screen.getByText('now')).toBeInTheDocument();
  });

  test('formats timestamp correctly for minutes', () => {
    // Create a post with a timestamp in minutes
    const minutesPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    };

    render(<Post post={minutesPost} />);
    
    // Should show "30m" for a post from 30 minutes ago
    expect(screen.getByText('30m')).toBeInTheDocument();
  });

  test('formats timestamp correctly for days', () => {
    // Create a post with a timestamp in days
    const daysPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    };

    render(<Post post={daysPost} />);
    
    // Should show "2d" for a post from 2 days ago
    expect(screen.getByText('2d')).toBeInTheDocument();
  });

  test('handles edge case at 1 minute boundary', () => {
    // Create a post exactly at 1 minute boundary
    const boundaryPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
    };

    render(<Post post={boundaryPost} />);
    
    // Should show "1m" for a post from exactly 1 minute ago
    expect(screen.getByText('1m')).toBeInTheDocument();
  });

  test('handles edge case at 24 hour boundary', () => {
    // Create a post exactly at 24 hour boundary
    const boundaryPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 24 hours ago
    };

    render(<Post post={boundaryPost} />);
    
    // Should show "1d" for a post from exactly 24 hours ago
    expect(screen.getByText('1d')).toBeInTheDocument();
  });

  test('handles malformed post data gracefully', () => {
    const malformedPost = {
      id: 1,
      author: {
        name: '',
        username: ''
      },
      content: '',
      timestamp: new Date(),
      likes: 0,
      retweets: 0,
      replies: 0
    };

    render(<Post post={malformedPost} />);
    
    // Should still render without crashing
    expect(screen.getByTestId('avatar-mock')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(3); // replies, retweets, and likes counts
  });

  test('handles missing post properties', () => {
    const minimalPost = {
      id: 1,
      author: {
        name: 'Test',
        username: 'test'
      },
      content: 'Test content',
      timestamp: new Date(),
      likes: undefined,
      retweets: undefined,
      replies: undefined
    };

    render(<Post post={minimalPost} />);
    
    // Should render without crashing even with undefined counts
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('handles future timestamp gracefully', () => {
    const futurePost = {
      ...mockPost,
      timestamp: new Date(Date.now() + 60 * 60 * 1000) // 1 hour in future
    };

    render(<Post post={futurePost} />);
    
    // Should handle future dates gracefully (likely show "now" or negative time)
    const timestampElement = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'span' && 
             element.classList.contains('text-gray-500') && 
             element.classList.contains('text-sm');
    });
    expect(timestampElement).toBeInTheDocument();
  });
});
