import { render, screen } from '@testing-library/react';
import { Timeline } from './Timeline';
import { PostsProvider } from '@/context/PostsContext';

jest.mock('./Post', () => ({
  Post: ({ post }) => (
    <div data-testid={`post-${post.id}`}>
      <div>{post.content}</div>
      <div>{post.author.name}</div>
    </div>
  ),
}));

describe('Timeline', () => {
  const renderWithProvider = (component) => {
    return render(<PostsProvider>{component}</PostsProvider>);
  };

  describe('rendering', () => {
    it('should render the timeline', () => {
      renderWithProvider(<Timeline />);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('should render header with title', () => {
      renderWithProvider(<Timeline />);
      const header = screen.getByText('Home');
      expect(header).toHaveClass('text-xl', 'heading-1', 'text-gray-900');
    });

    it('should render all posts', () => {
      renderWithProvider(<Timeline />);
      const posts = screen.getAllByTestId(/^post-/);
      expect(posts.length).toBeGreaterThan(0);
    });

    it('should render posts in correct order', () => {
      renderWithProvider(<Timeline />);
      const posts = screen.getAllByTestId(/^post-/);
      expect(posts.length).toBe(20);
    });
  });

  describe('header styling', () => {
    it('should have sticky header', () => {
      renderWithProvider(<Timeline />);
      const header = screen.getByText('Home').closest('div');
      expect(header).toHaveClass('sticky', 'top-0');
    });

    it('should have backdrop blur on header', () => {
      renderWithProvider(<Timeline />);
      const header = screen.getByText('Home').closest('div');
      expect(header).toHaveClass('bg-white/80', 'backdrop-blur-md');
    });

    it('should have border on header', () => {
      renderWithProvider(<Timeline />);
      const header = screen.getByText('Home').closest('div');
      expect(header).toHaveClass('border-b', 'border-gray-200');
    });

    it('should have proper padding on header', () => {
      renderWithProvider(<Timeline />);
      const header = screen.getByText('Home').closest('div');
      expect(header).toHaveClass('px-6', 'py-4');
    });
  });

  describe('container styling', () => {
    it('should have full width', () => {
      const { container } = renderWithProvider(<Timeline />);
      const timelineContainer = container.firstChild;
      expect(timelineContainer).toHaveClass('w-full');
    });

    it('should have white background', () => {
      const { container } = renderWithProvider(<Timeline />);
      const timelineContainer = container.firstChild;
      expect(timelineContainer).toHaveClass('bg-white');
    });

    it('should have border on sides', () => {
      const { container } = renderWithProvider(<Timeline />);
      const timelineContainer = container.firstChild;
      expect(timelineContainer).toHaveClass('border-x', 'border-gray-200');
    });

    it('should have min-h-screen', () => {
      const { container } = renderWithProvider(<Timeline />);
      const timelineContainer = container.firstChild;
      expect(timelineContainer).toHaveClass('min-h-screen');
    });
  });

  describe('posts container', () => {
    it('should have divider between posts', () => {
      renderWithProvider(<Timeline />);
      const postsContainer = screen.getAllByTestId(/^post-/)[0].parentElement;
      expect(postsContainer).toHaveClass('divide-y', 'divide-gray-200');
    });
  });

  describe('empty state', () => {
    it('should show empty state when no posts', () => {
      const EmptyPostsProvider = ({ children }) => {
        const mockContext = {
          posts: [],
          addPost: jest.fn(),
          likePost: jest.fn(),
          retweetPost: jest.fn(),
        };
        return (
          <div>
            {children}
          </div>
        );
      };

      jest.spyOn(require('@/context/PostsContext'), 'usePosts').mockReturnValue({
        posts: [],
        addPost: jest.fn(),
        likePost: jest.fn(),
        retweetPost: jest.fn(),
      });

      render(<Timeline />);
      
      expect(screen.getByText('No posts to show yet.')).toBeInTheDocument();
      
      jest.restoreAllMocks();
    });

    it('should have proper styling for empty state', () => {
      jest.spyOn(require('@/context/PostsContext'), 'usePosts').mockReturnValue({
        posts: [],
        addPost: jest.fn(),
        likePost: jest.fn(),
        retweetPost: jest.fn(),
      });

      render(<Timeline />);
      
      const emptyState = screen.getByText('No posts to show yet.').closest('div');
      expect(emptyState).toHaveClass('p-8', 'text-center', 'text-gray-500');
      
      jest.restoreAllMocks();
    });

    it('should have text-accent class on empty state text', () => {
      jest.spyOn(require('@/context/PostsContext'), 'usePosts').mockReturnValue({
        posts: [],
        addPost: jest.fn(),
        likePost: jest.fn(),
        retweetPost: jest.fn(),
      });

      render(<Timeline />);
      
      const emptyStateText = screen.getByText('No posts to show yet.');
      expect(emptyStateText).toHaveClass('text-accent');
      
      jest.restoreAllMocks();
    });
  });

  describe('post rendering', () => {
    it('should pass correct post data to Post component', () => {
      renderWithProvider(<Timeline />);
      
      const firstPost = screen.getByTestId('post-1');
      expect(firstPost).toBeInTheDocument();
    });

    it('should render posts with unique keys', () => {
      renderWithProvider(<Timeline />);
      
      const posts = screen.getAllByTestId(/^post-/);
      const postIds = posts.map(post => post.getAttribute('data-testid'));
      const uniqueIds = new Set(postIds);
      
      expect(uniqueIds.size).toBe(posts.length);
    });
  });

  describe('integration with PostsContext', () => {
    it('should use posts from context', () => {
      renderWithProvider(<Timeline />);
      
      const posts = screen.getAllByTestId(/^post-/);
      expect(posts.length).toBe(20);
    });

    it('should display post content from context', () => {
      renderWithProvider(<Timeline />);
      
      expect(screen.getByText(/Just built an amazing Next.js app/)).toBeInTheDocument();
    });

    it('should display post authors from context', () => {
      renderWithProvider(<Timeline />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('should render header before posts', () => {
      const { container } = renderWithProvider(<Timeline />);
      
      const header = screen.getByText('Home');
      const firstPost = screen.getAllByTestId(/^post-/)[0];
      
      const headerPosition = Array.from(container.querySelectorAll('*')).indexOf(header.parentElement);
      const postPosition = Array.from(container.querySelectorAll('*')).indexOf(firstPost);
      
      expect(headerPosition).toBeLessThan(postPosition);
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProvider(<Timeline />);
      
      const heading = screen.getByText('Home');
      expect(heading.tagName).toBe('H1');
    });
  });

  describe('responsive behavior', () => {
    it('should maintain structure with different numbers of posts', () => {
      renderWithProvider(<Timeline />);
      
      const posts = screen.getAllByTestId(/^post-/);
      expect(posts.length).toBeGreaterThan(0);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });
});
