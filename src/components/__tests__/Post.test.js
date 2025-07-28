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

    test('shows minutes for posts 1-59 minutes old', () => {
      const minutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      };

      render(<Post post={minutesPost} />);
      expect(screen.getByText('15m')).toBeInTheDocument();
    });

    test('shows hours for posts 1-23 hours old', () => {
      const hoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      };

      render(<Post post={hoursPost} />);
      expect(screen.getByText('5h')).toBeInTheDocument();
    });

    test('shows days for posts 24+ hours old', () => {
      const daysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      };

      render(<Post post={daysPost} />);
      expect(screen.getByText('3d')).toBeInTheDocument();
    });

    test('handles edge case of exactly 1 minute', () => {
      const exactMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000) // exactly 1 minute ago
      };

      render(<Post post={exactMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();
    });

    test('handles edge case of exactly 1 hour', () => {
      const exactHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000) // exactly 1 hour ago
      };

      render(<Post post={exactHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    test('handles edge case of exactly 1 day', () => {
      const exactDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // exactly 1 day ago
      };

      render(<Post post={exactDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });
  });

  describe('button interactions', () => {
    test('reply button renders correctly without onClick handler', () => {
      render(<Post post={mockPost} />);
      
      const replyButton = screen.getByText('5').closest('button');
      expect(replyButton).toBeInTheDocument();
      expect(replyButton).toHaveClass('text-gray-500', 'hover:text-blue-500');
      
      const svgIcon = replyButton.querySelector('svg');
      expect(svgIcon).toBeInTheDocument();
      expect(svgIcon).toHaveClass('w-4', 'h-4');
    });

    test('share button renders correctly without onClick handler', () => {
      render(<Post post={mockPost} />);
      
      const shareButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg path[d*="M8.684 13.342"]')
      );
      expect(shareButton).toBeInTheDocument();
      expect(shareButton).toHaveClass('text-gray-500', 'hover:text-blue-500');
      
      const svgIcon = shareButton.querySelector('svg');
      expect(svgIcon).toBeInTheDocument();
      expect(svgIcon).toHaveClass('w-4', 'h-4');
    });

    test('all action buttons have proper hover states', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      
      expect(buttons[0]).toHaveClass('hover:text-blue-500');
      
      expect(buttons[1]).toHaveClass('hover:text-green-500');
      
      expect(buttons[2]).toHaveClass('hover:text-red-500');
      
      expect(buttons[3]).toHaveClass('hover:text-blue-500');
    });
  });

  describe('error handling', () => {
    test('handles missing author name gracefully', () => {
      const postWithoutAuthorName = {
        ...mockPost,
        author: {
          username: 'testuser'
        }
      };

      render(<Post post={postWithoutAuthorName} />);
      
      // Should still render other content
      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles missing author username gracefully', () => {
      const postWithoutUsername = {
        ...mockPost,
        author: {
          name: 'Test User'
        }
      };

      render(<Post post={postWithoutUsername} />);
      
      // Should still render author name in h3 element
      expect(screen.getByRole('heading', { level: 3, name: 'Test User' })).toBeInTheDocument();
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });

    test('handles missing content gracefully', () => {
      const postWithoutContent = {
        ...mockPost,
        content: undefined
      };

      render(<Post post={postWithoutContent} />);
      
      // Should still render author info
      expect(screen.getByRole('heading', { level: 3, name: 'Test User' })).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('handles zero interaction counts', () => {
      const postWithZeroCounts = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };

      render(<Post post={postWithZeroCounts} />);
      
      // Should display zero counts
      expect(screen.getAllByText('0')).toHaveLength(3);
    });

    test('handles invalid timestamp gracefully', () => {
      const postWithInvalidTimestamp = {
        ...mockPost,
        timestamp: new Date('invalid-date')
      };

      render(<Post post={postWithInvalidTimestamp} />);
      
      // Should still render other content
      expect(screen.getByRole('heading', { level: 3, name: 'Test User' })).toBeInTheDocument();
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
      expect(screen.getByText('NaNd')).toBeInTheDocument();
    });
  });

  describe('accessibility and rendering', () => {
    test('all buttons are accessible', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
      
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('disabled');
      });
    });

    test('SVG icons render correctly in all buttons', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const svg = button.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('fill', 'none');
        expect(svg).toHaveAttribute('stroke', 'currentColor');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      });
    });

    test('hover background classes are applied correctly', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      
      const replyDiv = buttons[0].querySelector('.group-hover\\:bg-blue-50');
      const retweetDiv = buttons[1].querySelector('.group-hover\\:bg-green-50');
      const likeDiv = buttons[2].querySelector('.group-hover\\:bg-red-50');
      const shareDiv = buttons[3].querySelector('.group-hover\\:bg-blue-50');
      
      expect(replyDiv).toBeInTheDocument();
      expect(retweetDiv).toBeInTheDocument();
      expect(likeDiv).toBeInTheDocument();
      expect(shareDiv).toBeInTheDocument();
    });

    test('post container has proper styling classes', () => {
      render(<Post post={mockPost} />);
      
      const postContainer = screen.getByText('This is a test post content').closest('.border-b');
      expect(postContainer).toHaveClass(
        'border-b',
        'border-gray-200',
        'px-6',
        'py-4',
        'hover:bg-gray-50',
        'transition-colors',
        'w-full'
      );
    });
  });
});
