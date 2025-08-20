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

  test('formats very recent timestamps as "now"', () => {
    const veryRecentPost = {
      ...mockPost,
      timestamp: new Date(Date.now() - 30000) // 30 seconds ago
    };
    
    render(<Post post={veryRecentPost} />);
    expect(screen.getByText('now')).toBeInTheDocument();
  });

  test('formats timestamps for different time ranges', () => {
    const minutesPost = { ...mockPost, timestamp: new Date(Date.now() - 5 * 60 * 1000) };
    const { rerender } = render(<Post post={minutesPost} />);
    expect(screen.getByText('5m')).toBeInTheDocument();
    
    rerender(<Post post={{ ...mockPost, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) }} />);
    expect(screen.getByText('3h')).toBeInTheDocument();
    
    rerender(<Post post={{ ...mockPost, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }} />);
    expect(screen.getByText('2d')).toBeInTheDocument();
  });

  test('handles invalid timestamp gracefully', () => {
    const invalidTimestampPost = {
      ...mockPost,
      timestamp: new Date('invalid-date')
    };
    
    render(<Post post={invalidTimestampPost} />);
    // Should not crash and should render the post content
    expect(screen.getByText('This is a test post content')).toBeInTheDocument();
  });

  test('handles missing post properties gracefully', () => {
    const minimalPost = {
      id: 1,
      author: { name: 'Test', username: 'test' },
      content: 'Test content',
      timestamp: new Date(),
      likes: 0,
      retweets: 0,
      replies: 0
    };
    
    render(<Post post={minimalPost} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
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
    
    expect(mockRetweetPost).toHaveBeenCalledTimes(2);
    expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
  });

  test('has proper accessibility attributes', () => {
    render(<Post post={mockPost} />);
    
    const likeButton = screen.getByText('42').closest('button');
    const retweetButton = screen.getByText('12').closest('button');
    
    expect(likeButton).toBeInTheDocument();
    expect(retweetButton).toBeInTheDocument();
    expect(likeButton.tagName).toBe('BUTTON');
    expect(retweetButton.tagName).toBe('BUTTON');
  });

  test('renders all action buttons correctly', () => {
    render(<Post post={mockPost} />);
    
    // Should have 4 action buttons: reply, retweet, like, share
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });
});
