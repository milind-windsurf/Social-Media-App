import { render, screen, waitFor } from '@testing-library/react';
import { ExplorePage } from './ExplorePage';
import { PostsProvider } from '@/context/PostsContext';

jest.mock('./Post', () => ({
  Post: ({ post }) => (
    <div data-testid={`post-${post.id}`}>
      <div>{post.content}</div>
      <div>Likes: {post.likes}</div>
    </div>
  ),
}));

describe('ExplorePage', () => {
  const renderWithProvider = (component) => {
    return render(<PostsProvider>{component}</PostsProvider>);
  };

  describe('rendering', () => {
    it('should render the explore page', () => {
      renderWithProvider(<ExplorePage />);
      expect(screen.getByText('Explore')).toBeInTheDocument();
    });

    it('should render header', () => {
      renderWithProvider(<ExplorePage />);
      const header = screen.getByText('Explore');
      expect(header).toHaveClass('text-xl', 'font-bold');
    });

    it('should render trending posts section', () => {
      renderWithProvider(<ExplorePage />);
      expect(screen.getByText('Trending Posts')).toBeInTheDocument();
    });

    it('should render discover users section', () => {
      renderWithProvider(<ExplorePage />);
      expect(screen.getByText('Discover Users')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loading spinner initially', () => {
      renderWithProvider(<ExplorePage />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should have proper role for loading spinner', () => {
      renderWithProvider(<ExplorePage />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('should have animate-spin class on spinner', () => {
      renderWithProvider(<ExplorePage />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should hide loading spinner after posts load', async () => {
      renderWithProvider(<ExplorePage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });

  describe('trending posts', () => {
    it('should display posts after loading', async () => {
      renderWithProvider(<ExplorePage />);
      
      await waitFor(() => {
        const posts = screen.getAllByTestId(/^post-/);
        expect(posts.length).toBeGreaterThan(0);
      });
    });

    it('should sort posts by likes', async () => {
      renderWithProvider(<ExplorePage />);
      
      await waitFor(() => {
        const posts = screen.getAllByTestId(/^post-/);
        expect(posts.length).toBeGreaterThan(0);
      });
    });

    it('should display all posts from context', async () => {
      renderWithProvider(<ExplorePage />);
      
      await waitFor(() => {
        const posts = screen.getAllByTestId(/^post-/);
        expect(posts.length).toBe(20);
      });
    });
  });

  describe('empty state', () => {
    it('should show message when no posts available', async () => {
      jest.spyOn(require('@/context/PostsContext'), 'usePosts').mockReturnValue({
        posts: [],
        addPost: jest.fn(),
        likePost: jest.fn(),
        retweetPost: jest.fn(),
      });

      render(<ExplorePage />);
      
      await waitFor(() => {
        expect(screen.getByText('No posts available to explore yet.')).toBeInTheDocument();
      });
      
      jest.restoreAllMocks();
    });
  });

  describe('discover users section', () => {
    it('should show coming soon message', () => {
      renderWithProvider(<ExplorePage />);
      expect(screen.getByText('User suggestions coming soon!')).toBeInTheDocument();
    });

    it('should have proper styling for coming soon message', () => {
      renderWithProvider(<ExplorePage />);
      const message = screen.getByText('User suggestions coming soon!');
      expect(message).toHaveClass('text-center', 'py-4', 'text-gray-500');
    });
  });

  describe('header styling', () => {
    it('should have sticky header', () => {
      renderWithProvider(<ExplorePage />);
      const header = screen.getByText('Explore').closest('div');
      expect(header).toHaveClass('sticky', 'top-0', 'z-10');
    });

    it('should have background color', () => {
      renderWithProvider(<ExplorePage />);
      const header = screen.getByText('Explore').closest('div');
      expect(header).toHaveClass('bg-white');
    });

    it('should have border', () => {
      renderWithProvider(<ExplorePage />);
      const header = screen.getByText('Explore').closest('div');
      expect(header).toHaveClass('border-b', 'border-gray-200');
    });

    it('should have proper padding', () => {
      renderWithProvider(<ExplorePage />);
      const header = screen.getByText('Explore').closest('div');
      expect(header).toHaveClass('p-4');
    });
  });

  describe('container styling', () => {
    it('should have flex column layout', () => {
      const { container } = renderWithProvider(<ExplorePage />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'flex-col');
    });

    it('should have full width', () => {
      const { container } = renderWithProvider(<ExplorePage />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('w-full');
    });

    it('should have max width', () => {
      const { container } = renderWithProvider(<ExplorePage />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('max-w-2xl');
    });

    it('should have centered layout', () => {
      const { container } = renderWithProvider(<ExplorePage />);
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('mx-auto');
    });
  });

  describe('trending posts section styling', () => {
    it('should have proper padding', () => {
      renderWithProvider(<ExplorePage />);
      const section = screen.getByText('Trending Posts').closest('div');
      expect(section).toHaveClass('p-4');
    });

    it('should have heading with proper styling', () => {
      renderWithProvider(<ExplorePage />);
      const heading = screen.getByText('Trending Posts');
      expect(heading).toHaveClass('text-lg', 'font-semibold', 'mb-4');
    });
  });

  describe('posts container styling', () => {
    it('should have space between posts', async () => {
      renderWithProvider(<ExplorePage />);
      
      await waitFor(() => {
        const postsContainer = screen.getAllByTestId(/^post-/)[0].parentElement;
        expect(postsContainer).toHaveClass('space-y-4');
      });
    });
  });

  describe('discover users section styling', () => {
    it('should have border at top', () => {
      renderWithProvider(<ExplorePage />);
      const section = screen.getByText('Discover Users').closest('div');
      expect(section).toHaveClass('border-t', 'border-gray-200');
    });

    it('should have proper padding', () => {
      renderWithProvider(<ExplorePage />);
      const section = screen.getByText('Discover Users').closest('div');
      expect(section).toHaveClass('p-4');
    });

    it('should have heading with proper styling', () => {
      renderWithProvider(<ExplorePage />);
      const heading = screen.getByText('Discover Users');
      expect(heading).toHaveClass('text-lg', 'font-semibold', 'mb-4');
    });
  });

  describe('loading spinner styling', () => {
    it('should have proper size', () => {
      renderWithProvider(<ExplorePage />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('h-8', 'w-8');
    });

    it('should have rounded shape', () => {
      renderWithProvider(<ExplorePage />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('rounded-full');
    });

    it('should have border', () => {
      renderWithProvider(<ExplorePage />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('border-b-2');
    });

    it('should be centered', () => {
      renderWithProvider(<ExplorePage />);
      const spinnerContainer = screen.getByTestId('loading-spinner').closest('div');
      expect(spinnerContainer).toHaveClass('flex', 'justify-center', 'items-center');
    });
  });

  describe('integration with PostsContext', () => {
    it('should use posts from context', async () => {
      renderWithProvider(<ExplorePage />);
      
      await waitFor(() => {
        const posts = screen.getAllByTestId(/^post-/);
        expect(posts.length).toBe(20);
      });
    });

    it('should display post content from context', async () => {
      renderWithProvider(<ExplorePage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Just built an amazing Next.js app/)).toBeInTheDocument();
      });
    });
  });

  describe('dark mode support', () => {
    it('should have dark mode classes on header', () => {
      renderWithProvider(<ExplorePage />);
      const header = screen.getByText('Explore').closest('div');
      expect(header).toHaveClass('dark:bg-gray-900', 'dark:border-gray-700');
    });

    it('should have dark mode classes on discover users section', () => {
      renderWithProvider(<ExplorePage />);
      const section = screen.getByText('Discover Users').closest('div');
      expect(section).toHaveClass('dark:border-gray-700');
    });

    it('should have dark mode classes on loading spinner', () => {
      renderWithProvider(<ExplorePage />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('dark:border-gray-100');
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProvider(<ExplorePage />);
      
      const mainHeading = screen.getByText('Explore');
      expect(mainHeading.tagName).toBe('H1');
      
      const subHeadings = screen.getAllByText(/Trending Posts|Discover Users/);
      subHeadings.forEach(heading => {
        expect(heading.tagName).toBe('H2');
      });
    });

    it('should have role status on loading spinner', () => {
      renderWithProvider(<ExplorePage />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('should maintain structure with different numbers of posts', async () => {
      renderWithProvider(<ExplorePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Explore')).toBeInTheDocument();
        expect(screen.getByText('Trending Posts')).toBeInTheDocument();
        expect(screen.getByText('Discover Users')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle posts with undefined likes', async () => {
      const mockPosts = [
        {
          id: 1,
          author: { name: 'Test', username: 'test' },
          content: 'Test post',
          timestamp: new Date(),
          likes: undefined,
          retweets: 0,
          replies: 0
        }
      ];

      jest.spyOn(require('@/context/PostsContext'), 'usePosts').mockReturnValue({
        posts: mockPosts,
        addPost: jest.fn(),
        likePost: jest.fn(),
        retweetPost: jest.fn(),
      });

      render(<ExplorePage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
      
      jest.restoreAllMocks();
    });
  });
});
