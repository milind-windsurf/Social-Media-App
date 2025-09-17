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

  test('formats timestamp correctly for "now" case', () => {
    const now = new Date();
    const nowPost = {
      ...mockPost,
      timestamp: new Date(now.getTime() - 30000)
    };
    render(<Post post={nowPost} />);
    expect(screen.getByText('now')).toBeInTheDocument();
  });

  test('formats timestamp correctly for minutes case', () => {
    const now = new Date();
    const minutesPost = {
      ...mockPost,
      timestamp: new Date(now.getTime() - 5 * 60 * 1000)
    };
    render(<Post post={minutesPost} />);
    expect(screen.getByText('5m')).toBeInTheDocument();
  });

  test('formats timestamp correctly for hours case', () => {
    const now = new Date();
    const hoursPost = {
      ...mockPost,
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000)
    };
    render(<Post post={hoursPost} />);
    expect(screen.getByText('3h')).toBeInTheDocument();
  });

  test('formats timestamp correctly for days case', () => {
    const now = new Date();
    const daysPost = {
      ...mockPost,
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    };
    render(<Post post={daysPost} />);
    expect(screen.getByText('2d')).toBeInTheDocument();
  });

  test('handles edge case for exactly 1 minute', () => {
    const now = new Date();
    const oneMinutePost = {
      ...mockPost,
      timestamp: new Date(now.getTime() - 60 * 1000)
    };
    render(<Post post={oneMinutePost} />);
    expect(screen.getByText('1m')).toBeInTheDocument();
  });

  test('handles edge case for exactly 1 hour', () => {
    const now = new Date();
    const oneHourPost = {
      ...mockPost,
      timestamp: new Date(now.getTime() - 60 * 60 * 1000)
    };
    render(<Post post={oneHourPost} />);
    expect(screen.getByText('1h')).toBeInTheDocument();
  });

  test('handles edge case for exactly 24 hours', () => {
    const now = new Date();
    const oneDayPost = {
      ...mockPost,
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000)
    };
    render(<Post post={oneDayPost} />);
    expect(screen.getByText('1d')).toBeInTheDocument();
  });
});
