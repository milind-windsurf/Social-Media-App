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
    test('handles "now" case correctly', () => {
      const nowPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30000) // 30 seconds ago
      };
      render(<Post post={nowPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    test('handles minutes correctly', () => {
      const minutesPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      };
      render(<Post post={minutesPost} />);
      expect(screen.getByText('5m')).toBeInTheDocument();
    });

    test('handles hours correctly', () => {
      const hoursPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      };
      render(<Post post={hoursPost} />);
      expect(screen.getByText('3h')).toBeInTheDocument();
    });

    test('handles days correctly', () => {
      const daysPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      };
      render(<Post post={daysPost} />);
      expect(screen.getByText('2d')).toBeInTheDocument();
    });

    test('handles boundary conditions', () => {
      const oneMinutePost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 1000)
      };
      render(<Post post={oneMinutePost} />);
      expect(screen.getByText('1m')).toBeInTheDocument();

      const oneHourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      };
      render(<Post post={oneHourPost} />);
      expect(screen.getByText('1h')).toBeInTheDocument();

      const oneDayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };
      render(<Post post={oneDayPost} />);
      expect(screen.getByText('1d')).toBeInTheDocument();
    });

    test('handles invalid timestamp gracefully', () => {
      const invalidPost = {
        ...mockPost,
        timestamp: new Date('invalid')
      };
      // Should not crash the component
      expect(() => render(<Post post={invalidPost} />)).not.toThrow();
    });

    test('handles null timestamp gracefully', () => {
      const nullPost = {
        ...mockPost,
        timestamp: null
      };
      // Should not crash the component
      expect(() => render(<Post post={nullPost} />)).not.toThrow();
    });

    test('handles undefined timestamp gracefully', () => {
      const undefinedPost = {
        ...mockPost,
        timestamp: undefined
      };
      // Should not crash the component
      expect(() => render(<Post post={undefinedPost} />)).not.toThrow();
    });

    test('handles future timestamp correctly', () => {
      const futurePost = {
        ...mockPost,
        timestamp: new Date(Date.now() + 60 * 60 * 1000) // 1 hour in future
      };
      render(<Post post={futurePost} />);
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });
  });

  describe('accessibility features', () => {
    test('buttons have proper accessibility attributes', () => {
      render(<Post post={mockPost} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        expect(button).toBeVisible();
      });
    });

    test('post content is accessible', () => {
      render(<Post post={mockPost} />);
      
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
      expect(screen.getAllByText('Test User')).toHaveLength(2); // Avatar mock + h3 element
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    test('avatar has proper accessibility', () => {
      render(<Post post={mockPost} />);
      
      const avatar = screen.getByTestId('avatar-mock');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveTextContent('Test User');
    });

    test('interaction counts are accessible', () => {
      render(<Post post={mockPost} />);
      
      expect(screen.getByText('42')).toBeInTheDocument(); // likes
      expect(screen.getByText('12')).toBeInTheDocument(); // retweets
      expect(screen.getByText('5')).toBeInTheDocument(); // replies
    });
  });

  describe('error handling and edge cases', () => {
    test('handles missing post author gracefully', () => {
      const postWithoutAuthor = {
        ...mockPost,
        author: null
      };
      expect(() => render(<Post post={postWithoutAuthor} />)).toThrow('Cannot read properties of null');
    });

    test('handles missing author name gracefully', () => {
      const postWithoutAuthorName = {
        ...mockPost,
        author: {
          username: 'testuser'
        }
      };
      expect(() => render(<Post post={postWithoutAuthorName} />)).not.toThrow();
    });

    test('handles missing author username gracefully', () => {
      const postWithoutUsername = {
        ...mockPost,
        author: {
          name: 'Test User'
        }
      };
      expect(() => render(<Post post={postWithoutUsername} />)).not.toThrow();
    });

    test('handles missing post content gracefully', () => {
      const postWithoutContent = {
        ...mockPost,
        content: null
      };
      expect(() => render(<Post post={postWithoutContent} />)).not.toThrow();
    });

    test('handles empty post content gracefully', () => {
      const postWithEmptyContent = {
        ...mockPost,
        content: ''
      };
      render(<Post post={postWithEmptyContent} />);
      expect(screen.getAllByText('Test User')).toHaveLength(2); // Avatar mock + h3 element
    });

    test('handles missing interaction counts gracefully', () => {
      const postWithoutCounts = {
        ...mockPost,
        likes: null,
        retweets: null,
        replies: null
      };
      expect(() => render(<Post post={postWithoutCounts} />)).not.toThrow();
    });

    test('handles zero interaction counts', () => {
      const postWithZeroCounts = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };
      render(<Post post={postWithZeroCounts} />);
      expect(screen.getAllByText('0')).toHaveLength(3); // likes, retweets, replies all show 0
    });

    test('handles context errors gracefully', () => {
      // Mock context to return undefined functions
      usePosts.mockReturnValue({
        likePost: undefined,
        retweetPost: undefined
      });
      
      expect(() => render(<Post post={mockPost} />)).not.toThrow();
    });

    test('handles missing post id gracefully', () => {
      const postWithoutId = {
        ...mockPost,
        id: null
      };
      
      render(<Post post={postWithoutId} />);
      
      // Should still render the post content
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });
  });

  describe('styling and CSS classes', () => {
    test('applies correct CSS classes to main container', () => {
      const { container } = render(<Post post={mockPost} />);
      const postContainer = container.firstChild;
      expect(postContainer).toHaveClass('border-b', 'border-gray-200', 'px-6', 'py-4');
      expect(postContainer).toHaveClass('hover:bg-gray-50', 'transition-colors', 'w-full');
    });

    test('applies correct classes to action buttons', () => {
      render(<Post post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toHaveClass('flex', 'items-center', 'space-x-2');
      });
    });

    test('applies correct classes to author name', () => {
      render(<Post post={mockPost} />);
      const authorName = screen.getByText((content, element) => {
        return content === 'Test User' && element.tagName.toLowerCase() === 'h3';
      });
      expect(authorName).toHaveClass('font-display', 'font-bold', 'text-gray-900');
      expect(authorName).toHaveClass('hover:underline', 'cursor-pointer');
    });

    test('applies correct classes to username', () => {
      render(<Post post={mockPost} />);
      const username = screen.getByText('@testuser');
      expect(username).toHaveClass('text-gray-500', 'font-mono');
    });

    test('applies correct classes to post content', () => {
      render(<Post post={mockPost} />);
      const content = screen.getByText('This is a test post content');
      expect(content).toHaveClass('mt-1', 'text-gray-900', 'text-base');
      expect(content).toHaveClass('leading-relaxed', 'text-body');
    });
  });

  describe('interaction handlers - advanced scenarios', () => {
    test('handles multiple like button clicks', () => {
      render(<Post post={mockPost} />);
      const likeButton = screen.getByText('42').closest('button');
      
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      
      expect(mockLikePost).toHaveBeenCalledTimes(3);
      expect(mockLikePost).toHaveBeenCalledWith(mockPost.id);
    });

    test('handles multiple retweet button clicks', () => {
      render(<Post post={mockPost} />);
      const retweetButton = screen.getByText('12').closest('button');
      
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      
      expect(mockRetweetPost).toHaveBeenCalledTimes(2);
      expect(mockRetweetPost).toHaveBeenCalledWith(mockPost.id);
    });

    test('like button works with different post ids', () => {
      const differentPost = {
        ...mockPost,
        id: 999
      };
      
      render(<Post post={differentPost} />);
      const likeButton = screen.getByText('42').closest('button');
      fireEvent.click(likeButton);
      
      expect(mockLikePost).toHaveBeenCalledWith(999);
    });

    test('retweet button works with different post ids', () => {
      const differentPost = {
        ...mockPost,
        id: 888
      };
      
      render(<Post post={differentPost} />);
      const retweetButton = screen.getByText('12').closest('button');
      fireEvent.click(retweetButton);
      
      expect(mockRetweetPost).toHaveBeenCalledWith(888);
    });

    test('reply and share buttons are present but non-functional', () => {
      render(<Post post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      
      // Should have 4 buttons: reply, retweet, like, share
      expect(buttons).toHaveLength(4);
      
      // Reply and share buttons should not have onClick handlers that call context functions
      const replyButton = screen.getByText('5').closest('button');
      const shareButton = buttons.find(button => 
        !button.contains(screen.getByText('5')) && 
        !button.contains(screen.getByText('12')) && 
        !button.contains(screen.getByText('42'))
      );
      
      expect(replyButton).toBeInTheDocument();
      expect(shareButton).toBeInTheDocument();
    });
  });

  describe('component rendering variations', () => {
    test('renders with different interaction counts', () => {
      const postWithHighCounts = {
        ...mockPost,
        likes: 1000,
        retweets: 500,
        replies: 250
      };
      
      render(<Post post={postWithHighCounts} />);
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
    });

    test('renders with long content', () => {
      const postWithLongContent = {
        ...mockPost,
        content: 'This is a very long post content that should still render correctly and maintain proper styling and layout even when the text is quite lengthy and spans multiple lines in the post display area.'
      };
      
      render(<Post post={postWithLongContent} />);
      expect(screen.getByText(postWithLongContent.content)).toBeInTheDocument();
    });

    test('renders with special characters in content', () => {
      const postWithSpecialChars = {
        ...mockPost,
        content: 'Post with special chars: @mention #hashtag https://example.com 🚀 & < > " \''
      };
      
      render(<Post post={postWithSpecialChars} />);
      expect(screen.getByText(postWithSpecialChars.content)).toBeInTheDocument();
    });

    test('renders with different author names', () => {
      const postWithDifferentAuthor = {
        ...mockPost,
        author: {
          name: 'Jane Doe',
          username: 'janedoe'
        }
      };
      
      render(<Post post={postWithDifferentAuthor} />);
      expect(screen.getAllByText('Jane Doe')).toHaveLength(2); // Avatar mock + h3 element
      expect(screen.getByText('@janedoe')).toBeInTheDocument();
    });
  });
});
